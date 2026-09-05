import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import type { AuthenticatedUser } from './decorators/current-user.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Body() _dto: RefreshDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.refresh(user.userId, user.email);
  }
}
