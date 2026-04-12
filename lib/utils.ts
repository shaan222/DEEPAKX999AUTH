import { v4 as uuidv4 } from 'uuid';

export function generateLicenseKey(): string {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(uuidv4().split('-')[0].toUpperCase());
  }
  return parts.join('-');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isLicenseExpired(expiresAt: Date | string): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry < new Date();
}

export function generateInviteCode(length: number = 8): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate a permanent username for new users
 * Format: user_XXXXXX where XXXXXX is a random 6-character alphanumeric string
 * This username is permanent and cannot be changed for security reasons
 */
export function generatePermanentUsername(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomPart = Array.from({ length: 6 }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
  return `user_${randomPart}`;
}

