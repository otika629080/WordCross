import { sign, verify } from 'hono/jwt'
import { compare, hash } from 'bcryptjs'
import type { AdminUser } from '../types/database'

export interface JWTPayload {
  sub: string
  email: string
  name: string
  iat: number
  exp: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: AdminUser
  token?: string
  error?: string
}

const JWT_SECRET = 'your-secret-key-here' // TODO: Move to environment variable
const JWT_EXPIRES_IN = 24 * 60 * 60 // 24 hours in seconds

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function generateJWT(user: AdminUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: JWTPayload = {
    sub: user.id.toString(),
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + JWT_EXPIRES_IN
  }
  
  return await sign(payload, JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET) as JWTPayload
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export function extractTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null
  }
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
  const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='))
  
  if (!authCookie) {
    return null
  }
  
  return authCookie.substring(11) // Remove 'auth_token=' prefix
}

export function createAuthCookie(token: string): string {
  // In development, don't use Secure flag since we're using HTTP
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? 'Secure; ' : ''
  return `auth_token=${token}; HttpOnly; ${secureFlag}SameSite=Strict; Path=/; Max-Age=${JWT_EXPIRES_IN}`
}

export function createLogoutCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? 'Secure; ' : ''
  return `auth_token=; HttpOnly; ${secureFlag}SameSite=Strict; Path=/; Max-Age=0`
}