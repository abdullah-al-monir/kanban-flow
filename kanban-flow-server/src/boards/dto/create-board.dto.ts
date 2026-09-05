import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'Product Launch Q1' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @ApiProperty({ required: false, example: 'Tracking everything for the Q1 launch' })
  @IsOptional()
  @IsString()
  description?: string;
}
