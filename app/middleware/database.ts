// Database middleware for WordCross CMS
// Provides D1 database access to all routes

import { createMiddleware } from 'hono/factory'
import { createDatabase } from '../lib/db'
import type { Env, Variables } from '../types/database'

/**
 * Database middleware that injects Database instance into context
 * Makes database operations available to all routes via c.var.database
 */
export const databaseMiddleware = createMiddleware<{
  Bindings: Env
  Variables: Variables & { database: ReturnType<typeof createDatabase> }
}>(async (c, next) => {
  // Get D1 database from environment bindings
  const db = c.env?.DB
  
  if (!db) {
    // For development, create a mock database with the admin user
    console.warn('D1 database binding not found. Using mock database for development.')
    const mockDb = createMockD1()
    const database = createDatabase(mockDb as any)
    c.set('database', database)
    c.set('db', database)
    await next()
    return
  }

  // Create Database instance and attach to context
  const database = createDatabase(db)
  c.set('database', database)
  
  // Set Database instance for route compatibility
  c.set('db', database)
  
  await next()
})

/**
 * Database health check middleware
 * Verifies database connectivity before processing requests
 */
export const healthCheckMiddleware = createMiddleware<{
  Bindings: Env
  Variables: Variables & { database: ReturnType<typeof createDatabase> }
}>(async (c, next) => {
  const database = c.var.database
  
  if (!database) {
    return c.json({ error: 'Database not initialized' }, 500)
  }
  
  const isHealthy = await database.ping()
  
  if (!isHealthy) {
    return c.json({ error: 'Database connection failed' }, 503)
  }
  
  await next()
})

// Mock D1 database for development
function createMockD1() {
  const mockData = {
    adminUsers: [
      {
        id: 1,
        email: 'admin@wordcross.local',
        password_hash: '$2b$12$sq3pKjj4Fo1yHqCtLXxgwOe7C79wREidO.VxJRH6Exj69N1g39rHy',
        name: 'Admin User',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    sites: [],
    pages: [],
    pageComponents: []
  }

  return {
    prepare: (sql: string) => {
      return {
        bind: (...params: any[]) => {
          return {
            first: async () => {
              if (sql.includes('admin_users') && sql.includes('WHERE email = ?')) {
                const email = params[0]
                return mockData.adminUsers.find(user => user.email === email) || null
              }
              if (sql.includes('sites') && sql.includes('WHERE id = ?')) {
                const id = params[0]
                return mockData.sites.find((site: any) => site.id === id) || null
              }
              return null
            },
            all: async () => {
              if (sql.includes('sites')) {
                return { results: mockData.sites }
              }
              if (sql.includes('pages')) {
                return { results: mockData.pages }
              }
              return { results: [] }
            },
            run: async () => {
              return { success: true, changes: 1 }
            }
          }
        },
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => ({ success: true, changes: 1 })
      }
    }
  }
}