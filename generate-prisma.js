#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('[Prisma] Generating Prisma Client...');
  execSync('bun prisma generate', {
    cwd: path.join(__dirname),
    stdio: 'inherit',
  });
  console.log('[Prisma] ✓ Successfully generated Prisma Client');
  process.exit(0);
} catch (error) {
  console.error('[Prisma] ✗ Failed to generate:', error.message);
  process.exit(1);
}
