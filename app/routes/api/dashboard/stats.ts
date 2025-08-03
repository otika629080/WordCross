import { Hono } from 'hono'
import { requireAuth } from '../../../middleware/auth'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

// Protect all routes
app.use('*', requireAuth)

// GET /api/dashboard/stats - Get dashboard statistics
app.get('/', async (c) => {
  const db = c.get('db')
  
  try {
    // Get all sites
    const sites = await db.getSites()
    const totalSites = sites.length
    
    // Get all pages across all sites
    let totalPages = 0
    let publishedPages = 0
    let draftPages = 0
    
    for (const site of sites) {
      const pages = await db.getPagesBySiteId(site.id)
      totalPages += pages.length
      
      for (const page of pages) {
        if (page.is_published) {
          publishedPages++
        } else {
          draftPages++
        }
      }
    }
    
    return c.json({
      totalSites,
      totalPages,
      publishedPages,
      draftPages,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return c.json({ error: 'Failed to fetch dashboard statistics' }, 500)
  }
})

export default app