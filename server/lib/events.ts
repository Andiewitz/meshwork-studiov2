import { EventEmitter } from "events";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";

/**
 * Drizzle transaction type — derived from the NodePgDatabase instance so it
 * stays in sync with the driver without duplicating the signature manually.
 */
export type DrizzleTx = Parameters<
  Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]
>[0];

// Define typed events
export interface AppEvents {
  "workspace.deleted": { id: number; tx?: DrizzleTx };
  "workspace.duplicated": { originalId: number; newId: number; tx?: DrizzleTx };
  "user.deleted": { id: string; tx?: DrizzleTx };
}

export class EventBus extends EventEmitter {
  emit<K extends keyof AppEvents>(
    eventName: K,
    payload: AppEvents[K],
  ): boolean {
    return super.emit(eventName, payload);
  }

  async emitAsync<K extends keyof AppEvents>(
    eventName: K,
    payload: AppEvents[K],
  ): Promise<void> {
    const listeners = this.listeners(eventName);
    for (const listener of listeners) {
      await (listener as (payload: AppEvents[K]) => void | Promise<void>)(
        payload,
      );
    }
  }

  on<K extends keyof AppEvents>(
    eventName: K,
    listener: (payload: AppEvents[K]) => void | Promise<void>,
  ): this {
    return super.on(eventName, listener);
  }
}

// Export singleton instance for app-wide internal events
export const eventBus = new EventBus();
