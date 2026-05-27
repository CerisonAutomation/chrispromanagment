/**
 * CQRS Pattern Unit Tests
 * 
 * Tests for the Command Query Responsibility Segregation pattern including:
 * - Command execution
 * - Query execution
 * - Command Bus
 * - Query Bus
 * - Event publishing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CommandBus,
  QueryBus,
  createCommand,
  createQuery,
} from '../cqrs-pattern';

describe('Command', () => {
  it('should create a command with payload', () => {
    const payload = { id: '123', value: 'test' };
    const command = createCommand('TEST_COMMAND', payload);
    
    expect(command.type).toBe('TEST_COMMAND');
    expect(command.payload).toEqual(payload);
    expect(command.timestamp).toBeInstanceOf(Date);
  });

  it('should generate unique command ID', () => {
    const command1 = createCommand('TEST', {});
    const command2 = createCommand('TEST', {});
    
    expect(command1.id).toBeDefined();
    expect(command2.id).toBeDefined();
    expect(command1.id).not.toBe(command2.id);
  });
});

describe('Query', () => {
  it('should create a query with payload', () => {
    const payload = { filter: 'active' };
    const query = createQuery('TEST_QUERY', payload);
    
    expect(query.type).toBe('TEST_QUERY');
    expect(query.payload).toEqual(payload);
    expect(query.timestamp).toBeInstanceOf(Date);
  });

  it('should generate unique query ID', () => {
    const query1 = createQuery('TEST', {});
    const query2 = createQuery('TEST', {});
    
    expect(query1.id).toBeDefined();
    expect(query2.id).toBeDefined();
    expect(query1.id).not.toBe(query2.id);
  });
});

describe('CommandBus', () => {
  let commandBus: CommandBus;

  beforeEach(() => {
    commandBus = new CommandBus();
  });

  it('should register command handler', () => {
    const handler = vi.fn();
    commandBus.register('TEST_COMMAND', handler);
    
    expect(commandBus['handlers'].has('TEST_COMMAND')).toBe(true);
  });

  it('should execute command and call handler', async () => {
    const handler = vi.fn().mockResolvedValue({ success: true });
    commandBus.register('TEST_COMMAND', handler);
    
    const command = createCommand('TEST_COMMAND', { data: 'test' });
    const result = await commandBus.execute(command);
    
    expect(handler).toHaveBeenCalledWith(command);
    expect(result).toEqual({ success: true });
  });

  it('should throw error if handler not found', async () => {
    const command = createCommand('UNKNOWN_COMMAND', {});
    
    await expect(commandBus.execute(command)).rejects.toThrow(
      'No handler registered for command: UNKNOWN_COMMAND'
    );
  });

  it('should validate command before execution', async () => {
    const handler = vi.fn().mockResolvedValue({ success: true });
    commandBus.register('VALIDATED_COMMAND', handler);
    
    const validator = vi.fn().mockReturnValue(true);
    commandBus.setValidator('VALIDATED_COMMAND', validator);
    
    const command = createCommand('VALIDATED_COMMAND', { data: 'test' });
    await commandBus.execute(command);
    
    expect(validator).toHaveBeenCalledWith(command);
  });

  it('should reject invalid commands', async () => {
    const handler = vi.fn().mockResolvedValue({ success: true });
    commandBus.register('VALIDATED_COMMAND', handler);
    
    const validator = vi.fn().mockReturnValue(false);
    commandBus.setValidator('VALIDATED_COMMAND', validator);
    
    const command = createCommand('VALIDATED_COMMAND', { data: 'test' });
    
    await expect(commandBus.execute(command)).rejects.toThrow(
      'Command validation failed'
    );
  });

  it('should publish events after successful execution', async () => {
    const handler = vi.fn().mockResolvedValue({ success: true });
    commandBus.register('TEST_COMMAND', handler);
    
    const eventListener = vi.fn();
    commandBus.on('commandExecuted', eventListener);
    
    const command = createCommand('TEST_COMMAND', { data: 'test' });
    await commandBus.execute(command);
    
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        command,
        status: 'success',
      })
    );
  });

  it('should publish events on execution failure', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Test error'));
    commandBus.register('TEST_COMMAND', handler);
    
    const eventListener = vi.fn();
    commandBus.on('commandExecuted', eventListener);
    
    const command = createCommand('TEST_COMMAND', { data: 'test' });
    
    await expect(commandBus.execute(command)).rejects.toThrow();
    
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        command,
        status: 'error',
      })
    );
  });

  it('should handle multiple commands in sequence', async () => {
    const handler1 = vi.fn().mockResolvedValue({ result: 1 });
    const handler2 = vi.fn().mockResolvedValue({ result: 2 });
    
    commandBus.register('COMMAND_1', handler1);
    commandBus.register('COMMAND_2', handler2);
    
    const command1 = createCommand('COMMAND_1', {});
    const command2 = createCommand('COMMAND_2', {});
    
    await commandBus.execute(command1);
    await commandBus.execute(command2);
    
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should unregister handler', () => {
    const handler = vi.fn();
    commandBus.register('TEST_COMMAND', handler);
    
    expect(commandBus['handlers'].has('TEST_COMMAND')).toBe(true);
    
    commandBus.unregister('TEST_COMMAND');
    
    expect(commandBus['handlers'].has('TEST_COMMAND')).toBe(false);
  });
});

describe('QueryBus', () => {
  let queryBus: QueryBus;

  beforeEach(() => {
    queryBus = new QueryBus();
  });

  it('should register query handler', () => {
    const handler = vi.fn();
    queryBus.register('TEST_QUERY', handler);
    
    expect(queryBus['handlers'].has('TEST_QUERY')).toBe(true);
  });

  it('should execute query and call handler', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [1, 2, 3] });
    queryBus.register('TEST_QUERY', handler);
    
    const query = createQuery('TEST_QUERY', { filter: 'active' });
    const result = await queryBus.execute(query);
    
    expect(handler).toHaveBeenCalledWith(query);
    expect(result).toEqual({ data: [1, 2, 3] });
  });

  it('should throw error if handler not found', async () => {
    const query = createQuery('UNKNOWN_QUERY', {});
    
    await expect(queryBus.execute(query)).rejects.toThrow(
      'No handler registered for query: UNKNOWN_QUERY'
    );
  });

  it('should validate query before execution', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [] });
    queryBus.register('VALIDATED_QUERY', handler);
    
    const validator = vi.fn().mockReturnValue(true);
    queryBus.setValidator('VALIDATED_QUERY', validator);
    
    const query = createQuery('VALIDATED_QUERY', { filter: 'active' });
    await queryBus.execute(query);
    
    expect(validator).toHaveBeenCalledWith(query);
  });

  it('should reject invalid queries', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [] });
    queryBus.register('VALIDATED_QUERY', handler);
    
    const validator = vi.fn().mockReturnValue(false);
    queryBus.setValidator('VALIDATED_QUERY', validator);
    
    const query = createQuery('VALIDATED_QUERY', { filter: 'invalid' });
    
    await expect(queryBus.execute(query)).rejects.toThrow(
      'Query validation failed'
    );
  });

  it('should cache query results when caching is enabled', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [1, 2, 3] });
    queryBus.register('CACHED_QUERY', handler);
    queryBus.enableCache('CACHED_QUERY', 1000);
    
    const query = createQuery('CACHED_QUERY', { filter: 'active' });
    
    await queryBus.execute(query);
    await queryBus.execute(query);
    
    expect(handler).toHaveBeenCalledTimes(1); // Should only call handler once
  });

  it('should not cache when caching is disabled', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [1, 2, 3] });
    queryBus.register('UNCACHED_QUERY', handler);
    
    const query = createQuery('UNCACHED_QUERY', { filter: 'active' });
    
    await queryBus.execute(query);
    await queryBus.execute(query);
    
    expect(handler).toHaveBeenCalledTimes(2); // Should call handler each time
  });

  it('should expire cache after TTL', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [1, 2, 3] });
    queryBus.register('CACHED_QUERY', handler);
    queryBus.enableCache('CACHED_QUERY', 100); // 100ms TTL
    
    const query = createQuery('CACHED_QUERY', { filter: 'active' });
    
    await queryBus.execute(query);
    await new Promise(resolve => setTimeout(resolve, 150));
    await queryBus.execute(query);
    
    expect(handler).toHaveBeenCalledTimes(2); // Cache expired, handler called again
  });

  it('should publish events on query execution', async () => {
    const handler = vi.fn().mockResolvedValue({ data: [] });
    queryBus.register('TEST_QUERY', handler);
    
    const eventListener = vi.fn();
    queryBus.on('queryExecuted', eventListener);
    
    const query = createQuery('TEST_QUERY', { filter: 'active' });
    await queryBus.execute(query);
    
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        query,
        status: 'success',
      })
    );
  });

  it('should handle multiple queries in sequence', async () => {
    const handler1 = vi.fn().mockResolvedValue({ data: [1] });
    const handler2 = vi.fn().mockResolvedValue({ data: [2] });
    
    queryBus.register('QUERY_1', handler1);
    queryBus.register('QUERY_2', handler2);
    
    const query1 = createQuery('QUERY_1', {});
    const query2 = createQuery('QUERY_2', {});
    
    await queryBus.execute(query1);
    await queryBus.execute(query2);
    
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should unregister handler', () => {
    const handler = vi.fn();
    queryBus.register('TEST_QUERY', handler);
    
    expect(queryBus['handlers'].has('TEST_QUERY')).toBe(true);
    
    queryBus.unregister('TEST_QUERY');
    
    expect(queryBus['handlers'].has('TEST_QUERY')).toBe(false);
  });
});

describe('CQRS Integration', () => {
  it('should handle command and query in same workflow', async () => {
    const commandBus = new CommandBus();
    const queryBus = new QueryBus();
    
    const commandHandler = vi.fn().mockResolvedValue({ id: '123' });
    const queryHandler = vi.fn().mockResolvedValue({ data: [{ id: '123' }] });
    
    commandBus.register('CREATE_ENTITY', commandHandler);
    queryBus.register('GET_ENTITY', queryHandler);
    
    // Execute command
    const command = createCommand('CREATE_ENTITY', { name: 'Test' });
    const commandResult = await commandBus.execute(command);
    
    // Execute query
    const query = createQuery('GET_ENTITY', { id: '123' });
    const queryResult = await queryBus.execute(query);
    
    expect(commandResult).toEqual({ id: '123' });
    expect(queryResult).toEqual({ data: [{ id: '123' }] });
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(queryHandler).toHaveBeenCalledTimes(1);
  });

  it('should maintain separation of concerns', async () => {
    const commandBus = new CommandBus();
    const queryBus = new QueryBus();
    
    const commandHandler = vi.fn().mockResolvedValue({ success: true });
    const queryHandler = vi.fn().mockResolvedValue({ data: [] });
    
    commandBus.register('UPDATE_ENTITY', commandHandler);
    queryBus.register('GET_ENTITY', queryHandler);
    
    // Commands should not trigger queries
    const command = createCommand('UPDATE_ENTITY', { id: '123', name: 'Updated' });
    await commandBus.execute(command);
    
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(queryHandler).toHaveBeenCalledTimes(0);
  });

  it('should support event-driven architecture', async () => {
    const commandBus = new CommandBus();
    
    const commandHandler = vi.fn().mockResolvedValue({ success: true });
    commandBus.register('TEST_COMMAND', commandHandler);
    
    const eventLog: string[] = [];
    
    commandBus.on('commandExecuted', (event) => {
      eventLog.push(`Command ${event.command.type} executed`);
    });
    
    commandBus.on('beforeExecution', (event) => {
      eventLog.push(`Before ${event.command.type}`);
    });
    
    commandBus.on('afterExecution', (event) => {
      eventLog.push(`After ${event.command.type}`);
    });
    
    const command = createCommand('TEST_COMMAND', {});
    await commandBus.execute(command);
    
    expect(eventLog).toContain('Before TEST_COMMAND');
    expect(eventLog).toContain('After TEST_COMMAND');
    expect(eventLog).toContain('Command TEST_COMMAND executed');
  });
});
