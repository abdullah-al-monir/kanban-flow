import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'In Review' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;
}
