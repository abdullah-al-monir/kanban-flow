import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivitiesModule } from './activities/activities.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BoardsModule } from './boards/boards.module.js';
import { ColumnsModule } from './columns/columns.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    ActivitiesModule,
  ],
})
export class AppModule {}
