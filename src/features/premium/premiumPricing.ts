export type PlanId = "monthly" | "yearly";

export function getBasePrices(student = false) {
  if (student) {
    return { monthly: 49.99, yearly: 349.99 };
  }
  return { monthly: 79.99, yearly: 599.99 };
}

export function formatPrice(n: number): string {
  try {
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " TL";
  } catch {
    return `${n.toFixed(2).replace(".", ",")} TL`;
  }
}

export function getFlowerDiscountPercent(flowersCount: number): number {
  if (flowersCount >= 10) return 25;
  if (flowersCount >= 3) return 10;
  return 0;
}

export function applyDiscount(price: number, percent: number): number {
  return Math.max(0, price * (1 - percent / 100));
}
