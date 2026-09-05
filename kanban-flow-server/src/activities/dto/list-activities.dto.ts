import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListActivitiesDto {
  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}
