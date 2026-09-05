import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [BoardsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
