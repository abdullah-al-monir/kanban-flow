import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoardRole } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BoardAccessGuard } from '../boards/guards/board-access.guard.js';
import { RequireBoardRole } from '../boards/guards/require-board-role.decorator.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BoardAccessGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @RequireBoardRole(BoardRole.EDITOR)
  @Post('columns/:columnId/tasks')
  create(
    @Param('columnId') columnId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(columnId, user.userId, dto);
  }

  @Get('tasks/:taskId')
  findOne(@Param('taskId') taskId: string) {
    return this.tasksService.findOne(taskId);
  }

  @RequireBoardRole(BoardRole.EDITOR)
  @Patch('tasks/:taskId')
  update(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, user.userId, dto);
  }

  @RequireBoardRole(BoardRole.EDITOR)
  @Delete('tasks/:taskId')
  remove(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.remove(taskId, user.userId);
  }

  @RequireBoardRole(BoardRole.EDITOR)
  @Post('tasks/:taskId/move')
  move(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(taskId, user.userId, dto);
  }
}
