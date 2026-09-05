import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module.js';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';

@Module({
  imports: [BoardsModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}