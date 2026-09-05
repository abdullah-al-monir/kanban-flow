import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          title: dto.title,
          description: dto.description,
          ownerId: userId,
        },
      });

      await tx.boardMember.create({
        data: { boardId: board.id, userId, role: BoardRole.OWNER },
      });

      await tx.column.createMany({
        data: [
          { boardId: board.id, title: 'To Do', position: 1000 },
          { boardId: board.id, title: 'In Progress', position: 2000 },
          { boardId: board.id, title: 'Done', position: 3000 },
        ],
      });

      return board;
    });
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.boardMember.findMany({
      where: { userId },
      include: {
        board: {
          include: { _count: { select: { columns: true, members: true } } },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships
      .filter((m) => !m.board.isArchived)
      .map((m) => ({ ...m.board, myRole: m.role }));
  }

  async findArchivedForUser(userId: string) {
    const memberships = await this.prisma.boardMember.findMany({
      where: { userId, role: BoardRole.OWNER, board: { isArchived: true } },
      include: {
        board: {
          include: { _count: { select: { columns: true, members: true } } },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((membership) => ({
      ...membership.board,
      myRole: membership.role,
    }));
  }

  async findOne(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        labels: true,
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                assignee: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
                labels: { include: { label: true } },
              },
            },
          },
        },
      },
    });

    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(boardId: string, actorUserId: string, dto: UpdateBoardDto) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.findUnique({ where: { id: boardId } });
      if (!board) throw new NotFoundException('Board not found');

      const updated = await tx.board.update({
        where: { id: boardId },
        data: dto,
      });

      await tx.activityLog.create({
        data: {
          boardId,
          userId: actorUserId,
          type: 'BOARD_UPDATED',
          payload: {
            previousTitle: board.title,
            title: updated.title,
            previousDescription: board.description,
            description: updated.description,
            previousIsArchived: board.isArchived,
            isArchived: updated.isArchived,
          },
        },
      });

      return updated;
    });
  }

  async restore(boardId: string, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.findUnique({ where: { id: boardId } });
      if (!board) throw new NotFoundException('Board not found');

      if (!board.isArchived) return board;

      const restored = await tx.board.update({
        where: { id: boardId },
        data: { isArchived: false },
      });

      await tx.activityLog.create({
        data: {
          boardId,
          userId: actorUserId,
          type: 'BOARD_UPDATED',
          payload: {
            previousIsArchived: true,
            isArchived: false,
            action: 'RESTORED',
          },
        },
      });

      return restored;
    });
  }

  async remove(boardId: string, requesterRole: BoardRole) {
    if (requesterRole !== BoardRole.OWNER) {
      throw new ForbiddenException('Only the board owner can delete the board');
    }
    await this.assertBoardExists(boardId);
    await this.prisma.board.delete({ where: { id: boardId } });
    return { success: true };
  }

  async listMembers(boardId: string) {
    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(boardId: string, dto: AddMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user)
      throw new NotFoundException('No registered user with that email');

    const role = dto.role ?? BoardRole.EDITOR;
    if (role === BoardRole.OWNER) {
      throw new BadRequestException(
        'Use the transfer-ownership action to assign a new owner',
      );
    }

    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.id } },
    });
    if (existing)
      throw new ConflictException('User is already a member of this board');

    const member = await this.prisma.boardMember.create({
      data: { boardId, userId: user.id, role },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        boardId,
        userId: user.id,
        type: 'MEMBER_ADDED',
        payload: { role },
      },
    });

    return member;
  }

  async updateMemberRole(
    boardId: string,
    memberUserId: string,
    dto: UpdateMemberDto,
  ) {
    const membership = await this.getMembership(boardId, memberUserId);

    if (membership.role === BoardRole.OWNER || dto.role === BoardRole.OWNER) {
      throw new BadRequestException(
        'Ownership cannot be changed here; use the transfer-ownership action',
      );
    }

    return this.prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId: memberUserId } },
      data: { role: dto.role },
    });
  }

  async removeMember(boardId: string, memberUserId: string) {
    const membership = await this.getMembership(boardId, memberUserId);
    if (membership.role === BoardRole.OWNER) {
      throw new BadRequestException('The board owner cannot be removed');
    }

    await this.prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId: memberUserId } },
    });

    await this.prisma.activityLog.create({
      data: { boardId, userId: memberUserId, type: 'MEMBER_REMOVED' },
    });

    return { success: true };
  }

  private async getMembership(boardId: string, userId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) throw new NotFoundException('Membership not found');
    return membership;
  }

  private async assertBoardExists(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }
}
