// @ts-nocheck
// Service Container Implementation
// Provides dependency injection and service lifecycle management

/**
 * Service lifecycle types
 */
export type ServiceLifetime = 'singleton' | 'transient' | 'scoped';

/**
 * Service descriptor
 */
export interface ServiceDescriptor<T = unknown> {
  factory: () => T | Promise<T>;
  lifetime: ServiceLifetime;
  dependencies?: string[];
}

/**
 * Service Container for dependency injection
 */
export class ServiceContainer {
  private services = new Map<string, ServiceDescriptor>();
  private singletons = new Map<string, unknown>();
  private scopedInstances = new Map<string, unknown>();
  private isDisposed = false;

  /**
   * Register a service
   */
  register<T>(
    name: string,
    factory: () => T | Promise<T>,
    lifetime: ServiceLifetime = 'singleton',
    dependencies?: string[]
  ): void {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' is already registered`);
    }

    this.services.set(name, {
      factory,
      lifetime,
      dependencies,
    });
  }

  /**
   * Resolve a service
   */
  async resolve<T>(name: string): Promise<T> {
    if (this.isDisposed) {
      throw new Error('Service container has been disposed');
    }

    const descriptor = this.services.get(name);
    if (!descriptor) {
      throw new Error(`Service '${name}' is not registered`);
    }

    // Handle singleton lifecycle
    if (descriptor.lifetime === 'singleton') {
      if (this.singletons.has(name)) {
        return this.singletons.get(name) as T;
      }

      const instance = await this.createInstance(descriptor);
      this.singletons.set(name, instance);
      return instance as T;
    }

    // Handle scoped lifecycle
    if (descriptor.lifetime === 'scoped') {
      if (this.scopedInstances.has(name)) {
        return this.scopedInstances.get(name) as T;
      }

      const instance = await this.createInstance(descriptor);
      this.scopedInstances.set(name, instance);
      return instance as T;
    }

    // Handle transient lifecycle (always create new instance)
    return this.createInstance(descriptor) as Promise<T>;
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Create a new scope
   */
  createScope(): ServiceContainer {
    const scopedContainer = new ServiceContainer();
    scopedContainer.services = this.services;
    return scopedContainer;
  }

  /**
   * Clear scoped instances
   */
  clearScope(): void {
    this.scopedInstances.clear();
  }

  /**
   * Dispose the container and cleanup resources
   */
  dispose(): void {
    this.clearScope();
    this.singletons.clear();
    this.services.clear();
    this.isDisposed = true;
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Create instance with dependency resolution
   */
  private async createInstance(descriptor: ServiceDescriptor): Promise<unknown> {
    // Resolve dependencies first if any
    if (descriptor.dependencies && descriptor.dependencies.length > 0) {
      const dependencies = await Promise.all(
        descriptor.dependencies.map((dep) => this.resolve(dep))
      );
      return descriptor.factory(...dependencies);
    }

    return descriptor.factory();
  }

  /**
   * Validate dependency graph for circular dependencies
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const checkCircular = (serviceName: string, path: string[]): boolean => {
      if (recursionStack.has(serviceName)) {
        const cycle = [...path, serviceName].join(' -> ');
        errors.push(`Circular dependency detected: ${cycle}`);
        return false;
      }

      if (visited.has(serviceName)) {
        return true;
      }

      visited.add(serviceName);
      recursionStack.add(serviceName);

      const descriptor = this.services.get(serviceName);
      if (descriptor?.dependencies) {
        for (const dep of descriptor.dependencies) {
          if (!this.services.has(dep)) {
            errors.push(`Service '${serviceName}' depends on unregistered service '${dep}'`);
          } else {
            checkCircular(dep, [...path, serviceName]);
          }
        }
      }

      recursionStack.delete(serviceName);
      return true;
    };

    for (const serviceName of this.services.keys()) {
      if (!visited.has(serviceName)) {
        checkCircular(serviceName, []);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Decorator for automatic service registration
 */
export function Injectable(
  name?: string,
  lifetime: ServiceLifetime = 'singleton'
): ClassDecorator {
  return (target: any) => {
    const serviceName = name || target.name;
    Reflect.defineMetadata('injectable', { name: serviceName, lifetime }, target);
  };
}

/**
 * Global service container instance
 */
export const serviceContainer = new ServiceContainer();

/**
 * Convenience function for registering services
 */
export function registerService<T>(
  name: string,
  factory: () => T | Promise<T>,
  lifetime: ServiceLifetime = 'singleton'
): void {
  serviceContainer.register(name, factory, lifetime);
}

/**
 * Convenience function for resolving services
 */
export async function resolveService<T>(name: string): Promise<T> {
  return serviceContainer.resolve<T>(name);
}

/**
 * Auto-register decorated classes
 */
export function autoRegister(container: ServiceContainer): void {
  // This would typically scan for decorated classes
  // For now, it's a placeholder for reflection-based registration
}

/**
 * Service locator for accessing services without explicit injection
 */
export class ServiceLocator {
  private static container: ServiceContainer;

  static setContainer(container: ServiceContainer): void {
    ServiceLocator.container = container;
  }

  static async get<T>(name: string): Promise<T> {
    if (!ServiceLocator.container) {
      throw new Error('Service container not set');
    }
    return ServiceLocator.container.resolve<T>(name);
  }

  static has(name: string): boolean {
    return ServiceLocator.container ? ServiceLocator.container.has(name) : false;
  }
}