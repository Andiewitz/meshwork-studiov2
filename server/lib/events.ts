import { EventEmitter } from 'events';

// Define typed events
export interface AppEvents {
  'workspace.deleted': { id: number, tx?: any };
  'workspace.duplicated': { originalId: number, newId: number, tx?: any };
  'user.deleted': { id: number, tx?: any };
}

export class EventBus extends EventEmitter {
  emit<K extends keyof AppEvents>(eventName: K, payload: AppEvents[K]): boolean {
    return super.emit(eventName, payload);
  }

  async emitAsync<K extends keyof AppEvents>(eventName: K, payload: AppEvents[K]): Promise<void> {
    const listeners = this.listeners(eventName);
    for (const listener of listeners) {
      await listener(payload);
    }
  }

  on<K extends keyof AppEvents>(eventName: K, listener: (payload: AppEvents[K]) => void | Promise<void>): this {
    return super.on(eventName, listener);
  }
}

// Export singleton instance for app-wide internal events
export const eventBus = new EventBus();
