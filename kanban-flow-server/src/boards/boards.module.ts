import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller.js';
import { BoardsService } from './boards.service.js';
import { BoardAccessGuard } from './guards/board-access.guard.js';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, BoardAccessGuard],
  exports: [BoardAccessGuard],
})
export class BoardsModule {}
