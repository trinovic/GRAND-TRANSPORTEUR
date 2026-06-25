import type { Currency } from '../types';

const CURRENCY_CONFIGS: Record<Currency, { locale: string; currency: string }> = {
  XOF: { locale: 'fr-FR', currency: 'XOF' },
  EUR: { locale: 'fr-FR', currency: 'EUR' },
  USD: { locale: 'en-US', currency: 'USD' },
  GBP: { locale: 'en-GB', currency: 'GBP' },
  MAD: { locale: 'fr-MA', currency: 'MAD' },
};

export function formatCurrency(amount: number, currency: Currency = 'XOF'): string {
  const config = CURRENCY_CONFIGS[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: currency === 'XOF' ? 0 : 2,
    maximumFractionDigits: currency === 'XOF' ? 0 : 2,
  }).format(amount);
}

export function formatNumber(value: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(dateStr: string, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateLong(dateStr: string, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatKm(km: number): string {
  return `${formatNumber(km)} km`;
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
