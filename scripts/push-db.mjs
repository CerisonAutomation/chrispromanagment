#!/usr/bin/env node
/**
 * @fileoverview Database Push Script — Execute SQL migrations via Node.js pg driver
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.POSTGRES_URL_NON_POOLING || 
  'postgresql://postgres.mohpkakmpagvbqsehwhp:FFAoj8qp29V343Ke@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

async function pushDatabase() {
  console.log('🔌 Connecting to database...');
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected');
    
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260407000001_guesty_tables.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    console.log('📦 Executing migration...');
    await client.query(sql);
    
    console.log('✅ Database push complete');
  } catch (error) {
    console.error('❌ Database push failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

pushDatabase();
