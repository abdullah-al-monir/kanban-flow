import { describe, expect, it } from 'vitest';
import { roleSatisfies } from '../../src/common/enums/role-hierarchy.js';

describe('roleSatisfies', () => {
  it('lets a higher role pass a lower requirement', () => {
    expect(roleSatisfies('OWNER', 'EDITOR')).toBe(true);
    expect(roleSatisfies('ADMIN', 'VIEWER')).toBe(true);
  });

  it('lets an exact role match pass', () => {
    expect(roleSatisfies('EDITOR', 'EDITOR')).toBe(true);
  });

  it('blocks a lower role from a higher requirement', () => {
    expect(roleSatisfies('VIEWER', 'EDITOR')).toBe(false);
    expect(roleSatisfies('EDITOR', 'OWNER')).toBe(false);
  });
});
