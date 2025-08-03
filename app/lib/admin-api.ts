import type { Site, Page, CreateSiteInput, UpdateSiteInput } from '../types/database'

export interface AdminApiError {
  error: string
  details?: string
}

export interface AdminApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface SiteListResponse {
  sites: Site[]
  total: number
  page: number
  limit: number
}

export interface PageListResponse {
  pages: Page[]
  total: number
  page: number
  limit: number
}

export interface SiteStatsResponse {
  totalSites: number
  totalPages: number
  publishedPages: number
  draftPages: number
}

export class AdminApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AdminApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string }
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`,
        }
      }

      const data = await response.json() as T
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Sites API
  async getSites(page: number = 1, limit: number = 10): Promise<AdminApiResponse<SiteListResponse>> {
    return this.request<SiteListResponse>(`/sites?page=${page}&limit=${limit}`)
  }

  async getSite(id: number): Promise<AdminApiResponse<Site>> {
    return this.request<Site>(`/sites/${id}`)
  }

  async createSite(siteData: CreateSiteInput): Promise<AdminApiResponse<Site>> {
    return this.request<Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
    })
  }

  async updateSite(id: number, siteData: UpdateSiteInput): Promise<AdminApiResponse<Site>> {
    return this.request<Site>(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(siteData),
    })
  }

  async deleteSite(id: number): Promise<AdminApiResponse<void>> {
    return this.request<void>(`/sites/${id}`, {
      method: 'DELETE',
    })
  }

  // Pages API
  async getPages(siteId?: number, page: number = 1, limit: number = 10): Promise<AdminApiResponse<PageListResponse>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (siteId) {
      params.append('siteId', siteId.toString())
    }
    return this.request<PageListResponse>(`/pages?${params.toString()}`)
  }

  async getPage(id: number): Promise<AdminApiResponse<Page>> {
    return this.request<Page>(`/pages/${id}`)
  }

  // Dashboard stats
  async getDashboardStats(): Promise<AdminApiResponse<SiteStatsResponse>> {
    return this.request<SiteStatsResponse>('/dashboard/stats')
  }

  // Bulk operations
  async deleteSites(ids: number[]): Promise<AdminApiResponse<void>> {
    return this.request<void>('/sites/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }
}

// Singleton instance
export const adminApi = new AdminApiClient()