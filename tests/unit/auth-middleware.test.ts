import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { authMiddleware, requireAuth, optionalAuth, getAuthenticatedUser } from '../../app/middleware/auth'
import { generateJWT } from '../../app/lib/auth'
import type { AdminUser } from '../../app/types/database'

describe('Auth Middleware', () => {
  let app: Hono
  const mockUser: AdminUser = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed_password',
    name: 'Test User',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }

  beforeEach(() => {
    app = new Hono()
  })

  describe('authMiddleware', () => {
    it('should set isAuthenticated to false when no token provided', async () => {
      app.use('*', authMiddleware)
      app.get('/test', (c) => {
        const isAuthenticated = c.get('isAuthenticated')
        return c.json({ isAuthenticated })
      })

      const res = await app.request('/test')
      const data = await res.json()
      
      expect(data.isAuthenticated).toBe(false)
    })

    it('should set isAuthenticated to true with valid token in header', async () => {
      const token = await generateJWT(mockUser)
      
      app.use('*', authMiddleware)
      app.get('/test', (c) => {
        const isAuthenticated = c.get('isAuthenticated')
        const user = c.get('user')
        return c.json({ isAuthenticated, user })
      })

      const res = await app.request('/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      
      expect(data.isAuthenticated).toBe(true)
      expect(data.user.email).toBe(mockUser.email)
    })

    it('should set isAuthenticated to true with valid token in cookie', async () => {
      const token = await generateJWT(mockUser)
      
      app.use('*', authMiddleware)
      app.get('/test', (c) => {
        const isAuthenticated = c.get('isAuthenticated')
        const user = c.get('user')
        return c.json({ isAuthenticated, user })
      })

      const res = await app.request('/test', {
        headers: {
          'Cookie': `auth_token=${token}`
        }
      })
      const data = await res.json()
      
      expect(data.isAuthenticated).toBe(true)
      expect(data.user.email).toBe(mockUser.email)
    })

    it('should set isAuthenticated to false with invalid token', async () => {
      app.use('*', authMiddleware)
      app.get('/test', (c) => {
        const isAuthenticated = c.get('isAuthenticated')
        return c.json({ isAuthenticated })
      })

      const res = await app.request('/test', {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      })
      const data = await res.json()
      
      expect(data.isAuthenticated).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should return 401 when not authenticated', async () => {
      app.use('*', authMiddleware)
      app.use('/protected', requireAuth)
      app.get('/protected', (c) => c.json({ message: 'protected' }))

      const res = await app.request('/protected')
      
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Authentication required')
    })

    it('should allow access when authenticated', async () => {
      const token = await generateJWT(mockUser)
      
      app.use('*', authMiddleware)
      app.use('/protected', requireAuth)
      app.get('/protected', (c) => c.json({ message: 'protected' }))

      const res = await app.request('/protected', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('protected')
    })
  })

  describe('optionalAuth', () => {
    it('should work without authentication', async () => {
      app.use('*', optionalAuth)
      app.get('/test', (c) => {
        const isAuthenticated = c.get('isAuthenticated')
        return c.json({ isAuthenticated })
      })

      const res = await app.request('/test')
      const data = await res.json()
      
      expect(res.status).toBe(200)
      expect(data.isAuthenticated).toBe(false)
    })

    it('should work with authentication', async () => {
      const token = await generateJWT(mockUser)
      
      app.use('*', optionalAuth)
      app.get('/test', (c) => {
        const isAuthenticated = c.get('isAuthenticated')
        const user = c.get('user')
        return c.json({ isAuthenticated, user })
      })

      const res = await app.request('/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      
      expect(res.status).toBe(200)
      expect(data.isAuthenticated).toBe(true)
      expect(data.user.email).toBe(mockUser.email)
    })
  })

  describe('getAuthenticatedUser', () => {
    it('should return null when not authenticated', async () => {
      app.use('*', authMiddleware)
      app.get('/test', (c) => {
        const user = getAuthenticatedUser(c)
        return c.json({ user })
      })

      const res = await app.request('/test')
      const data = await res.json()
      
      expect(data.user).toBeNull()
    })

    it('should return user when authenticated', async () => {
      const token = await generateJWT(mockUser)
      
      app.use('*', authMiddleware)
      app.get('/test', (c) => {
        const user = getAuthenticatedUser(c)
        return c.json({ user })
      })

      const res = await app.request('/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(mockUser.email)
    })
  })
})