/** Integer cents keep the 15% boundary consistent across native, web and Edge. */
export function budgetCents(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 100000 || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) {
    throw new Error('Enter a budget from $0 to $100,000 with at most two decimal places.');
  }
  return Math.round(value * 100);
}

export function budgetStatus(totalUSD: number, budgetUSD: number) {
  const target = budgetCents(budgetUSD);
  const maximum = Math.floor(target * 115 / 100);
  const total = Math.round(totalUSD * 100);
  return {
    maximumUSD: maximum / 100,
    status: total <= target ? 'within' : total <= maximum ? 'stretch' : 'over',
    gapUSD: Math.max(0, total - target) / 100,
  };
}

/** Keep one item from every required catalog group; never make an incomplete
 * setup appear affordable by omitting expensive essentials. */
export function cheapestItem<T>(items: T[], price: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, item) =>
    !best || Math.round(price(item) * 100) < Math.round(price(best) * 100) ? item : best, undefined);
}
