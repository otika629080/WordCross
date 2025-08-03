import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Database, createDatabase, parseComponentData } from '../../app/lib/db'
import type { CreateSiteInput, CreatePageInput, CreateAdminUserInput, ComponentData } from '../../app/types/database'

// Mock D1Database
const mockD1Database = {
  prepare: vi.fn(),
  exec: vi.fn(),
  dump: vi.fn(),
  batch: vi.fn()
}

// Mock D1PreparedStatement
const createMockStatement = (results: unknown[] = [], meta = {}) => ({
  bind: vi.fn().mockReturnThis(),
  first: vi.fn().mockResolvedValue(results[0] || null),
  all: vi.fn().mockResolvedValue({ results, meta }),
  run: vi.fn().mockResolvedValue({ 
    success: true, 
    changes: 1, 
    meta: { duration: 10, changes: 1, last_row_id: 1, ...meta }
  })
})

describe('Database', () => {
  let database: Database
  let mockStatement: ReturnType<typeof createMockStatement>

  beforeEach(() => {
    vi.clearAllMocks()
    mockStatement = createMockStatement()
    mockD1Database.prepare.mockReturnValue(mockStatement)
    database = createDatabase(mockD1Database as unknown as D1Database)
  })

  describe('Sites operations', () => {
    it('should get all sites', async () => {
      const mockSites = [
        { id: 1, name: 'Site 1', domain: 'site1.com', created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: 2, name: 'Site 2', domain: 'site2.com', created_at: '2025-01-02', updated_at: '2025-01-02' }
      ]
      mockStatement.all.mockResolvedValue({ results: mockSites, meta: {} })

      const sites = await database.getSites()

      expect(mockD1Database.prepare).toHaveBeenCalledWith('SELECT * FROM sites ORDER BY created_at DESC')
      expect(sites).toEqual(mockSites)
    })

    it('should get site by id', async () => {
      const mockSite = { id: 1, name: 'Test Site', domain: 'test.com' }
      mockStatement.first.mockResolvedValue(mockSite)

      const site = await database.getSiteById(1)

      expect(mockD1Database.prepare).toHaveBeenCalledWith('SELECT * FROM sites WHERE id = ?')
      expect(mockStatement.bind).toHaveBeenCalledWith(1)
      expect(site).toEqual(mockSite)
    })

    it('should create a new site', async () => {
      const input: CreateSiteInput = {
        name: 'New Site',
        domain: 'new.com',
        description: 'A new site'
      }
      const mockCreatedSite = { id: 1, ...input, created_at: '2025-01-01', updated_at: '2025-01-01' }
      mockStatement.first.mockResolvedValue(mockCreatedSite)

      const site = await database.createSite(input)

      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        'INSERT INTO sites (name, domain, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *'
      )
      expect(mockStatement.bind).toHaveBeenCalledWith(
        input.name,
        input.domain,
        input.description,
        expect.any(String),
        expect.any(String)
      )
      expect(site).toEqual(mockCreatedSite)
    })

    it('should update a site', async () => {
      const mockUpdatedSite = { id: 1, name: 'Updated Site', domain: 'updated.com' }
      mockStatement.first.mockResolvedValue(mockUpdatedSite)

      const site = await database.updateSite(1, { name: 'Updated Site' })

      expect(mockStatement.bind).toHaveBeenCalled()
      expect(site).toEqual(mockUpdatedSite)
    })

    it('should delete a site', async () => {
      mockStatement.run.mockResolvedValue({ 
        success: true, 
        changes: 1, 
        meta: { duration: 10, changes: 1, last_row_id: 1 }
      })

      const result = await database.deleteSite(1)

      expect(mockD1Database.prepare).toHaveBeenCalledWith('DELETE FROM sites WHERE id = ?')
      expect(mockStatement.bind).toHaveBeenCalledWith(1)
      expect(result).toBe(true)
    })
  })

  describe('Pages operations', () => {
    it('should get pages by site id', async () => {
      const mockPages = [
        { id: 1, site_id: 1, title: 'Home', slug: 'home' },
        { id: 2, site_id: 1, title: 'About', slug: 'about' }
      ]
      mockStatement.all.mockResolvedValue({ results: mockPages, meta: {} })

      const pages = await database.getPagesBySiteId(1)

      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        'SELECT * FROM pages WHERE site_id = ? ORDER BY created_at DESC'
      )
      expect(mockStatement.bind).toHaveBeenCalledWith(1)
      expect(pages).toEqual(mockPages)
    })

    it('should create a new page', async () => {
      const input: CreatePageInput = {
        site_id: 1,
        title: 'New Page',
        slug: 'new-page',
        content: '{}',
        is_published: true
      }
      const mockCreatedPage = { id: 1, ...input, created_at: '2025-01-01', updated_at: '2025-01-01' }
      mockStatement.first.mockResolvedValue(mockCreatedPage)

      const page = await database.createPage(input)

      expect(mockStatement.bind).toHaveBeenCalledWith(
        input.site_id,
        input.title,
        input.slug,
        input.content,
        null,
        null,
        input.is_published,
        expect.any(String),
        expect.any(String)
      )
      expect(page).toEqual(mockCreatedPage)
    })
  })

  describe('Admin users operations', () => {
    it('should get admin users without password hash', async () => {
      const mockUsers = [
        { id: 1, email: 'admin@test.com', name: 'Admin', is_active: true }
      ]
      mockStatement.all.mockResolvedValue({ results: mockUsers, meta: {} })

      const users = await database.getAdminUsers()

      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        'SELECT id, email, name, is_active, created_at, updated_at FROM admin_users ORDER BY created_at DESC'
      )
      expect(users).toEqual(mockUsers)
    })

    it('should create a new admin user', async () => {
      const input: CreateAdminUserInput = {
        email: 'new@admin.com',
        password_hash: 'hashed_password',
        name: 'New Admin'
      }
      const mockCreatedUser = { 
        id: 1, 
        email: input.email, 
        name: input.name, 
        is_active: true,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
      mockStatement.first.mockResolvedValue(mockCreatedUser)

      const user = await database.createAdminUser(input)

      expect(mockStatement.bind).toHaveBeenCalledWith(
        input.email,
        input.password_hash,
        input.name,
        true,
        expect.any(String),
        expect.any(String)
      )
      expect(user).toEqual(mockCreatedUser)
    })
  })

  describe('Utility operations', () => {
    it('should ping database successfully', async () => {
      mockStatement.first.mockResolvedValue({})

      const result = await database.ping()

      expect(mockD1Database.prepare).toHaveBeenCalledWith('SELECT 1')
      expect(result).toBe(true)
    })

    it('should handle ping failure', async () => {
      mockStatement.first.mockRejectedValue(new Error('DB Error'))

      const result = await database.ping()

      expect(result).toBe(false)
    })
  })
})

describe('Utility functions', () => {
  describe('createDatabase', () => {
    it('should create a Database instance', () => {
      const db = createDatabase(mockD1Database as unknown as D1Database)
      expect(db).toBeInstanceOf(Database)
    })
  })

  describe('parseComponentData', () => {
    it('should parse valid JSON component data', () => {
      const componentData: ComponentData = {
        content: 'Hello World',
        fontSize: 'lg',
        textAlign: 'center',
        textColor: '#000000'
      }
      const jsonString = JSON.stringify(componentData)

      const parsed = parseComponentData(jsonString)

      expect(parsed).toEqual(componentData)
    })

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }'

      expect(() => parseComponentData(invalidJson)).toThrow('Invalid component data JSON')
    })
  })
})