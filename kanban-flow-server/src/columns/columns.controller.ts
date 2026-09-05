import {
  Body,
  Controller,
  Delete,
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
import { ColumnsService } from './columns.service.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { ReorderColumnDto } from './dto/reorder-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';

@ApiTags('columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BoardAccessGuard)
@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @RequireBoardRole(BoardRole.EDITOR)
  @Post('boards/:boardId/columns')
  create(
    @Param('boardId') boardId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(boardId, user.userId, dto);
  }

  @RequireBoardRole(BoardRole.EDITOR)
  @Patch('columns/:columnId')
  update(
    @Param('columnId') columnId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(columnId, user.userId, dto);
  }

  @RequireBoardRole(BoardRole.EDITOR)
  @Delete('columns/:columnId')
  remove(
    @Param('columnId') columnId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.columnsService.remove(columnId, user.userId);
  }

  @RequireBoardRole(BoardRole.EDITOR)
  @Post('columns/:columnId/reorder')
  reorder(
    @Param('columnId') columnId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderColumnDto,
  ) {
    return this.columnsService.reorder(columnId, user.userId, dto);
  }
}
