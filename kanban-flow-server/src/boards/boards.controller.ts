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
import { BoardsService } from './boards.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { BoardAccessGuard } from './guards/board-access.guard.js';
import { CurrentBoardRole } from './guards/current-board-role.decorator.js';
import { RequireBoardRole } from './guards/require-board-role.decorator.js';

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(user.userId, dto);
  }

  @Get()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.findAllForUser(user.userId);
  }

  @Get('archived')
  findArchived(@CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.findArchivedForUser(user.userId);
  }

  @UseGuards(BoardAccessGuard)
  @Get(':boardId')
  findOne(@Param('boardId') boardId: string) {
    return this.boardsService.findOne(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole(BoardRole.ADMIN)
  @Patch(':boardId')
  update(
    @Param('boardId') boardId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(boardId, user.userId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole(BoardRole.OWNER)
  @Patch(':boardId/restore')
  restore(
    @Param('boardId') boardId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.boardsService.restore(boardId, user.userId);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole(BoardRole.ADMIN)
  @Delete(':boardId')
  remove(
    @Param('boardId') boardId: string,
    @CurrentBoardRole() role: BoardRole,
  ) {
    return this.boardsService.remove(boardId, role);
  }

  @UseGuards(BoardAccessGuard)
  @Get(':boardId/members')
  listMembers(@Param('boardId') boardId: string) {
    return this.boardsService.listMembers(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole(BoardRole.ADMIN)
  @Post(':boardId/members')
  addMember(@Param('boardId') boardId: string, @Body() dto: AddMemberDto) {
    return this.boardsService.addMember(boardId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole(BoardRole.ADMIN)
  @Patch(':boardId/members/:memberUserId')
  updateMember(
    @Param('boardId') boardId: string,
    @Param('memberUserId') memberUserId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.boardsService.updateMemberRole(boardId, memberUserId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole(BoardRole.ADMIN)
  @Delete(':boardId/members/:memberUserId')
  removeMember(
    @Param('boardId') boardId: string,
    @Param('memberUserId') memberUserId: string,
  ) {
    return this.boardsService.removeMember(boardId, memberUserId);
  }
}
