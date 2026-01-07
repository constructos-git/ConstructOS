// Money formatting and calculation utilities

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyNoSymbol(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateVat(amount: number, vatRate: number = 20): number {
  return roundMoney(amount * (vatRate / 100));
}

export function calculateWithVat(amount: number, vatRate: number = 20): number {
  return roundMoney(amount + calculateVat(amount, vatRate));
}

export function calculateWithoutVat(amount: number, vatRate: number = 20): number {
  return roundMoney(amount / (1 + vatRate / 100));
}

