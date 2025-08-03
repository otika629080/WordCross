import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../../../middleware/auth'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  description: z.string().optional(),
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
})

// Protect all routes
app.use('*', requireAuth)

// GET /api/sites - List sites with pagination
app.get('/', zValidator('query', querySchema), async (c) => {
  const { page, limit } = c.req.valid('query')
  const db = c.get('db')
  
  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  
  try {
    // Get sites with pagination
    const sites = await db.getSites()
    const total = sites.length
    
    // Simple pagination (in production, implement DB-level pagination)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedSites = sites.slice(startIndex, endIndex)
    
    return c.json({
      sites: paginatedSites,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (error) {
    console.error('Error fetching sites:', error)
    return c.json({ error: 'Failed to fetch sites' }, 500)
  }
})

// POST /api/sites - Create new site
app.post('/', zValidator('json', createSiteSchema), async (c) => {
  const siteData = c.req.valid('json')
  const db = c.get('db')
  
  try {
    const site = await db.createSite(siteData)
    return c.json(site, 201)
  } catch (error) {
    console.error('Error creating site:', error)
    return c.json({ error: 'Failed to create site' }, 500)
  }
})

// POST /api/sites/bulk-delete - Delete multiple sites
app.post('/bulk-delete', zValidator('json', z.object({
  ids: z.array(z.number()).min(1),
})), async (c) => {
  const { ids } = c.req.valid('json')
  const db = c.get('db')
  
  try {
    for (const id of ids) {
      await db.deleteSite(id)
    }
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting sites:', error)
    return c.json({ error: 'Failed to delete sites' }, 500)
  }
})

export default app