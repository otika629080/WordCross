import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../../../middleware/auth'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().optional(),
  description: z.string().optional(),
})

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
})

// Protect all routes
app.use('*', requireAuth)

// GET /api/sites/:id - Get single site
app.get('/:id', zValidator('param', paramsSchema), async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')
  
  try {
    const site = await db.getSiteById(id)
    
    if (!site) {
      return c.json({ error: 'Site not found' }, 404)
    }
    
    return c.json(site)
  } catch (error) {
    console.error('Error fetching site:', error)
    return c.json({ error: 'Failed to fetch site' }, 500)
  }
})

// PUT /api/sites/:id - Update site
app.put('/:id', zValidator('param', paramsSchema), zValidator('json', updateSiteSchema), async (c) => {
  const { id } = c.req.valid('param')
  const updateData = c.req.valid('json')
  const db = c.get('db')
  
  try {
    // Check if site exists
    const existingSite = await db.getSiteById(id)
    if (!existingSite) {
      return c.json({ error: 'Site not found' }, 404)
    }
    
    const updatedSite = await db.updateSite(id, updateData)
    return c.json(updatedSite)
  } catch (error) {
    console.error('Error updating site:', error)
    return c.json({ error: 'Failed to update site' }, 500)
  }
})

// DELETE /api/sites/:id - Delete site
app.delete('/:id', zValidator('param', paramsSchema), async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')
  
  try {
    // Check if site exists
    const existingSite = await db.getSiteById(id)
    if (!existingSite) {
      return c.json({ error: 'Site not found' }, 404)
    }
    
    await db.deleteSite(id)
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting site:', error)
    return c.json({ error: 'Failed to delete site' }, 500)
  }
})

export default app