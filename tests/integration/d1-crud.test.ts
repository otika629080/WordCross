import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Database } from '../../app/lib/db'
import type { CreateSiteInput, CreatePageInput } from '../../app/types/database'

// Mock D1 Database for integration testing
// In a real environment, this would use a test D1 database instance
class MockD1Database implements D1Database {
  private data: Map<string, unknown[]> = new Map()
  private idCounters: Map<string, number> = new Map()

  constructor() {
    // Initialize tables
    this.data.set('sites', [])
    this.data.set('pages', [])
    this.data.set('page_components', [])
    this.data.set('admin_users', [])
    
    this.idCounters.set('sites', 1)
    this.idCounters.set('pages', 1)
    this.idCounters.set('page_components', 1)
    this.idCounters.set('admin_users', 1)
  }

  prepare(query: string) {
    return new MockD1PreparedStatement(query, this.data, this.idCounters)
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error('Not implemented in mock')
  }

  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    throw new Error('Not implemented in mock')
  }

  async exec(query: string): Promise<D1ExecResult> {
    throw new Error('Not implemented in mock')
  }
}

class MockD1PreparedStatement implements D1PreparedStatement {
  private bindings: unknown[] = []

  constructor(
    private query: string,
    private data: Map<string, unknown[]>,
    private idCounters: Map<string, number>
  ) {}

  bind(...values: unknown[]): D1PreparedStatement {
    this.bindings = values
    return this
  }

  async first<T = unknown>(): Promise<T | null> {
    const results = await this.all<T>()
    return results.results[0] || null
  }

  async run(): Promise<D1Result> {
    const changes = this.executeQuery()
    return {
      success: true,
      meta: {
        duration: 10,
        changes: typeof changes === 'number' ? changes : 1,
        last_row_id: this.idCounters.get('sites') || 1
      }
    }
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const results = this.executeQuery() as T[]
    return {
      success: true,
      results,
      meta: {
        duration: 10
      }
    }
  }

  private executeQuery(): unknown[] | number {
    const query = this.query.toLowerCase().trim()
    
    if (query.includes('select 1')) {
      return [{ '1': 1 }]
    }

    if (query.includes('insert into sites')) {
      return this.insertSite()
    }

    if (query.includes('select * from sites where id = ?')) {
      return this.getSiteById()
    }

    if (query.includes('select * from sites')) {
      return this.data.get('sites') || []
    }

    if (query.includes('insert into pages')) {
      return this.insertPage()
    }

    if (query.includes('select * from pages where site_id = ?')) {
      return this.getPagesBySiteId()
    }

    if (query.includes('delete from sites where id = ?')) {
      return this.deleteSite()
    }

    return []
  }

  private insertSite(): unknown[] {
    const sites = this.data.get('sites') || []
    const id = this.idCounters.get('sites') || 1
    
    const newSite = {
      id,
      name: this.bindings[0] as string,
      domain: this.bindings[1] as string,
      description: this.bindings[2] as string,
      created_at: this.bindings[3] as string,
      updated_at: this.bindings[4] as string
    }
    
    sites.push(newSite)
    this.data.set('sites', sites)
    this.idCounters.set('sites', id + 1)
    
    return [newSite]
  }

  private getSiteById(): unknown[] {
    const sites = this.data.get('sites') || []
    const id = this.bindings[0] as number
    const site = sites.find((s: unknown) => (s as { id: number }).id === id)
    return site ? [site] : []
  }

  private insertPage(): unknown[] {
    const pages = this.data.get('pages') || []
    const id = this.idCounters.get('pages') || 1
    
    const newPage = {
      id,
      site_id: this.bindings[0] as number,
      title: this.bindings[1] as string,
      slug: this.bindings[2] as string,
      content: this.bindings[3] as string,
      meta_title: this.bindings[4] as string,
      meta_description: this.bindings[5] as string,
      is_published: this.bindings[6] as boolean,
      created_at: this.bindings[7] as string,
      updated_at: this.bindings[8] as string
    }
    
    pages.push(newPage)
    this.data.set('pages', pages)
    this.idCounters.set('pages', id + 1)
    
    return [newPage]
  }

  private getPagesBySiteId(): unknown[] {
    const pages = this.data.get('pages') || []
    const siteId = this.bindings[0] as number
    return pages.filter((p: unknown) => (p as { site_id: number }).site_id === siteId)
  }

  private deleteSite(): number {
    const sites = this.data.get('sites') || []
    const id = this.bindings[0] as number
    const initialLength = sites.length
    
    const filteredSites = sites.filter((s: unknown) => (s as { id: number }).id !== id)
    this.data.set('sites', filteredSites)
    
    const deletedCount = initialLength - filteredSites.length
    return deletedCount
  }
}

describe('D1 CRUD Operations (Integration)', () => {
  let database: Database
  let mockDb: MockD1Database

  beforeEach(() => {
    mockDb = new MockD1Database()
    database = new Database(mockDb as unknown as D1Database)
  })

  afterEach(() => {
    // Clean up
    mockDb = new MockD1Database()
  })

  describe('Sites CRUD', () => {
    it('should create and retrieve a site', async () => {
      const input: CreateSiteInput = {
        name: 'Test Site',
        domain: 'test.com',
        description: 'A test site'
      }

      // Create site
      const createdSite = await database.createSite(input)
      expect(createdSite.id).toBe(1)
      expect(createdSite.name).toBe(input.name)
      expect(createdSite.domain).toBe(input.domain)

      // Retrieve site by ID
      const retrievedSite = await database.getSiteById(1)
      expect(retrievedSite).toBeTruthy()
      expect(retrievedSite?.name).toBe(input.name)
    })

    it('should list all sites', async () => {
      // Create multiple sites
      await database.createSite({ name: 'Site 1', domain: 'site1.com' })
      await database.createSite({ name: 'Site 2', domain: 'site2.com' })

      const sites = await database.getSites()
      expect(sites).toHaveLength(2)
      expect(sites[0].name).toBe('Site 1')
      expect(sites[1].name).toBe('Site 2')
    })

    it('should delete a site', async () => {
      // Create a site
      const site = await database.createSite({ name: 'To Delete', domain: 'delete.com' })
      
      // Delete the site
      const deleted = await database.deleteSite(site.id)
      expect(deleted).toBe(true)

      // Verify it's gone
      const retrievedSite = await database.getSiteById(site.id)
      expect(retrievedSite).toBeNull()
    })
  })

  describe('Pages CRUD', () => {
    it('should create and retrieve pages for a site', async () => {
      // First create a site
      const site = await database.createSite({ name: 'Test Site', domain: 'test.com' })

      const pageInput: CreatePageInput = {
        site_id: site.id,
        title: 'Home Page',
        slug: 'home',
        content: '{"components": []}',
        is_published: true
      }

      // Create page
      const createdPage = await database.createPage(pageInput)
      expect(createdPage.id).toBe(1)
      expect(createdPage.site_id).toBe(site.id)
      expect(createdPage.title).toBe(pageInput.title)

      // Retrieve pages for site
      const pages = await database.getPagesBySiteId(site.id)
      expect(pages).toHaveLength(1)
      expect(pages[0].title).toBe(pageInput.title)
    })

    it('should handle multiple pages for different sites', async () => {
      // Create two sites
      const site1 = await database.createSite({ name: 'Site 1' })
      const site2 = await database.createSite({ name: 'Site 2' })

      // Create pages for each site
      await database.createPage({
        site_id: site1.id,
        title: 'Site 1 Home',
        slug: 'home'
      })
      await database.createPage({
        site_id: site2.id,
        title: 'Site 2 Home',
        slug: 'home'
      })
      await database.createPage({
        site_id: site1.id,
        title: 'Site 1 About',
        slug: 'about'
      })

      // Verify pages are correctly associated
      const site1Pages = await database.getPagesBySiteId(site1.id)
      const site2Pages = await database.getPagesBySiteId(site2.id)

      expect(site1Pages).toHaveLength(2)
      expect(site2Pages).toHaveLength(1)
      expect(site1Pages[0].title).toBe('Site 1 Home')
      expect(site2Pages[0].title).toBe('Site 2 Home')
    })
  })

  describe('Database Health', () => {
    it('should ping database successfully', async () => {
      const isHealthy = await database.ping()
      expect(isHealthy).toBe(true)
    })

    it('should handle database connection issues', async () => {
      // Create a database instance with a broken connection
      const brokenDb = {
        prepare: () => ({
          first: () => Promise.reject(new Error('Connection failed'))
        })
      }
      
      const brokenDatabase = new Database(brokenDb as unknown as D1Database)
      const isHealthy = await brokenDatabase.ping()
      expect(isHealthy).toBe(false)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain referential integrity between sites and pages', async () => {
      // Create site
      const site = await database.createSite({ name: 'Parent Site' })

      // Create page
      const page = await database.createPage({
        site_id: site.id,
        title: 'Child Page',
        slug: 'child'
      })

      // Verify the relationship
      expect(page.site_id).toBe(site.id)

      const retrievedPages = await database.getPagesBySiteId(site.id)
      expect(retrievedPages).toHaveLength(1)
      expect(retrievedPages[0].site_id).toBe(site.id)
    })

    it('should handle concurrent operations', async () => {
      // Simulate concurrent site creation
      const createPromises = [
        database.createSite({ name: 'Concurrent Site 1' }),
        database.createSite({ name: 'Concurrent Site 2' }),
        database.createSite({ name: 'Concurrent Site 3' })
      ]

      const sites = await Promise.all(createPromises)
      
      expect(sites).toHaveLength(3)
      expect(sites[0].id).toBe(1)
      expect(sites[1].id).toBe(2)
      expect(sites[2].id).toBe(3)

      // Verify all sites exist
      const allSites = await database.getSites()
      expect(allSites).toHaveLength(3)
    })
  })
})