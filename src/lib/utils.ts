import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 EGP';
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscountPercentage(originalPrice: number, price: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getProductRating(product: { rating_avg?: number; reviews_count?: number }): number {
  if (product?.reviews_count && product.reviews_count > 0 && typeof product?.rating_avg === 'number') {
    return product.rating_avg;
  }
  return 0;
}

export function getProductReviewsCount(product: { reviews_count?: number }): number {
  return product?.reviews_count || 0;
}
