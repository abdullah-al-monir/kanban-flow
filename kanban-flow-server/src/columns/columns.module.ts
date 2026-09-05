import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module.js';
import { ColumnsController } from './columns.controller.js';
import { ColumnsService } from './columns.service.js';

@Module({
  imports: [BoardsModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
