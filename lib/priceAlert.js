export function hasCrossedPrice({ previous, current, target, direction }) {
  if (![previous, current, target].every(Number.isFinite) || target <= 0) return false;
  if (direction === "below") return previous > target && current <= target;
  return previous < target && current >= target;
}

export function normalizePriceAlert(value, fallbackTarget) {
  const target = Number.isFinite(value?.target) && value.target > 0 ? value.target : fallbackTarget;
  return {
    enabled: Boolean(value?.enabled),
    direction: value?.direction === "below" ? "below" : "above",
    target,
    lastTriggeredAt: typeof value?.lastTriggeredAt === "string" ? value.lastTriggeredAt : null
  };
}
