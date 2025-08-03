#!/usr/bin/env tsx
// Database migration script for WordCross CMS
// Run with: npm run migrate

import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Run database migrations
 * This script should be run after creating the D1 database
 */
async function runMigrations(): Promise<void> {
  try {
    // Read the initial migration file
    const migrationPath = join(process.cwd(), 'migrations', '001-initial.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('📦 Running database migrations...')
    console.log('Migration file:', migrationPath)
    console.log('SQL length:', migrationSQL.length, 'characters')
    
    console.log('\n🔧 To apply this migration to your D1 database, run:')
    console.log('npx wrangler d1 execute wordcross-cms --file=migrations/001-initial.sql')
    
    console.log('\n📝 Migration SQL preview:')
    console.log('─'.repeat(50))
    console.log(migrationSQL.substring(0, 500) + '...')
    console.log('─'.repeat(50))
    
    console.log('\n✅ Migration script completed.')
    console.log('Note: This script only validates the migration. Use wrangler to actually apply it.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}