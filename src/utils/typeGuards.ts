// filename: src/utils/typeGuards.ts
import { Property, PropertyType, Province } from '../types/property';

export const isValidPropertyType = (value: unknown): value is PropertyType => {
  return (
    typeof value === 'string' &&
    ['apartment', 'house', 'villa', 'townhouse', 'land'].includes(value)
  );
};

export const isValidProvince = (value: unknown): value is Province => {
  return (
    typeof value === 'string' &&
    ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho'].includes(value)
  );
};

export const isProperty = (value: unknown): value is Property => {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.price === 'number' &&
    typeof p.latitude === 'number' &&
    typeof p.longitude === 'number' &&
    isValidPropertyType(p.propertyType) &&
    isValidProvince(p.province)
  );
};

export const safeParsePrice = (value: unknown): number => {
  const n = Number(value);
  return isNaN(n) || n < 0 ? 0 : n;
};
