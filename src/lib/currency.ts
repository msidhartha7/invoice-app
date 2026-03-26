const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$',
  INR: '₹', JPY: '¥', CHF: 'CHF ', SGD: 'S$', HKD: 'HK$',
  NZD: 'NZ$', MXN: 'MX$', BRL: 'R$', ZAR: 'R', AED: 'AED ',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', KRW: '₩', THB: '฿',
}

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? `${currency} `
}

export function formatAmount(amount: number, currency: string): string {
  return `${currencySymbol(currency)}${amount.toFixed(2)}`
}
