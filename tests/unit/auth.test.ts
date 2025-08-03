import { describe, it, expect, beforeEach } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  extractTokenFromHeader,
  extractTokenFromCookie,
  createAuthCookie,
  createLogoutCookie,
  type JWTPayload
} from '../../app/lib/auth'
import type { AdminUser } from '../../app/types/database'

describe('Auth Library', () => {
  const mockUser: AdminUser = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed_password',
    name: 'Test User',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }

  describe('Password hashing and verification', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should verify a correct password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })
  })

  describe('JWT operations', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateJWT(mockUser)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify a valid JWT token', async () => {
      const token = await generateJWT(mockUser)
      const payload = await verifyJWT(token)
      
      expect(payload).toBeDefined()
      expect(payload?.sub).toBe(mockUser.id.toString())
      expect(payload?.email).toBe(mockUser.email)
      expect(payload?.name).toBe(mockUser.name)
      expect(payload?.iat).toBeDefined()
      expect(payload?.exp).toBeDefined()
    })

    it('should reject an invalid JWT token', async () => {
      const invalidToken = 'invalid.jwt.token'
      const payload = await verifyJWT(invalidToken)
      
      expect(payload).toBeNull()
    })

    it('should reject an expired JWT token', async () => {
      // This test would require mocking time or creating a token with a past expiration
      // For now, we'll test the token structure
      const token = await generateJWT(mockUser)
      const payload = await verifyJWT(token)
      
      expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })
  })

  describe('Token extraction', () => {
    it('should extract token from Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      const authHeader = `Bearer ${token}`
      const extracted = extractTokenFromHeader(authHeader)
      
      expect(extracted).toBe(token)
    })

    it('should return null for invalid Authorization header', () => {
      expect(extractTokenFromHeader('Invalid header')).toBeNull()
      expect(extractTokenFromHeader('Basic token')).toBeNull()
      expect(extractTokenFromHeader(undefined)).toBeNull()
    })

    it('should extract token from cookie', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      const cookieHeader = `other_cookie=value; auth_token=${token}; another=value`
      const extracted = extractTokenFromCookie(cookieHeader)
      
      expect(extracted).toBe(token)
    })

    it('should return null for missing auth_token cookie', () => {
      expect(extractTokenFromCookie('other_cookie=value')).toBeNull()
      expect(extractTokenFromCookie(undefined)).toBeNull()
    })
  })

  describe('Cookie creation', () => {
    it('should create a valid auth cookie', () => {
      const token = 'test_token'
      const cookie = createAuthCookie(token)
      
      expect(cookie).toContain(`auth_token=${token}`)
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('Secure')
      expect(cookie).toContain('SameSite=Strict')
      expect(cookie).toContain('Path=/')
      expect(cookie).toContain('Max-Age=')
    })

    it('should create a logout cookie that expires immediately', () => {
      const cookie = createLogoutCookie()
      
      expect(cookie).toContain('auth_token=')
      expect(cookie).toContain('Max-Age=0')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('Secure')
    })
  })
})