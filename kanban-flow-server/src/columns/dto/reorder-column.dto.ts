import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ReorderColumnDto {
  @ApiPropertyOptional({ description: 'Id of the column that should end up immediately before this one' })
  @IsOptional()
  @IsUUID()
  beforeColumnId?: string;

  @ApiPropertyOptional({ description: 'Id of the column that should end up immediately after this one' })
  @IsOptional()
  @IsUUID()
  afterColumnId?: string;
}
