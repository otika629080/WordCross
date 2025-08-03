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
  const db = c.env.DB
  
  if (!db) {
    throw new Error('D1 database binding not found. Check wrangler.jsonc configuration.')
  }

  // Create Database instance and attach to context
  const database = createDatabase(db)
  c.set('database', database)
  
  // Set raw D1 instance for backward compatibility
  c.set('db', db)
  
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