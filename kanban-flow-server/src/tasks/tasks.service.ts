import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  computePosition,
  needsRebalance,
  rebalancedPositions,
} from '../common/utils/position.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

const TASK_INCLUDE = {
  assignee: {
    select: { id: true, fullName: true, email: true, avatarUrl: true },
  },
  creator: {
    select: { id: true, fullName: true, email: true, avatarUrl: true },
  },
  labels: { include: { label: true } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(columnId: string, creatorId: string, dto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Column not found');

    if (dto.assigneeId)
      await this.assertBoardMember(column.boardId, dto.assigneeId);

    const last = await this.prisma.task.findFirst({
      where: { columnId, isArchived: false },
      orderBy: { position: 'desc' },
    });
    const position = computePosition(last?.position ?? null, null);

    const task = await this.prisma.task.create({
      data: {
        columnId,
        creatorId,
        assigneeId: dto.assigneeId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position,
        labels: dto.labelIds?.length
          ? { create: dto.labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
      include: TASK_INCLUDE,
    });

    await this.prisma.activityLog.create({
      data: {
        boardId: column.boardId,
        taskId: task.id,
        userId: creatorId,
        type: 'TASK_CREATED',
      },
    });

    return task;
  }

  async findOne(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(taskId: string, actorUserId: string, dto: UpdateTaskDto) {
    const task = await this.assertExists(taskId);

    if (dto.assigneeId) {
      const column = await this.prisma.column.findUniqueOrThrow({
        where: { id: task.columnId },
      });
      await this.assertBoardMember(column.boardId, dto.assigneeId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.labelIds) {
        await tx.taskLabel.deleteMany({ where: { taskId } });
        if (dto.labelIds.length) {
          await tx.taskLabel.createMany({
            data: dto.labelIds.map((labelId) => ({ taskId, labelId })),
          });
        }
      }

      return tx.task.update({
        where: { id: taskId },
        data: {
          title: dto.title,
          description: dto.description,
          assigneeId: dto.assigneeId,
          dueDate:
            dto.dueDate === undefined
              ? undefined
              : dto.dueDate
                ? new Date(dto.dueDate)
                : null,
          isArchived: dto.isArchived,
        },
        include: TASK_INCLUDE,
      });
    });

    const column = await this.prisma.column.findUniqueOrThrow({
      where: { id: task.columnId },
    });
    await this.prisma.activityLog.create({
      data: {
        boardId: column.boardId,
        taskId,
        userId: actorUserId,
        type: dto.isArchived ? 'TASK_ARCHIVED' : 'TASK_UPDATED',
      },
    });

    return updated;
  }

  async remove(taskId: string, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundException('Task not found');

      const column = await tx.column.findUniqueOrThrow({
        where: { id: task.columnId },
      });
      await tx.task.delete({ where: { id: taskId } });

      await tx.activityLog.create({
        data: {
          boardId: column.boardId,
          userId: actorUserId,
          type: 'TASK_DELETED',
          payload: {
            taskId: task.id,
            title: task.title,
            columnId: task.columnId,
          },
        },
      });

      return { success: true };
    });
  }

  async move(taskId: string, actorUserId: string, dto: MoveTaskDto) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundException('Task not found');

      const [currentColumn, targetColumn] = await Promise.all([
        tx.column.findUniqueOrThrow({ where: { id: task.columnId } }),
        tx.column.findUnique({ where: { id: dto.targetColumnId } }),
      ]);
      if (!targetColumn) throw new NotFoundException('Target column not found');
      if (targetColumn.boardId !== currentColumn.boardId) {
        throw new BadRequestException(
          'Cannot move a task to a column on a different board',
        );
      }

      const siblings = await tx.task.findMany({
        where: {
          columnId: dto.targetColumnId,
          isArchived: false,
          NOT: { id: taskId },
        },
        orderBy: { position: 'asc' },
        select: { id: true, position: true },
      });

      const clampedIndex = Math.max(
        0,
        Math.min(dto.targetIndex, siblings.length),
      );
      const prevSibling = siblings[clampedIndex - 1] ?? null;
      const nextSibling = siblings[clampedIndex] ?? null;

      let position: number;
      if (
        needsRebalance(
          prevSibling?.position ?? null,
          nextSibling?.position ?? null,
        )
      ) {
        const orderedIds = siblings.map((s) => s.id);
        orderedIds.splice(clampedIndex, 0, taskId);
        const positions = rebalancedPositions(orderedIds.length);
        await Promise.all(
          orderedIds.map((id, i) =>
            id === taskId
              ? Promise.resolve()
              : tx.task.update({
                  where: { id },
                  data: { position: positions[i] },
                }),
          ),
        );
        position = positions[clampedIndex];
      } else {
        position = computePosition(
          prevSibling?.position ?? null,
          nextSibling?.position ?? null,
        );
      }

      const updated = await tx.task.update({
        where: { id: taskId },
        data: { columnId: dto.targetColumnId, position },
        include: TASK_INCLUDE,
      });

      await tx.activityLog.create({
        data: {
          boardId: currentColumn.boardId,
          taskId,
          userId: actorUserId,
          type: 'TASK_MOVED',
          payload: {
            fromColumnId: task.columnId,
            toColumnId: dto.targetColumnId,
            fromColumn: currentColumn.title,
            toColumn: targetColumn.title,
            toIndex: clampedIndex,
          },
        },
      });

      return updated;
    });
  }

  private async assertExists(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private async assertBoardMember(boardId: string, userId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) {
      throw new BadRequestException('Assignee must be a member of the board');
    }
  }
}
