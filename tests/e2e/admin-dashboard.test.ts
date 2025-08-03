import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import dashboardApp from '../../app/routes/admin/dashboard'
import sitesIndexApp from '../../app/routes/admin/sites/index'
import sitesNewApp from '../../app/routes/admin/sites/new'
import sitesIdApp from '../../app/routes/admin/sites/[id]'
import { Database } from '../../app/lib/db'
import { generateJWT } from '../../app/lib/auth'
import { authMiddleware } from '../../app/middleware/auth'
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

describe('Admin Dashboard E2E Tests', () => {
  let app: Hono
  let authToken: string

  const mockUser: AdminUser = {
    id: 1,
    email: 'admin@wordcross.test',
    password_hash: 'hashed',
    name: 'Admin User',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockSites: Site[] = [
    {
      id: 1,
      name: 'Personal Blog',
      domain: 'blog.example.com',
      description: 'My personal blog',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Business Site',
      domain: 'business.com',
      description: 'Company website',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    },
  ]

  const mockPages: Page[] = [
    {
      id: 1,
      site_id: 1,
      title: 'Home',
      slug: 'home',
      content: null,
      meta_title: null,
      meta_description: null,
      is_published: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      site_id: 1,
      title: 'About',
      slug: 'about',
      content: null,
      meta_title: null,
      meta_description: null,
      is_published: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ]

  beforeEach(async () => {
    app = new Hono()
    
    // Set up middleware and database
    app.use('*', authMiddleware)
    app.use('*', (c, next) => {
      c.set('db', mockDb)
      return next()
    })
    
    // Mount admin routes
    app.route('/admin/dashboard', dashboardApp)
    app.route('/admin/sites', sitesIndexApp)
    app.route('/admin/sites/new', sitesNewApp)
    app.route('/admin/sites', sitesIdApp)
    
    // Generate auth token
    authToken = await generateJWT(mockUser)
    
    vi.clearAllMocks()
  })

  describe('Dashboard Navigation Flow', () => {
    it('should display dashboard with correct statistics', async () => {
      vi.mocked(mockDb.getSites).mockResolvedValue(mockSites)
      vi.mocked(mockDb.getPagesBySiteId).mockImplementation((siteId) => {
        if (siteId === 1) return Promise.resolve(mockPages)
        return Promise.resolve([])
      })

      const res = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      
      // Check dashboard title
      expect(html).toContain('Dashboard')
      
      // Check statistics are displayed (HTML contains the stats)
      expect(html).toContain('Total Sites')
      expect(html).toContain('Total Pages')
      expect(html).toContain('Published Pages')
      expect(html).toContain('Draft Pages')
      
      // Check quick actions are present
      expect(html).toContain('Create New Site')
      expect(html).toContain('Create New Page')
      
      // Check recent sites section
      expect(html).toContain('Recent Sites')
      expect(html).toContain('Personal Blog')
      expect(html).toContain('Business Site')
    })

    it('should handle empty dashboard state', async () => {
      vi.mocked(mockDb.getSites).mockResolvedValue([])

      const res = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      
      // Check empty state message
      expect(html).toContain('No sites yet')
      expect(html).toContain('Create your first site')
    })

    it('should require authentication', async () => {
      const res = await app.request('/admin/dashboard')
      
      expect(res.status).toBe(401)
    })
  })

  describe('Sites Management Flow', () => {
    it('should display sites list page', async () => {
      vi.mocked(mockDb.getSites).mockResolvedValue(mockSites)

      const res = await app.request('/admin/sites', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      
      // Check sites list title
      expect(html).toContain('Sites')
      
      // Check create button
      expect(html).toContain('Create New Site')
      
      // Check sites are listed
      expect(html).toContain('Personal Blog')
      expect(html).toContain('Business Site')
      expect(html).toContain('blog.example.com')
      expect(html).toContain('business.com')
      
      // Check action buttons
      expect(html).toContain('View')
      expect(html).toContain('Edit')
      expect(html).toContain('Delete')
    })

    it('should display create new site page', async () => {
      const res = await app.request('/admin/sites/new', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      
      // Check form elements
      expect(html).toContain('Create New Site')
      expect(html).toContain('Site Name')
      expect(html).toContain('Domain')
      expect(html).toContain('Description')
      expect(html).toContain('Create Site')
      expect(html).toContain('Cancel')
    })

    it('should create a new site successfully', async () => {
      const newSite = {
        id: 3,
        name: 'Test Site',
        domain: 'test.com',
        description: 'A test site',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      
      vi.mocked(mockDb.createSite).mockResolvedValue(newSite)

      const res = await app.request('/admin/sites/new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'name=Test Site&domain=test.com&description=A test site',
      })

      expect(res.status).toBe(302) // Redirect after creation
      expect(res.headers.get('Location')).toBe('/admin/sites/3')
      expect(mockDb.createSite).toHaveBeenCalledWith({
        name: 'Test Site',
        domain: 'test.com',
        description: 'A test site',
      })
    })

    it('should display site detail page', async () => {
      vi.mocked(mockDb.getSiteById).mockResolvedValue(mockSites[0])
      vi.mocked(mockDb.getPagesBySiteId).mockResolvedValue(mockPages)

      const res = await app.request('/admin/sites/1', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      
      // Check site details
      expect(html).toContain('Personal Blog')
      expect(html).toContain('blog.example.com')
      expect(html).toContain('My personal blog')
      
      // Check site info section
      expect(html).toContain('Site Information')
      
      // Check pages overview
      expect(html).toContain('Total Pages')
      expect(html).toContain('Published')
      expect(html).toContain('Drafts')
      
      // Check pages list
      expect(html).toContain('Home')
      expect(html).toContain('About')
      expect(html).toContain('Published')
      expect(html).toContain('Draft')
      
      // Check action buttons
      expect(html).toContain('Edit Site')
      expect(html).toContain('Add Page')
    })

    it('should handle site not found', async () => {
      vi.mocked(mockDb.getSiteById).mockResolvedValue(null)

      const res = await app.request('/admin/sites/999', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200) // Returns 200 with error page
      const html = await res.text()
      
      expect(html).toContain('Site Not Found')
      expect(html).toContain('Back to Sites')
    })

    it('should handle sites list empty state', async () => {
      vi.mocked(mockDb.getSites).mockResolvedValue([])

      const res = await app.request('/admin/sites', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      
      expect(html).toContain('No sites yet')
      expect(html).toContain('Create your first site')
      expect(html).toContain('Create First Site')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully on dashboard', async () => {
      vi.mocked(mockDb.getSites).mockRejectedValue(new Error('Database error'))

      const res = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200) // Should still render with fallback data
      const html = await res.text()
      
      expect(html).toContain('Dashboard')
      // Should show zero stats as fallback
    })

    it('should handle database errors gracefully on sites list', async () => {
      vi.mocked(mockDb.getSites).mockRejectedValue(new Error('Database error'))

      const res = await app.request('/admin/sites', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200) // Should still render with empty state
      const html = await res.text()
      
      expect(html).toContain('Sites')
    })

    it('should handle site creation errors', async () => {
      vi.mocked(mockDb.createSite).mockRejectedValue(new Error('Database error'))

      const res = await app.request('/admin/sites/new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'name=Test Site',
      })

      expect(res.status).toBe(200) // Returns form with error
      const html = await res.text()
      
      expect(html).toContain('Failed to create site')
    })
  })

  describe('Authentication Flow', () => {
    it('should redirect unauthorized users', async () => {
      const res = await app.request('/admin/dashboard')
      
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Authentication required')
    })

    it('should allow authenticated users', async () => {
      vi.mocked(mockDb.getSites).mockResolvedValue([])

      const res = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(res.status).toBe(200)
    })

    it('should handle invalid tokens', async () => {
      const res = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      })

      expect(res.status).toBe(401)
    })
  })
})