import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import loginApp from '../../app/routes/auth/login'
import logoutApp from '../../app/routes/auth/logout'
import { Database } from '../../app/lib/db'
import { hashPassword } from '../../app/lib/auth'
import { authMiddleware, requireAuth } from '../../app/middleware/auth'
import type { AdminUser } from '../../app/types/database'

// Mock database
const mockDb = {
  getAdminUserByEmail: vi.fn()
} as unknown as Database

describe('Authentication Flow E2E Tests', () => {
  let app: Hono
  
  const mockUser: AdminUser = {
    id: 1,
    email: 'admin@wordcross.test',
    password_hash: '',
    name: 'Admin User',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }

  beforeEach(async () => {
    app = new Hono()
    
    // Set up middleware and database
    app.use('*', (c, next) => {
      c.set('db', mockDb)
      return next()
    })
    
    // Set up routes
    app.route('/auth/login', loginApp)
    app.route('/auth/logout', logoutApp)
    
    // Protected route for testing
    app.use('/admin/*', authMiddleware)
    app.use('/admin/*', requireAuth)
    app.get('/admin/dashboard', (c) => {
      const user = c.get('user')
      return c.json({ message: 'Welcome to admin dashboard', user })
    })
    
    // Set up mock user with hashed password
    mockUser.password_hash = await hashPassword('adminpassword123')
    vi.clearAllMocks()
  })

  describe('Complete Authentication Flow', () => {
    it('should complete full login-access-logout flow', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(mockUser)

      // Step 1: Access login page
      const loginPageRes = await app.request('/auth/login')
      expect(loginPageRes.status).toBe(200)
      const loginHtml = await loginPageRes.text()
      expect(loginHtml).toContain('Sign in to WordCross CMS')

      // Step 2: Attempt to access protected route without auth (should fail)
      const unauthorizedRes = await app.request('/admin/dashboard')
      expect(unauthorizedRes.status).toBe(401)
      const unauthorizedData = await unauthorizedRes.json()
      expect(unauthorizedData.error).toBe('Authentication required')

      // Step 3: Login with valid credentials
      const loginRes = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@wordcross.test',
          password: 'adminpassword123'
        })
      })

      expect(loginRes.status).toBe(200)
      const loginData = await loginRes.json()
      expect(loginData.success).toBe(true)
      expect(loginData.token).toBeDefined()
      
      // Extract token for subsequent requests
      const token = loginData.token
      const setCookieHeader = loginRes.headers.get('Set-Cookie')
      expect(setCookieHeader).toContain('auth_token=')

      // Step 4: Access protected route with token (should succeed)
      const authorizedRes = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      expect(authorizedRes.status).toBe(200)
      const dashboardData = await authorizedRes.json()
      expect(dashboardData.message).toBe('Welcome to admin dashboard')
      expect(dashboardData.user.email).toBe('admin@wordcross.test')

      // Step 5: Access protected route with cookie (should also succeed)
      const cookieRes = await app.request('/admin/dashboard', {
        headers: {
          'Cookie': `auth_token=${token}`
        }
      })

      expect(cookieRes.status).toBe(200)
      const cookieData = await cookieRes.json()
      expect(cookieData.user.email).toBe('admin@wordcross.test')

      // Step 6: Logout
      const logoutRes = await app.request('/auth/logout', {
        method: 'POST'
      })

      expect(logoutRes.status).toBe(200)
      const logoutData = await logoutRes.json()
      expect(logoutData.success).toBe(true)
      
      const logoutCookie = logoutRes.headers.get('Set-Cookie')
      expect(logoutCookie).toContain('Max-Age=0')

      // Step 7: Try to access protected route after logout (should fail)
      const postLogoutRes = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Note: This would still work because JWT is stateless
      // In a real implementation, you might want to use a token blacklist
      expect(postLogoutRes.status).toBe(200) // JWT is still valid
    })

    it('should handle invalid login attempts', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(null)

      // Attempt login with non-existent user
      const invalidEmailRes = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
      })

      expect(invalidEmailRes.status).toBe(401)
      const invalidEmailData = await invalidEmailRes.json()
      expect(invalidEmailData.error).toBe('Invalid email or password')

      // Try to access protected route (should fail)
      const unauthorizedRes = await app.request('/admin/dashboard')
      expect(unauthorizedRes.status).toBe(401)
    })

    it('should handle invalid passwords', async () => {
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(mockUser)

      // Attempt login with wrong password
      const wrongPasswordRes = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@wordcross.test',
          password: 'wrongpassword'
        })
      })

      expect(wrongPasswordRes.status).toBe(401)
      const wrongPasswordData = await wrongPasswordRes.json()
      expect(wrongPasswordData.error).toBe('Invalid email or password')
    })

    it('should handle deactivated user accounts', async () => {
      const deactivatedUser = { ...mockUser, is_active: false }
      vi.mocked(mockDb.getAdminUserByEmail).mockResolvedValue(deactivatedUser)

      const deactivatedRes = await app.request('/auth/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@wordcross.test',
          password: 'adminpassword123'
        })
      })

      expect(deactivatedRes.status).toBe(401)
      const deactivatedData = await deactivatedRes.json()
      expect(deactivatedData.error).toBe('Account is deactivated')
    })

    it('should handle malformed JWT tokens', async () => {
      // Try to access protected route with invalid token
      const invalidTokenRes = await app.request('/admin/dashboard', {
        headers: {
          'Authorization': 'Bearer invalid.jwt.token'
        }
      })

      expect(invalidTokenRes.status).toBe(401)
      const invalidTokenData = await invalidTokenRes.json()
      expect(invalidTokenData.error).toBe('Authentication required')
    })
  })

  describe('Logout Flow', () => {
    it('should redirect to login on GET logout', async () => {
      const logoutGetRes = await app.request('/auth/logout')
      
      expect(logoutGetRes.status).toBe(302)
      expect(logoutGetRes.headers.get('Location')).toBe('/auth/login')
      
      const logoutCookie = logoutGetRes.headers.get('Set-Cookie')
      expect(logoutCookie).toContain('auth_token=')
      expect(logoutCookie).toContain('Max-Age=0')
    })
  })
})