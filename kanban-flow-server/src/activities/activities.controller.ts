import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoardRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BoardAccessGuard } from '../boards/guards/board-access.guard.js';
import { RequireBoardRole } from '../boards/guards/require-board-role.decorator.js';
import { ActivitiesService } from './activities.service.js';
import { ListActivitiesDto } from './dto/list-activities.dto.js';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BoardAccessGuard)
@Controller('boards/:boardId/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @RequireBoardRole(BoardRole.ADMIN)
  list(@Param('boardId') boardId: string, @Query() dto: ListActivitiesDto) {
    return this.activitiesService.listForBoard(boardId, dto);
  }
}