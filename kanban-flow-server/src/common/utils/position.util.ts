const GAP = 1000;
const MIN_GAP = 1e-7;

export function computePosition(
  prev: number | null,
  next: number | null,
): number {
  if (prev === null && next === null) return GAP;
  if (prev === null) return next! / 2;
  if (next === null) return prev + GAP;
  return prev + (next - prev) / 2;
}

export function needsRebalance(
  prev: number | null,
  next: number | null,
): boolean {
  if (prev === null || next === null) return false;
  return next - prev < MIN_GAP;
}

export function rebalancedPositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * GAP);
}
