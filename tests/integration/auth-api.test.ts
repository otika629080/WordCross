import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import loginApp from '../../app/routes/auth/login'
import logoutApp from '../../app/routes/auth/logout'
import { Database } from '../../app/lib/db'
import { hashPassword } from '../../app/lib/auth'
import type { AdminUser } from '../../app/types/database'

// Mock database
const mockDb = {
  getAdminUserByEmail: vi.fn()
} as unknown as Database

describe('Auth API Integration Tests', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.use('*', (c, next) => {
      c.set('db', mockDb)
      return next()
    })
    app.route('/auth/login', loginApp)
    app.route('/auth/logout', logoutApp)
    vi.clearAllMocks()
  })

  describe('POST /auth/login/api', () => {
    const mockUser: AdminUser = {
      id: 1,
      email: 'test@example.com',
      password_hash: '',
      name: 'Test User',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    beforeEach(async () => {
      mockUser.password_hash = await hashPassword('testpassword123')
    })

    it('should login successfully with valid credentials', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(mockUser)

      const res = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('test@example.com')
      expect(data.token).toBeDefined()
      
      // Check if auth cookie is set
      const setCookieHeader = res.headers.get('Set-Cookie')
      expect(setCookieHeader).toContain('auth_token=')
      expect(setCookieHeader).toContain('HttpOnly')
    })

    it('should fail with invalid email', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(null)

      const res = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'testpassword123'
        })
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Invalid email or password')
    })

    it('should fail with incorrect password', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(mockUser)

      const res = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Invalid email or password')
    })

    it('should fail with deactivated user', async () => {
      const deactivatedUser = { ...mockUser, is_active: false }
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(deactivatedUser)

      const res = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Account is deactivated')
    })

    it('should fail with invalid request body', async () => {
      const res = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'short'
        })
      })

      expect(res.status).toBe(400)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockRejectedValue(new Error('Database error'))

      const res = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      })

      expect(res.status).toBe(500)
      const data = await res.json()
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET /auth/login', () => {
    it('should return login page HTML', async () => {
      const res = await app.request('/auth/login')
      
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      
      const html = await res.text()
      expect(html).toContain('Sign in to WordCross CMS')
      expect(html).toContain('email')
      expect(html).toContain('password')
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await app.request('/auth/logout', {
        method: 'POST'
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe('Logged out successfully')
      
      // Check if logout cookie is set
      const setCookieHeader = res.headers.get('Set-Cookie')
      expect(setCookieHeader).toContain('auth_token=')
      expect(setCookieHeader).toContain('Max-Age=0')
    })
  })

  describe('GET /auth/logout', () => {
    it('should redirect to login page', async () => {
      const res = await app.request('/auth/logout')
      
      expect(res.status).toBe(302)
      expect(res.headers.get('Location')).toBe('/auth/login')
      
      // Check if logout cookie is set
      const setCookieHeader = res.headers.get('Set-Cookie')
      expect(setCookieHeader).toContain('auth_token=')
      expect(setCookieHeader).toContain('Max-Age=0')
    })
  })
})