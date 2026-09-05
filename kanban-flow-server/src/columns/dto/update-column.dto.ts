import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateColumnDto {
  @ApiPropertyOptional({ example: 'In Review' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;
}
