import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}
