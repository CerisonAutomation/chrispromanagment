import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateBlock } from '@/lib/blockRegistry';

describe('blockRegistry', () => {
  it('validates block with valid data', () => {
    const result = validateBlock('hero', { title: 'Test', subtitle: 'Sub' });
    expect(result.success).toBe(true);
  });

  it('rejects block with invalid data', () => {
    const result = validateBlock('hero', { title: 123 as unknown as string });
    expect(result.success).toBe(false);
  });
});
