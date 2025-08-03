import type { Context, Next } from 'hono'
import { verifyJWT, extractTokenFromHeader, extractTokenFromCookie, type JWTPayload } from '../lib/auth'

export interface AuthVariables {
  user: JWTPayload
  isAuthenticated: boolean
}

export async function authMiddleware(c: Context, next: Next): Promise<void> {
  // Try to extract token from Authorization header first, then from cookies
  const authHeader = c.req.header('Authorization')
  const cookieHeader = c.req.header('Cookie')
  
  let token = extractTokenFromHeader(authHeader)
  if (!token) {
    token = extractTokenFromCookie(cookieHeader)
  }
  
  if (!token) {
    c.set('isAuthenticated', false)
    await next()
    return
  }
  
  const payload = await verifyJWT(token)
  if (!payload) {
    c.set('isAuthenticated', false)
    await next()
    return
  }
  
  c.set('user', payload)
  c.set('isAuthenticated', true)
  await next()
}

export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const isAuthenticated = c.get('isAuthenticated')
  
  if (!isAuthenticated) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  await next()
}

export function optionalAuth(c: Context, next: Next): Promise<void> {
  // This middleware runs authMiddleware but doesn't require authentication
  return authMiddleware(c, next)
}

export function getAuthenticatedUser(c: Context): JWTPayload | null {
  const isAuthenticated = c.get('isAuthenticated')
  if (!isAuthenticated) {
    return null
  }
  return c.get('user')
}