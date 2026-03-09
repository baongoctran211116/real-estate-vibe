// filename: src/utils/formatters.ts
import { PropertyType } from '../types/property';

/**
 * Format VND price to readable string
 * e.g. 4500000000 → "4.5 tỷ" or "450 triệu"
 */
export const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000;
    return `${parseFloat(billions.toFixed(1))} tỷ`;
  }
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `${parseFloat(millions.toFixed(0))} triệu`;
  }
  return `${price.toLocaleString('vi-VN')} đ`;
};

/**
 * Format area with m² suffix
 */
export const formatArea = (area: number): string => `${area} m²`;

/**
 * Format property type to human-readable label
 */
export const formatPropertyType = (type: PropertyType): string => {
  const map: Record<PropertyType, string> = {
    apartment: 'Căn hộ',
    house: 'Nhà phố',
    villa: 'Biệt thự',
    townhouse: 'Nhà liền kề',
    land: 'Đất nền',
  };
  return map[type] ?? type;
};

/**
 * Format date string to readable date
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Truncate a string to maxLength with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format bedroom/bathroom count display
 */
export const formatRooms = (bedrooms: number, bathrooms: number): string => {
  if (bedrooms === 0) return 'Đất trống';
  return `${bedrooms} PN · ${bathrooms} WC`;
};

/**
 * Get property type color for badges
 */
export const getPropertyTypeColor = (type: PropertyType): string => {
  const colors: Record<PropertyType, string> = {
    apartment: '#4A90D9',
    house: '#27AE60',
    villa: '#8E44AD',
    townhouse: '#E67E22',
    land: '#95A5A6',
  };
  return colors[type] ?? '#888';
};
