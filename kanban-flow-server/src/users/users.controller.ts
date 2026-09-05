import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.me(user.userId);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.userId, dto);
  }

  @Get('search')
  search(@Query('email') email: string) {
    return this.usersService.search(email ?? '');
  }
}
