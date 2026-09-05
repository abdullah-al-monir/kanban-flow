import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Pass null to unassign' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  labelIds?: string[];
}
