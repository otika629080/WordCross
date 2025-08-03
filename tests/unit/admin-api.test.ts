import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminApiClient } from '../../app/lib/admin-api'
import type { Site, CreateSiteInput } from '../../app/types/database'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AdminApiClient', () => {
  let adminApi: AdminApiClient

  beforeEach(() => {
    adminApi = new AdminApiClient('/api')
    vi.clearAllMocks()
  })

  const mockSite: Site = {
    id: 1,
    name: 'Test Site',
    domain: 'test.com',
    description: 'A test site',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  describe('getSites', () => {
    it('should fetch sites successfully', async () => {
      const mockResponse = {
        sites: [mockSite],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await adminApi.getSites(1, 10)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/sites?page=1&limit=10', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await adminApi.getSites()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      const result = await adminApi.getSites()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Internal server error')
    })
  })

  describe('getSite', () => {
    it('should fetch a single site successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSite,
      })

      const result = await adminApi.getSite(1)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSite)
      expect(mockFetch).toHaveBeenCalledWith('/api/sites/1', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should handle site not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Site not found' }),
      })

      const result = await adminApi.getSite(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Site not found')
    })
  })

  describe('createSite', () => {
    it('should create a site successfully', async () => {
      const createData: CreateSiteInput = {
        name: 'New Site',
        domain: 'new.com',
        description: 'A new site',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSite,
      })

      const result = await adminApi.createSite(createData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSite)
      expect(mockFetch).toHaveBeenCalledWith('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })
    })

    it('should handle validation errors', async () => {
      const createData: CreateSiteInput = {
        name: '',
        domain: 'invalid-domain',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation failed' }),
      })

      const result = await adminApi.createSite(createData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
    })
  })

  describe('updateSite', () => {
    it('should update a site successfully', async () => {
      const updateData = {
        name: 'Updated Site',
        description: 'Updated description',
      }

      const updatedSite = { ...mockSite, ...updateData }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedSite,
      })

      const result = await adminApi.updateSite(1, updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedSite)
      expect(mockFetch).toHaveBeenCalledWith('/api/sites/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
    })
  })

  describe('deleteSite', () => {
    it('should delete a site successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await adminApi.deleteSite(1)

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/sites/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('deleteSites', () => {
    it('should delete multiple sites successfully', async () => {
      const siteIds = [1, 2, 3]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await adminApi.deleteSites(siteIds)

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/sites/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: siteIds }),
      })
    })
  })

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockStats = {
        totalSites: 5,
        totalPages: 20,
        publishedPages: 15,
        draftPages: 5,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      const result = await adminApi.getDashboardStats()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockStats)
      expect(mockFetch).toHaveBeenCalledWith('/api/dashboard/stats', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('getPages', () => {
    it('should fetch pages with site filter', async () => {
      const mockPages = {
        pages: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPages,
      })

      const result = await adminApi.getPages(1, 1, 10)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPages)
      expect(mockFetch).toHaveBeenCalledWith('/api/pages?page=1&limit=10&siteId=1', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should fetch pages without site filter', async () => {
      const mockPages = {
        pages: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPages,
      })

      const result = await adminApi.getPages(undefined, 1, 10)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPages)
      expect(mockFetch).toHaveBeenCalledWith('/api/pages?page=1&limit=10', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })
})