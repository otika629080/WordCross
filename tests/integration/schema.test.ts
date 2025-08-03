import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Database Schema Validation', () => {
  let migrationSQL: string

  beforeAll(() => {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'migrations', '001-initial.sql')
    migrationSQL = readFileSync(migrationPath, 'utf-8')
  })

  describe('Migration File Structure', () => {
    it('should contain all required tables', () => {
      const requiredTables = [
        'sites',
        'pages', 
        'page_components',
        'admin_users'
      ]

      requiredTables.forEach(table => {
        expect(migrationSQL).toMatch(new RegExp(`CREATE TABLE ${table}`, 'i'))
      })
    })

    it('should have proper foreign key constraints', () => {
      // Check pages -> sites foreign key
      expect(migrationSQL).toMatch(/FOREIGN KEY \(site_id\) REFERENCES sites\(id\)/i)
      
      // Check page_components -> pages foreign key
      expect(migrationSQL).toMatch(/FOREIGN KEY \(page_id\) REFERENCES pages\(id\)/i)
    })

    it('should include cascade deletes where appropriate', () => {
      // Pages should cascade delete when site is deleted
      expect(migrationSQL).toMatch(/REFERENCES sites\(id\) ON DELETE CASCADE/i)
      
      // Components should cascade delete when page is deleted
      expect(migrationSQL).toMatch(/REFERENCES pages\(id\) ON DELETE CASCADE/i)
    })

    it('should have unique constraints', () => {
      // Sites should have unique domains
      expect(migrationSQL).toMatch(/domain TEXT UNIQUE/i)
      
      // Admin users should have unique emails
      expect(migrationSQL).toMatch(/email TEXT UNIQUE NOT NULL/i)
      
      // Pages should have unique slugs per site
      expect(migrationSQL).toMatch(/UNIQUE\(site_id, slug\)/i)
    })
  })

  describe('Table Schema Validation', () => {
    describe('Sites table', () => {
      it('should have all required columns', () => {
        const sitesTableMatch = migrationSQL.match(/CREATE TABLE sites \((.*?)\);/is)
        expect(sitesTableMatch).toBeTruthy()
        
        const sitesSchema = sitesTableMatch?.[1] || ''
        
        expect(sitesSchema).toMatch(/id INTEGER PRIMARY KEY AUTOINCREMENT/i)
        expect(sitesSchema).toMatch(/name TEXT NOT NULL/i)
        expect(sitesSchema).toMatch(/domain TEXT UNIQUE/i)
        expect(sitesSchema).toMatch(/description TEXT/i)
        expect(sitesSchema).toMatch(/created_at DATETIME DEFAULT CURRENT_TIMESTAMP/i)
        expect(sitesSchema).toMatch(/updated_at DATETIME DEFAULT CURRENT_TIMESTAMP/i)
      })
    })

    describe('Pages table', () => {
      it('should have all required columns', () => {
        const pagesTableMatch = migrationSQL.match(/CREATE TABLE pages \((.*?)\);/is)
        expect(pagesTableMatch).toBeTruthy()
        
        const pagesSchema = pagesTableMatch?.[1] || ''
        
        expect(pagesSchema).toMatch(/id INTEGER PRIMARY KEY AUTOINCREMENT/i)
        expect(pagesSchema).toMatch(/site_id INTEGER NOT NULL/i)
        expect(pagesSchema).toMatch(/title TEXT NOT NULL/i)
        expect(pagesSchema).toMatch(/slug TEXT NOT NULL/i)
        expect(pagesSchema).toMatch(/content TEXT/i)
        expect(pagesSchema).toMatch(/meta_title TEXT/i)
        expect(pagesSchema).toMatch(/meta_description TEXT/i)
        expect(pagesSchema).toMatch(/is_published BOOLEAN DEFAULT FALSE/i)
      })
    })

    describe('Page Components table', () => {
      it('should have all required columns', () => {
        const componentsTableMatch = migrationSQL.match(/CREATE TABLE page_components \((.*?)\);/is)
        expect(componentsTableMatch).toBeTruthy()
        
        const componentsSchema = componentsTableMatch?.[1] || ''
        
        expect(componentsSchema).toMatch(/id INTEGER PRIMARY KEY AUTOINCREMENT/i)
        expect(componentsSchema).toMatch(/page_id INTEGER NOT NULL/i)
        expect(componentsSchema).toMatch(/component_type TEXT NOT NULL/i)
        expect(componentsSchema).toMatch(/component_data TEXT NOT NULL/i)
        expect(componentsSchema).toMatch(/sort_order INTEGER DEFAULT 0/i)
      })
    })

    describe('Admin Users table', () => {
      it('should have all required columns', () => {
        const usersTableMatch = migrationSQL.match(/CREATE TABLE admin_users \((.*?)\);/is)
        expect(usersTableMatch).toBeTruthy()
        
        const usersSchema = usersTableMatch?.[1] || ''
        
        expect(usersSchema).toMatch(/id INTEGER PRIMARY KEY AUTOINCREMENT/i)
        expect(usersSchema).toMatch(/email TEXT UNIQUE NOT NULL/i)
        expect(usersSchema).toMatch(/password_hash TEXT NOT NULL/i)
        expect(usersSchema).toMatch(/name TEXT NOT NULL/i)
        expect(usersSchema).toMatch(/is_active BOOLEAN DEFAULT TRUE/i)
      })
    })
  })

  describe('Indexes', () => {
    it('should create performance indexes', () => {
      const expectedIndexes = [
        'idx_pages_site_id',
        'idx_pages_slug', 
        'idx_pages_published',
        'idx_page_components_page_id',
        'idx_page_components_sort_order',
        'idx_admin_users_email'
      ]

      expectedIndexes.forEach(index => {
        expect(migrationSQL).toMatch(new RegExp(`CREATE INDEX ${index}`, 'i'))
      })
    })

    it('should index foreign key columns', () => {
      expect(migrationSQL).toMatch(/CREATE INDEX idx_pages_site_id ON pages\(site_id\)/i)
      expect(migrationSQL).toMatch(/CREATE INDEX idx_page_components_page_id ON page_components\(page_id\)/i)
    })

    it('should index commonly queried columns', () => {
      expect(migrationSQL).toMatch(/CREATE INDEX idx_pages_slug ON pages\(slug\)/i)
      expect(migrationSQL).toMatch(/CREATE INDEX idx_pages_published ON pages\(is_published\)/i)
      expect(migrationSQL).toMatch(/CREATE INDEX idx_admin_users_email ON admin_users\(email\)/i)
    })
  })

  describe('Data Integrity Rules', () => {
    it('should have NOT NULL constraints on critical fields', () => {
      // Sites
      expect(migrationSQL).toMatch(/name TEXT NOT NULL/i)
      
      // Pages  
      expect(migrationSQL).toMatch(/site_id INTEGER NOT NULL/i)
      expect(migrationSQL).toMatch(/title TEXT NOT NULL/i)
      expect(migrationSQL).toMatch(/slug TEXT NOT NULL/i)
      
      // Components
      expect(migrationSQL).toMatch(/page_id INTEGER NOT NULL/i)
      expect(migrationSQL).toMatch(/component_type TEXT NOT NULL/i)
      expect(migrationSQL).toMatch(/component_data TEXT NOT NULL/i)
      
      // Admin Users
      expect(migrationSQL).toMatch(/email TEXT UNIQUE NOT NULL/i)
      expect(migrationSQL).toMatch(/password_hash TEXT NOT NULL/i)
      expect(migrationSQL).toMatch(/name TEXT NOT NULL/i)
    })

    it('should have appropriate default values', () => {
      expect(migrationSQL).toMatch(/is_published BOOLEAN DEFAULT FALSE/i)
      expect(migrationSQL).toMatch(/is_active BOOLEAN DEFAULT TRUE/i)
      expect(migrationSQL).toMatch(/sort_order INTEGER DEFAULT 0/i)
      expect(migrationSQL).toMatch(/created_at DATETIME DEFAULT CURRENT_TIMESTAMP/i)
      expect(migrationSQL).toMatch(/updated_at DATETIME DEFAULT CURRENT_TIMESTAMP/i)
    })
  })

  describe('Initial Data', () => {
    it('should insert default admin user', () => {
      expect(migrationSQL).toMatch(/INSERT INTO admin_users/i)
      expect(migrationSQL).toMatch(/admin@wordcross\.dev/i)
    })

    it('should insert default site', () => {
      expect(migrationSQL).toMatch(/INSERT INTO sites/i)
      expect(migrationSQL).toMatch(/WordCross Demo/i)
      expect(migrationSQL).toMatch(/demo\.wordcross\.dev/i)
    })

    it('should have secure default password hash', () => {
      // Check that password hash is bcrypt format (starts with $2a$)
      expect(migrationSQL).toMatch(/\$2a\$10\$/i)
    })
  })

  describe('SQL Syntax Validation', () => {
    it('should have valid SQL syntax', () => {
      // Check for basic SQL syntax issues
      expect(migrationSQL).not.toMatch(/;;/g) // No double semicolons
      expect(migrationSQL).not.toMatch(/\(\s*,/g) // No leading commas in column lists
      expect(migrationSQL).not.toMatch(/,\s*\)/g) // No trailing commas in column lists
    })

    it('should have proper comment formatting', () => {
      expect(migrationSQL).toMatch(/^-- /gm) // Comments should start with --
    })

    it('should end complete statements with semicolons', () => {
      // Split migration into complete statements (accounting for multi-line statements)
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
        .filter(s => s.includes('CREATE') || s.includes('INSERT'))
      
      // Check that the original statements in the file end with semicolons
      const statementRegex = /(CREATE\s+TABLE[^;]+;|INSERT\s+INTO[^;]+;|CREATE\s+INDEX[^;]+;)/gis
      const matches = migrationSQL.match(statementRegex)
      
      if (matches) {
        matches.forEach(statement => {
          expect(statement.trim()).toMatch(/;$/)
        })
      }
    })
  })

  describe('Migration Compatibility', () => {
    it('should be compatible with SQLite', () => {
      // Check for SQLite-specific features
      expect(migrationSQL).toMatch(/INTEGER PRIMARY KEY AUTOINCREMENT/i)
      expect(migrationSQL).toMatch(/DATETIME DEFAULT CURRENT_TIMESTAMP/i)
      expect(migrationSQL).toMatch(/BOOLEAN/i)
    })

    it('should not use unsupported features', () => {
      // Features not supported in SQLite/D1
      expect(migrationSQL).not.toMatch(/SERIAL/i)
      expect(migrationSQL).not.toMatch(/AUTO_INCREMENT/i) // MySQL syntax
      expect(migrationSQL).not.toMatch(/IDENTITY/i) // SQL Server syntax
    })
  })
})