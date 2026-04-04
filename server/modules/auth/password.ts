import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // Increased from 10 for stronger hashing

export { PASSWORD_POLICY, validatePasswordStrength } from "@shared/auth";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
