import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'colleague@example.com', description: 'Email of a registered user to invite' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: BoardRole, default: BoardRole.EDITOR })
  @IsOptional()
  @IsEnum(BoardRole)
  role?: BoardRole;
}
