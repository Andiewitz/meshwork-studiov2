import type { Request, Response, NextFunction } from "express";

export class AppRegistry {
  private services = new Map<string, any>();

  register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`);
    }
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in registry`);
    }
    return service as T;
  }
}

export interface AppContext {
  registry: AppRegistry;
  eventBus: typeof import('./events').eventBus;
}
