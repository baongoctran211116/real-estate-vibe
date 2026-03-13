// filename: src/utils/jwt.ts
// Mock JWT implementation (không cần thư viện ngoài)
// Format: base64(header).base64(payload).base64(signature)

const SECRET = 'zillow_app_secret_2024';

function base64Encode(str: string): string {
  // React Native có btoa nhưng không hỗ trợ unicode → encode thủ công
  const bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16)),
  );
  return btoa(bytes).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64Decode(str: string): string {
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

function simpleSign(data: string, secret: string): string {
  // Pseudo-HMAC: XOR + hash simulation (đủ cho mock)
  let hash = 0;
  const combined = data + secret;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36) + combined.length.toString(36);
}

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  iat: number;       // issued at (seconds)
  exp: number;       // expires at (seconds)
}

/** Tạo JWT token với expiry 7 ngày */
export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 ngày
  };

  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Encode(JSON.stringify(fullPayload));
  const signature = base64Encode(simpleSign(`${header}.${body}`, SECRET));

  return `${header}.${body}.${signature}`;
}

/** Verify và decode JWT. Trả null nếu invalid hoặc expired */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;

    // Verify signature
    const expectedSig = base64Encode(simpleSign(`${header}.${body}`, SECRET));
    if (signature !== expectedSig) return null;

    const payload: JwtPayload = JSON.parse(base64Decode(body));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

/** Decode không verify (để đọc payload kể cả expired) */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64Decode(parts[1]));
  } catch {
    return null;
  }
}

/** Kiểm tra token còn hạn không */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  return verifyJwt(token) !== null;
}
