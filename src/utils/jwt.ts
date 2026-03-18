// filename: src/utils/jwt.ts
// Decode JWT token nhận từ server (không cần sign — server lo việc sign)
// Giữ lại isTokenValid để useAuthStore.hydrateFromToken() vẫn compile được

export interface JwtPayload {
  sub: string;   // userId
  email: string;
  iat: number;   // issued at (seconds)
  exp: number;   // expires at (seconds)
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const padStr = pad ? padded + '='.repeat(4 - pad) : padded;
  const decoded = atob(padStr);
  return decodeURIComponent(
    decoded
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
}

/** Decode JWT từ server (không verify signature — server đã verify) */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

/** Kiểm tra token còn hạn không (dựa vào exp trong payload) */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp > Math.floor(Date.now() / 1000);
}

// ─── Các hàm cũ giữ lại để không break import ────────────────────────────────
/** @deprecated Server sign JWT — không cần sign trên client nữa */
export function signJwt(_payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  throw new Error('signJwt() không dùng nữa — JWT do server cấp');
}

/** @deprecated Dùng isTokenValid() thay thế */
export function verifyJwt(token: string): JwtPayload | null {
  return isTokenValid(token) ? decodeJwt(token) : null;
}
