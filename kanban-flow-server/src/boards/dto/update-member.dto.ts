import { ApiProperty } from '@nestjs/swagger';
import { BoardRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateMemberDto {
  @ApiProperty({ enum: BoardRole })
  @IsEnum(BoardRole)
  role: BoardRole;
}
