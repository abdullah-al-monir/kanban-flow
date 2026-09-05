import { describe, expect, it } from 'vitest';
import { computePosition, needsRebalance, rebalancedPositions } from '../../src/common/utils/position.util.js';

describe('computePosition', () => {
  it('returns a default gap when the list is empty', () => {
    expect(computePosition(null, null)).toBe(1000);
  });

  it('places before the first item when there is no previous sibling', () => {
    const pos = computePosition(null, 1000);
    expect(pos).toBeGreaterThan(0);
    expect(pos).toBeLessThan(1000);
  });

  it('places after the last item when there is no next sibling', () => {
    expect(computePosition(1000, null)).toBe(2000);
  });

  it('splits the midpoint between two siblings', () => {
    expect(computePosition(1000, 2000)).toBe(1500);
  });

  it('never produces a position equal to either neighbour', () => {
    const pos = computePosition(1000, 1000.0001);
    expect(pos).not.toBe(1000);
    expect(pos).not.toBe(1000.0001);
  });
});

describe('needsRebalance', () => {
  it('is false when there is room between neighbours', () => {
    expect(needsRebalance(1000, 2000)).toBe(false);
  });

  it('is false at the start or end of a list', () => {
    expect(needsRebalance(null, 1000)).toBe(false);
    expect(needsRebalance(1000, null)).toBe(false);
  });

  it('is true once neighbours have converged past the precision floor', () => {
    expect(needsRebalance(1000, 1000.00000005)).toBe(true);
  });
});

describe('rebalancedPositions', () => {
  it('produces evenly spaced, strictly increasing positions', () => {
    const positions = rebalancedPositions(5);
    expect(positions).toHaveLength(5);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });
});
