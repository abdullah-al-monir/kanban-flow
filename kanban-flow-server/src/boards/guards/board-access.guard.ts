import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardRole } from '@prisma/client';
import { roleSatisfies } from '../../common/enums/role-hierarchy.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BOARD_ROLE_KEY } from './require-board-role.decorator.js';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { userId: string } | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const boardId = await this.resolveBoardId(request);
    if (!boardId) {
      throw new NotFoundException('Board not found');
    }

    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.userId } },
    });

    if (!membership) {
      throw new NotFoundException('Board not found');
    }

    const requiredRole = this.reflector.getAllAndOverride<
      BoardRole | undefined
    >(BOARD_ROLE_KEY, [context.getHandler(), context.getClass()]);

    if (requiredRole && !roleSatisfies(membership.role, requiredRole)) {
      throw new ForbiddenException(
        `This action requires ${requiredRole} access or higher on this board`,
      );
    }

    request.boardId = boardId;
    request.boardRole = membership.role;
    return true;
  }

  private async resolveBoardId(request: any): Promise<string | null> {
    const params = request.params ?? {};

    if (params.boardId) return params.boardId;

    if (params.columnId) {
      const column = await this.prisma.column.findUnique({
        where: { id: params.columnId },
        select: { boardId: true },
      });
      return column?.boardId ?? null;
    }

    if (params.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: params.taskId },
        select: { column: { select: { boardId: true } } },
      });
      return task?.column.boardId ?? null;
    }

    return null;
  }
}
