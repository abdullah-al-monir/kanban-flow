import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBoardDto {
  @ApiPropertyOptional({ example: 'Product Launch Q1 (Renamed)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
