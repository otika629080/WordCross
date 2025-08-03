import { Hono } from 'hono'
import { createLogoutCookie } from '../../lib/auth'
import type { AuthVariables } from '../../middleware/auth'

const app = new Hono<{ Variables: AuthVariables }>()

app.post('/', async (c) => {
  try {
    const logoutCookie = createLogoutCookie()
    c.header('Set-Cookie', logoutCookie)
    
    return c.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'Logout failed' }, 500)
  }
})

app.get('/', async (c) => {
  // Handle GET request for logout (redirect to login)
  const logoutCookie = createLogoutCookie()
  c.header('Set-Cookie', logoutCookie)
  
  return c.redirect('/auth/login')
})

export default app