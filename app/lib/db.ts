// Database connection and query helpers for WordCross CMS
// Strictly typed - no 'any' usage

import type { 
  Site, 
  Page, 
  PageComponent, 
  AdminUser,
  CreateSiteInput,
  UpdateSiteInput,
  CreatePageInput,
  UpdatePageInput,
  CreateComponentInput,
  CreateAdminUserInput,
  QueryResult,
  ComponentType,
  ComponentData
} from '../types/database'

/**
 * Database helper class for D1 operations
 * Provides type-safe CRUD operations for all entities
 */
export class Database {
  constructor(private db: D1Database) {}

  // Sites operations
  async getSites(): Promise<Site[]> {
    const result = await this.db.prepare('SELECT * FROM sites ORDER BY created_at DESC').all()
    return result.results as Site[]
  }

  async getSiteById(id: number): Promise<Site | null> {
    const result = await this.db.prepare('SELECT * FROM sites WHERE id = ?').bind(id).first()
    return result as Site | null
  }

  async getSiteByDomain(domain: string): Promise<Site | null> {
    const result = await this.db.prepare('SELECT * FROM sites WHERE domain = ?').bind(domain).first()
    return result as Site | null
  }

  async createSite(input: CreateSiteInput): Promise<Site> {
    const now = new Date().toISOString()
    const result = await this.db
      .prepare('INSERT INTO sites (name, domain, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
      .bind(input.name, input.domain || null, input.description || null, now, now)
      .first()
    
    if (!result) {
      throw new Error('Failed to create site')
    }
    return result as Site
  }

  async updateSite(id: number, input: UpdateSiteInput): Promise<Site | null> {
    const updates: string[] = []
    const values: (string | null)[] = []

    if (input.name !== undefined) {
      updates.push('name = ?')
      values.push(input.name)
    }
    if (input.domain !== undefined) {
      updates.push('domain = ?')
      values.push(input.domain)
    }
    if (input.description !== undefined) {
      updates.push('description = ?')
      values.push(input.description)
    }

    if (updates.length === 0) {
      return this.getSiteById(id)
    }

    updates.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id.toString())

    const sql = `UPDATE sites SET ${updates.join(', ')} WHERE id = ? RETURNING *`
    const result = await this.db.prepare(sql).bind(...values).first()
    
    return result as Site | null
  }

  async deleteSite(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM sites WHERE id = ?').bind(id).run()
    return (result.meta?.changes || 0) > 0
  }

  // Pages operations
  async getPagesBySiteId(siteId: number): Promise<Page[]> {
    const result = await this.db
      .prepare('SELECT * FROM pages WHERE site_id = ? ORDER BY created_at DESC')
      .bind(siteId)
      .all()
    return result.results as Page[]
  }

  async getPageById(id: number): Promise<Page | null> {
    const result = await this.db.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first()
    return result as Page | null
  }

  async getPageBySlug(siteId: number, slug: string): Promise<Page | null> {
    const result = await this.db
      .prepare('SELECT * FROM pages WHERE site_id = ? AND slug = ?')
      .bind(siteId, slug)
      .first()
    return result as Page | null
  }

  async getPublishedPages(siteId: number): Promise<Page[]> {
    const result = await this.db
      .prepare('SELECT * FROM pages WHERE site_id = ? AND is_published = TRUE ORDER BY created_at DESC')
      .bind(siteId)
      .all()
    return result.results as Page[]
  }

  async createPage(input: CreatePageInput): Promise<Page> {
    const now = new Date().toISOString()
    const result = await this.db
      .prepare(`
        INSERT INTO pages (site_id, title, slug, content, meta_title, meta_description, is_published, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
        RETURNING *
      `)
      .bind(
        input.site_id,
        input.title,
        input.slug,
        input.content || null,
        input.meta_title || null,
        input.meta_description || null,
        input.is_published || false,
        now,
        now
      )
      .first()
    
    if (!result) {
      throw new Error('Failed to create page')
    }
    return result as Page
  }

  async updatePage(id: number, input: UpdatePageInput): Promise<Page | null> {
    const updates: string[] = []
    const values: (string | number | boolean | null)[] = []

    if (input.title !== undefined) {
      updates.push('title = ?')
      values.push(input.title)
    }
    if (input.slug !== undefined) {
      updates.push('slug = ?')
      values.push(input.slug)
    }
    if (input.content !== undefined) {
      updates.push('content = ?')
      values.push(input.content)
    }
    if (input.meta_title !== undefined) {
      updates.push('meta_title = ?')
      values.push(input.meta_title)
    }
    if (input.meta_description !== undefined) {
      updates.push('meta_description = ?')
      values.push(input.meta_description)
    }
    if (input.is_published !== undefined) {
      updates.push('is_published = ?')
      values.push(input.is_published)
    }

    if (updates.length === 0) {
      return this.getPageById(id)
    }

    updates.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    const sql = `UPDATE pages SET ${updates.join(', ')} WHERE id = ? RETURNING *`
    const result = await this.db.prepare(sql).bind(...values).first()
    
    return result as Page | null
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM pages WHERE id = ?').bind(id).run()
    return (result.meta?.changes || 0) > 0
  }

  // Page components operations
  async getComponentsByPageId(pageId: number): Promise<PageComponent[]> {
    const result = await this.db
      .prepare('SELECT * FROM page_components WHERE page_id = ? ORDER BY sort_order ASC')
      .bind(pageId)
      .all()
    return result.results as PageComponent[]
  }

  async createComponent(input: CreateComponentInput): Promise<PageComponent> {
    const result = await this.db
      .prepare(`
        INSERT INTO page_components (page_id, component_type, component_data, sort_order, created_at) 
        VALUES (?, ?, ?, ?, ?) 
        RETURNING *
      `)
      .bind(
        input.page_id,
        input.component_type,
        JSON.stringify(input.component_data),
        input.sort_order || 0,
        new Date().toISOString()
      )
      .first()
    
    if (!result) {
      throw new Error('Failed to create component')
    }
    return result as PageComponent
  }

  async updateComponentOrder(componentId: number, sortOrder: number): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE page_components SET sort_order = ? WHERE id = ?')
      .bind(sortOrder, componentId)
      .run()
    return (result.meta?.changes || 0) > 0
  }

  async deleteComponent(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM page_components WHERE id = ?').bind(id).run()
    return (result.meta?.changes || 0) > 0
  }

  // Admin users operations
  async getAdminUsers(): Promise<Omit<AdminUser, 'password_hash'>[]> {
    const result = await this.db
      .prepare('SELECT id, email, name, is_active, created_at, updated_at FROM admin_users ORDER BY created_at DESC')
      .all()
    return result.results as Omit<AdminUser, 'password_hash'>[]
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    const result = await this.db
      .prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE')
      .bind(email)
      .first()
    return result as AdminUser | null
  }

  async createAdminUser(input: CreateAdminUserInput): Promise<Omit<AdminUser, 'password_hash'>> {
    const now = new Date().toISOString()
    const result = await this.db
      .prepare(`
        INSERT INTO admin_users (email, password_hash, name, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?) 
        RETURNING id, email, name, is_active, created_at, updated_at
      `)
      .bind(
        input.email,
        input.password_hash,
        input.name,
        input.is_active || true,
        now,
        now
      )
      .first()
    
    if (!result) {
      throw new Error('Failed to create admin user')
    }
    return result as Omit<AdminUser, 'password_hash'>
  }

  // Database health and utility operations
  async ping(): Promise<boolean> {
    try {
      await this.db.prepare('SELECT 1').first()
      return true
    } catch {
      return false
    }
  }

  async runMigration(sql: string): Promise<QueryResult> {
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    const results: QueryResult[] = []
    
    for (const statement of statements) {
      try {
        const result = await this.db.prepare(statement.trim()).run()
        results.push({
          success: true,
          results: [],
          meta: {
            duration: result.meta.duration,
            changes: result.meta.changes,
            last_row_id: result.meta.last_row_id
          }
        })
      } catch (error) {
        return {
          success: false,
          results: [],
          meta: { duration: 0 }
        }
      }
    }

    return {
      success: true,
      results: [],
      meta: { duration: results.reduce((sum, r) => sum + (r.meta?.duration || 0), 0) }
    }
  }
}

/**
 * Create a new Database instance
 */
export function createDatabase(db: D1Database): Database {
  return new Database(db)
}

/**
 * Utility function to parse component data safely
 */
export function parseComponentData<T = ComponentData>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    throw new Error('Invalid component data JSON')
  }
}