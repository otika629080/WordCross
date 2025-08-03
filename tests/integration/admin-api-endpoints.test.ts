import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import sitesIndexApp from '../../app/routes/api/sites/index'
import sitesIdApp from '../../app/routes/api/sites/[id]'
import pagesApp from '../../app/routes/api/pages/index'
import dashboardStatsApp from '../../app/routes/api/dashboard/stats'
import { Database } from '../../app/lib/db'
import { generateJWT } from '../../app/lib/auth'
import type { AdminUser, Site, Page } from '../../app/types/database'

// Mock database
const mockDb = {
  getSites: vi.fn(),
  getSiteById: vi.fn(),
  createSite: vi.fn(),
  updateSite: vi.fn(),
  deleteSite: vi.fn(),
  getPagesBySiteId: vi.fn(),
} as unknown as Database

describe('Admin API Endpoints Integration Tests', () => {
  let app: Hono
  let authToken: string

  const mockUser: AdminUser = {
    id: 1,
    email: 'admin@test.com',
    password_hash: 'hashed',
    name: 'Admin User',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockSite: Site = {
    id: 1,
    name: 'Test Site',
    domain: 'test.com',
    description: 'A test site',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockPage: Page = {
    id: 1,
    site_id: 1,
    title: 'Test Page',
    slug: 'test-page',
    content: null,
    meta_title: null,
    meta_description: null,
    is_published: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  beforeEach(async () => {
    app = new Hono()
    
    // Set up middleware and database
    app.use('*', (c, next) => {
      c.set('db', mockDb)
      c.set('isAuthenticated', true)
      c.set('user', { sub: '1', email: 'admin@test.com', name: 'Admin' })
      return next()
    })
    
    // Mount API routes
    app.route('/api/sites', sitesIndexApp)
    app.route('/api/sites', sitesIdApp)
    app.route('/api/pages', pagesApp)
    app.route('/api/dashboard/stats', dashboardStatsApp)
    
    // Generate auth token
    authToken = await generateJWT(mockUser)
    
    vi.clearAllMocks()
  })

  describe('Sites API', () => {
    describe('GET /api/sites', () => {
      it('should return sites list with pagination', async () => {
        vi.mocked(mockDb.getSites).mockResolvedValue([mockSite])

        const res = await app.request('/api/sites?page=1&limit=10', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.sites).toHaveLength(1)
        expect(data.sites[0]).toEqual(mockSite)
        expect(data.total).toBe(1)
        expect(data.page).toBe(1)
        expect(data.limit).toBe(10)
      })

      it('should handle empty sites list', async () => {
        vi.mocked(mockDb.getSites).mockResolvedValue([])

        const res = await app.request('/api/sites')
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data.sites).toHaveLength(0)
        expect(data.total).toBe(0)
      })

      it('should handle database errors', async () => {
        vi.mocked(mockDb.getSites).mockRejectedValue(new Error('Database error'))

        const res = await app.request('/api/sites')
        expect(res.status).toBe(500)
        
        const data = await res.json()
        expect(data.error).toBe('Failed to fetch sites')
      })
    })

    describe('POST /api/sites', () => {
      it('should create a new site successfully', async () => {
        const newSite = { ...mockSite, id: 2, name: 'New Site' }
        vi.mocked(mockDb.createSite).mockResolvedValue(newSite)

        const res = await app.request('/api/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'New Site',
            domain: 'new.com',
            description: 'A new site',
          }),
        })

        expect(res.status).toBe(201)
        const data = await res.json()
        expect(data.name).toBe('New Site')
        expect(mockDb.createSite).toHaveBeenCalledWith({
          name: 'New Site',
          domain: 'new.com',
          description: 'A new site',
        })
      })

      it('should validate required fields', async () => {
        const res = await app.request('/api/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: '', // Invalid: empty name
          }),
        })

        expect(res.status).toBe(400)
      })

      it('should handle database creation errors', async () => {
        vi.mocked(mockDb.createSite).mockRejectedValue(new Error('Database error'))

        const res = await app.request('/api/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test Site',
          }),
        })

        expect(res.status).toBe(500)
        const data = await res.json()
        expect(data.error).toBe('Failed to create site')
      })
    })

    describe('POST /api/sites/bulk-delete', () => {
      it('should delete multiple sites successfully', async () => {
        vi.mocked(mockDb.deleteSite).mockResolvedValue(undefined)

        const res = await app.request('/api/sites/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: [1, 2, 3],
          }),
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.success).toBe(true)
        expect(mockDb.deleteSite).toHaveBeenCalledTimes(3)
      })

      it('should validate ids array', async () => {
        const res = await app.request('/api/sites/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: [], // Invalid: empty array
          }),
        })

        expect(res.status).toBe(400)
      })
    })
  })

  describe('Individual Site API', () => {
    describe('GET /api/sites/:id', () => {
      it('should return a specific site', async () => {
        vi.mocked(mockDb.getSiteById).mockResolvedValue(mockSite)

        const res = await app.request('/api/sites/1')
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data).toEqual(mockSite)
      })

      it('should return 404 for non-existent site', async () => {
        vi.mocked(mockDb.getSiteById).mockResolvedValue(null)

        const res = await app.request('/api/sites/999')
        expect(res.status).toBe(404)
        
        const data = await res.json()
        expect(data.error).toBe('Site not found')
      })

      it('should validate site ID parameter', async () => {
        const res = await app.request('/api/sites/invalid')
        expect(res.status).toBe(400)
      })
    })

    describe('PUT /api/sites/:id', () => {
      it('should update a site successfully', async () => {
        const updatedSite = { ...mockSite, name: 'Updated Site' }
        vi.mocked(mockDb.getSiteById).mockResolvedValue(mockSite)
        vi.mocked(mockDb.updateSite).mockResolvedValue(updatedSite)

        const res = await app.request('/api/sites/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Updated Site',
          }),
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.name).toBe('Updated Site')
      })

      it('should return 404 for non-existent site', async () => {
        vi.mocked(mockDb.getSiteById).mockResolvedValue(null)

        const res = await app.request('/api/sites/999', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Updated Site',
          }),
        })

        expect(res.status).toBe(404)
      })
    })

    describe('DELETE /api/sites/:id', () => {
      it('should delete a site successfully', async () => {
        vi.mocked(mockDb.getSiteById).mockResolvedValue(mockSite)
        vi.mocked(mockDb.deleteSite).mockResolvedValue(undefined)

        const res = await app.request('/api/sites/1', {
          method: 'DELETE',
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.success).toBe(true)
      })

      it('should return 404 for non-existent site', async () => {
        vi.mocked(mockDb.getSiteById).mockResolvedValue(null)

        const res = await app.request('/api/sites/999', {
          method: 'DELETE',
        })

        expect(res.status).toBe(404)
      })
    })
  })

  describe('Pages API', () => {
    describe('GET /api/pages', () => {
      it('should return pages with site filter', async () => {
        vi.mocked(mockDb.getPagesBySiteId).mockResolvedValue([mockPage])

        const res = await app.request('/api/pages?siteId=1&page=1&limit=10')
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data.pages).toHaveLength(1)
        expect(data.pages[0]).toEqual(mockPage)
      })

      it('should return all pages without site filter', async () => {
        vi.mocked(mockDb.getSites).mockResolvedValue([mockSite])
        vi.mocked(mockDb.getPagesBySiteId).mockResolvedValue([mockPage])

        const res = await app.request('/api/pages')
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data.pages).toHaveLength(1)
      })
    })
  })

  describe('Dashboard Stats API', () => {
    describe('GET /api/dashboard/stats', () => {
      it('should return dashboard statistics', async () => {
        vi.mocked(mockDb.getSites).mockResolvedValue([mockSite])
        vi.mocked(mockDb.getPagesBySiteId).mockResolvedValue([mockPage, { ...mockPage, id: 2, is_published: false }])

        const res = await app.request('/api/dashboard/stats')
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data.totalSites).toBe(1)
        expect(data.totalPages).toBe(2)
        expect(data.publishedPages).toBe(1)
        expect(data.draftPages).toBe(1)
      })

      it('should handle empty data', async () => {
        vi.mocked(mockDb.getSites).mockResolvedValue([])

        const res = await app.request('/api/dashboard/stats')
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data.totalSites).toBe(0)
        expect(data.totalPages).toBe(0)
        expect(data.publishedPages).toBe(0)
        expect(data.draftPages).toBe(0)
      })
    })
  })
})