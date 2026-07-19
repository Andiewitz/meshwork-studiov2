/**
 * AI module database access.
 * Uses the shared server-wide pool from server/lib/db.
 */
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../lib/db";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("ai-db");
import * as schema from "@shared/schema";
import { encryptApiKey, decryptApiKey, generateKeyHint } from "./encryption";

import { type DrizzleTx } from "../../lib/events";

export { db };

// Types from schema
export type UserApiKey = typeof schema.userApiKeys.$inferSelect;
export type InsertUserApiKey = typeof schema.userApiKeys.$inferInsert;

/**
 * Database operations for user API keys
 * All keys are encrypted before storage and only decrypted when needed
 */

export interface CreateKeyInput {
  userId: string;
  provider: string;
  apiKey: string;
}

export interface KeyWithPlaintext extends UserApiKey {
  plaintextKey: string;
}

/**
 * Create a new encrypted API key for a user
 */
export async function createApiKey(input: CreateKeyInput): Promise<UserApiKey> {
  // Encrypt the API key
  const { encryptedData, iv, authTag } = encryptApiKey(input.apiKey);

  // Generate hint for UI
  const keyHint = generateKeyHint(input.apiKey);

  // Wrap in a transaction: deactivate any existing active key for this
  // user+provider BEFORE inserting the new one. This closes the race window
  // where two concurrent "add key" requests could both land as active.
  // The partial unique index in the schema is the belt; this is the suspenders.
  return await db.transaction(async (tx: DrizzleTx) => {
    // Deactivate existing active key(s) for this user+provider
    await tx
      .update(schema.userApiKeys)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(schema.userApiKeys.userId, input.userId),
          eq(schema.userApiKeys.provider, input.provider),
          eq(schema.userApiKeys.isActive, true),
        ),
      );

    const [result] = await tx
      .insert(schema.userApiKeys)
      .values({
        userId: input.userId,
        provider: input.provider,
        encryptedKey: encryptedData,
        iv,
        authTag,
        keyHint,
        isActive: true,
      })
      .returning();

    return result;
  });
}

/**
 * Get all API keys for a user (without plaintext - safe for UI)
 */
export async function getUserApiKeys(userId: string): Promise<UserApiKey[]> {
  return await db
    .select()
    .from(schema.userApiKeys)
    .where(eq(schema.userApiKeys.userId, userId))
    .orderBy(schema.userApiKeys.createdAt);
}

/**
 * Get active API keys for a user by provider
 * Returns encrypted data - must be decrypted before use
 */
export async function getActiveKeyForProvider(
  userId: string,
  provider: string,
): Promise<UserApiKey | null> {
  const [result] = await db
    .select()
    .from(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.userId, userId),
        eq(schema.userApiKeys.provider, provider),
        eq(schema.userApiKeys.isActive, true),
      ),
    )
    .orderBy(desc(schema.userApiKeys.createdAt))
    .limit(1);

  return result || null;
}

/**
 * Get a specific API key with decrypted plaintext
 * Use sparingly - only when making actual API calls
 */
export async function getApiKeyWithPlaintext(
  userId: string,
  keyId: string,
): Promise<KeyWithPlaintext | null> {
  const [result] = await db
    .select()
    .from(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.id, keyId),
        eq(schema.userApiKeys.userId, userId),
      ),
    )
    .limit(1);

  if (!result) {
    return null;
  }

  // Decrypt the key
  const plaintextKey = decryptApiKey(
    result.encryptedKey,
    result.iv,
    result.authTag,
  );

  return {
    ...result,
    plaintextKey,
  };
}

/**
 * Delete an API key
 */
export async function deleteApiKey(
  userId: string,
  keyId: string,
): Promise<boolean> {
  const result = await db
    .delete(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.id, keyId),
        eq(schema.userApiKeys.userId, userId),
      ),
    )
    .returning();

  return result.length > 0;
}

/**
 * Toggle key active status
 */
export async function toggleKeyStatus(
  userId: string,
  keyId: string,
  isActive: boolean,
): Promise<UserApiKey | null> {
  const [result] = await db
    .update(schema.userApiKeys)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(
        eq(schema.userApiKeys.id, keyId),
        eq(schema.userApiKeys.userId, userId),
      ),
    )
    .returning();

  return result || null;
}

/**
 * Check if user has any keys for a provider
 */
export async function hasKeyForProvider(
  userId: string,
  provider: string,
): Promise<boolean> {
  const result = await db
    .select({ count: schema.userApiKeys.id })
    .from(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.userId, userId),
        eq(schema.userApiKeys.provider, provider),
        eq(schema.userApiKeys.isActive, true),
      ),
    )
    .limit(1);

  return result.length > 0;
}

log.info("AI db module initialized (using shared pool)");
