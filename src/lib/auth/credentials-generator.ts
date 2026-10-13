/**
 * Client and server-compatible secure random generation.
 * Uses window.crypto in browsers and Node.js crypto in server environments.
 */
function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('crypto');
  return nodeCrypto.randomFillSync(array);
}

function getRandomInt(max: number): number {
  if (max <= 0) return 0;
  const uint32 = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(uint32);
    return uint32[0] % max;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('crypto');
  if (typeof nodeCrypto.randomInt === 'function') {
    return nodeCrypto.randomInt(max);
  }
  const buf = nodeCrypto.randomBytes(4);
  return buf.readUInt32BE(0) % max;
}

/**
 * Format domain slug from site name.
 * e.g. "xyz" -> "xyz.com", "My Project" -> "myproject.com", "test.io" -> "test.io"
 */
export function formatSiteDomain(siteName?: string): string {
  if (!siteName || !siteName.trim()) return 'engine.com';
  const clean = siteName.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '');
  if (clean.includes('.')) {
    return clean;
  }
  return `${clean}.com`;
}

/**
 * Format role slug from role or role name.
 * e.g. "SUPER_ADMIN" -> "admin", "ADMIN" -> "admin", "Editor" -> "editor"
 */
export function formatRoleSlug(role: string, customRoleName?: string | null): string {
  if (role === 'CUSTOM' && customRoleName) {
    return customRoleName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff';
  }
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return 'admin';
  }
  return role.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
}

/**
 * Generate role-based login email: role@sitename.com
 * e.g. If site name is "xyz", then admin -> "admin@xyz.com"
 * If suffix is needed to prevent duplicates, suffix can be appended.
 */
export function generateRoleEmail(role: string, siteName?: string, customRoleName?: string | null, suffix?: string): string {
  const roleSlug = formatRoleSlug(role, customRoleName);
  const domain = formatSiteDomain(siteName);
  const userPart = suffix ? `${roleSlug}${suffix}` : roleSlug;
  return `${userPart}@${domain}`;
}

/**
 * Generate default role-based initial password: {role}1
 * e.g. for admin -> "admin1"
 */
export function generateRoleDefaultPassword(role: string, customRoleName?: string | null): string {
  const roleSlug = formatRoleSlug(role, customRoleName);
  return `${roleSlug}1`;
}

/**
 * Generate a cryptographically secure random password.
 * Safe for browser client components as well as Node.js server runtimes.
 */
export function generateSecurePassword(length = 14): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  // Guarantee at least one from each character bucket
  password += uppercase[getRandomInt(uppercase.length)];
  password += lowercase[getRandomInt(lowercase.length)];
  password += numbers[getRandomInt(numbers.length)];
  password += symbols[getRandomInt(symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[getRandomInt(allChars.length)];
  }

  // Shuffle characters randomly
  return password
    .split('')
    .sort(() => (getRandomInt(100) > 50 ? 1 : -1))
    .join('');
}

/**
 * Generate an enterprise temporary email fallback.
 */
export function generateRandomEmail(name?: string, siteName?: string): string {
  const cleanName = (name || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10);
  
  const domain = formatSiteDomain(siteName);
  return `${cleanName}@${domain}`;
}
