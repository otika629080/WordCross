import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../../../middleware/auth'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

const querySchema = z.object({
  siteId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
})

// Protect all routes
app.use('*', requireAuth)

// GET /api/pages - List pages with optional site filter and pagination
app.get('/', zValidator('query', querySchema), async (c) => {
  const { siteId, page, limit } = c.req.valid('query')
  const db = c.get('db')
  
  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  
  try {
    let pages
    
    if (siteId) {
      pages = await db.getPagesBySiteId(siteId)
    } else {
      // Get all pages across all sites (for global page management)
      const sites = await db.getSites()
      const allPages = []
      for (const site of sites) {
        const sitePages = await db.getPagesBySiteId(site.id)
        allPages.push(...sitePages)
      }
      pages = allPages
    }
    
    const total = pages.length
    
    // Simple pagination (in production, implement DB-level pagination)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedPages = pages.slice(startIndex, endIndex)
    
    return c.json({
      pages: paginatedPages,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return c.json({ error: 'Failed to fetch pages' }, 500)
  }
})

export default app