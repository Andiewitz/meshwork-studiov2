import { users, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      console.log("[AuthStorage] DB Upsert for user:", userData.id);
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      console.log("[AuthStorage] DB Upsert successful");
      return user;
    } catch (err) {
      console.error("[AuthStorage] DB Upsert failed:", err);
      throw err;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }
}

class MemAuthStorage implements IAuthStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) throw new Error("User ID is required");
    const now = new Date();
    const existing = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      createdAt: existing?.createdAt ?? now, // Keep existing createdAt if present
      updatedAt: now, // Always update updatedAt
    } as User;

    // Ensure all mandatory fields from User interface are present if they are not in UpsertUser
    // Assuming User extends UpsertUser plus createdAt, updatedAt

    this.users.set(userData.id!, user);
    return user;
  }
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }
}

export const authStorage = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL ? new AuthStorage() : new MemAuthStorage();
