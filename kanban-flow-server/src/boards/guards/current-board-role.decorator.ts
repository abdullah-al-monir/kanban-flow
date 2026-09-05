import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BoardRole } from '@prisma/client';

export const CurrentBoardRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BoardRole => {
    const request = ctx.switchToHttp().getRequest();
    return request.boardRole;
  },
);
