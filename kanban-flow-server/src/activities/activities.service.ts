import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListActivitiesDto } from './dto/list-activities.dto.js';

const ACTIVITY_INCLUDE = {
  user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
  task: {
    select: {
      id: true,
      title: true,
      column: { select: { id: true, title: true } },
    },
  },
} satisfies Prisma.ActivityLogInclude;

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForBoard(boardId: string, dto: ListActivitiesDto) {
    const where: Prisma.ActivityLogWhereInput = {
      boardId,
      type: dto.type,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        include: ACTIVITY_INCLUDE,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: dto.offset,
        take: dto.limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      items,
      total,
      limit: dto.limit,
      offset: dto.offset,
    };
  }
}