import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  computePosition,
  needsRebalance,
  rebalancedPositions,
} from '../common/utils/position.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { ReorderColumnDto } from './dto/reorder-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, actorUserId: string, dto: CreateColumnDto) {
    const last = await this.prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });
    const position = computePosition(last?.position ?? null, null);

    const column = await this.prisma.column.create({
      data: { boardId, title: dto.title, position },
    });

    await this.prisma.activityLog.create({
      data: {
        boardId,
        userId: actorUserId,
        type: 'COLUMN_CREATED',
        payload: { columnId: column.id, title: column.title },
      },
    });

    return column;
  }

  async update(columnId: string, actorUserId: string, dto: UpdateColumnDto) {
    const column = await this.assertExists(columnId);
    const updated = await this.prisma.column.update({
      where: { id: columnId },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        boardId: column.boardId,
        userId: actorUserId,
        type: 'COLUMN_UPDATED',
        payload: {
          columnId,
          previousTitle: column.title,
          title: updated.title,
        },
      },
    });

    return updated;
  }

  async remove(columnId: string, actorUserId: string) {
    const column = await this.assertExists(columnId);
    await this.prisma.column.delete({ where: { id: columnId } });

    await this.prisma.activityLog.create({
      data: {
        boardId: column.boardId,
        userId: actorUserId,
        type: 'COLUMN_DELETED',
        payload: { columnId, title: column.title },
      },
    });

    return { success: true };
  }

  async reorder(columnId: string, actorUserId: string, dto: ReorderColumnDto) {
    const column = await this.assertExists(columnId);

    const [before, after] = await Promise.all([
      dto.beforeColumnId
        ? this.prisma.column.findUnique({ where: { id: dto.beforeColumnId } })
        : null,
      dto.afterColumnId
        ? this.prisma.column.findUnique({ where: { id: dto.afterColumnId } })
        : null,
    ]);

    if (dto.beforeColumnId && (!before || before.boardId !== column.boardId)) {
      throw new BadRequestException(
        'beforeColumnId must belong to the same board',
      );
    }
    if (dto.afterColumnId && (!after || after.boardId !== column.boardId)) {
      throw new BadRequestException(
        'afterColumnId must belong to the same board',
      );
    }

    const prevPos = before?.position ?? null;
    const nextPos = after?.position ?? null;

    if (needsRebalance(prevPos, nextPos)) {
      const reordered = await this.rebalanceAndPlace(
        column.boardId,
        columnId,
        dto.beforeColumnId,
        dto.afterColumnId,
      );
      await this.recordReorder(
        column.boardId,
        columnId,
        column.title,
        actorUserId,
        dto,
      );
      return reordered;
    }

    const position = computePosition(prevPos, nextPos);
    const reordered = await this.prisma.column.update({
      where: { id: columnId },
      data: { position },
    });
    await this.recordReorder(
      column.boardId,
      columnId,
      column.title,
      actorUserId,
      dto,
    );
    return reordered;
  }

  private async recordReorder(
    boardId: string,
    columnId: string,
    columnTitle: string,
    actorUserId: string,
    dto: ReorderColumnDto,
  ) {
    await this.prisma.activityLog.create({
      data: {
        boardId,
        userId: actorUserId,
        type: 'COLUMN_REORDERED',
        payload: {
          columnId,
          title: columnTitle,
          beforeColumnId: dto.beforeColumnId,
          afterColumnId: dto.afterColumnId,
        },
      },
    });
  }

  private async rebalanceAndPlace(
    boardId: string,
    movingColumnId: string,
    beforeColumnId?: string,
    afterColumnId?: string,
  ) {
    const columns = await this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });

    const ordered = columns
      .filter((c) => c.id !== movingColumnId)
      .map((c) => c.id);
    const insertAt = beforeColumnId
      ? ordered.indexOf(beforeColumnId) + 1
      : afterColumnId
        ? ordered.indexOf(afterColumnId)
        : ordered.length;
    ordered.splice(insertAt, 0, movingColumnId);

    const positions = rebalancedPositions(ordered.length);
    await this.prisma.$transaction(
      ordered.map((id, i) =>
        this.prisma.column.update({
          where: { id },
          data: { position: positions[i] },
        }),
      ),
    );

    return this.prisma.column.findUnique({ where: { id: movingColumnId } });
  }

  private async assertExists(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Column not found');
    return column;
  }
}
