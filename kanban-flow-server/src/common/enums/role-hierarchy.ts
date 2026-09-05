import { BoardRole } from '@prisma/client';

export const ROLE_RANK: Record<BoardRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function roleSatisfies(actual: BoardRole, minimum: BoardRole): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[minimum];
}
