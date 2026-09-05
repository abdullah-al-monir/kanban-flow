import { SetMetadata } from '@nestjs/common';
import { BoardRole } from '@prisma/client';

export const BOARD_ROLE_KEY = 'requiredBoardRole';

export const RequireBoardRole = (role: BoardRole) =>
  SetMetadata(BOARD_ROLE_KEY, role);
