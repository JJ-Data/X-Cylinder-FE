export function formatCurrency(amount: number, currency: string = '₦'): string {
  return `${currency}${amount.toLocaleString()}`
}