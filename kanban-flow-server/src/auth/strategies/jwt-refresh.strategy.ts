import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../decorators/current-user.decorator.js';
import { JwtPayload } from './jwt.strategy.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(_req: Request, payload: JwtPayload): Promise<AuthenticatedUser> {
    return { userId: payload.sub, email: payload.email };
  }
}
