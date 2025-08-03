import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { FC } from 'hono/jsx'
import { verifyPassword, generateJWT, createAuthCookie, type LoginCredentials } from '../../lib/auth'
import type { AuthVariables } from '../../middleware/auth'
import type { Variables } from '../../types/database'
import { databaseMiddleware } from '../../middleware/database'

const app = new Hono<{ Variables: AuthVariables & Variables }>()

// Apply database middleware to this route
app.use('*', databaseMiddleware)

const loginSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(6)
})

app.get('/', (c) => {
  return c.html(<LoginPage />)
})

app.post('/api', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const db = c.get('db')
  
  if (!db) {
    console.error('Database not found in context!')
    return c.json({ error: 'Database connection error' }, 500)
  }
  
  try {
    const user = await db.getAdminUserByEmail(email)
    
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    if (!user.is_active) {
      return c.json({ error: 'Account is deactivated' }, 401)
    }
    
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    const token = await generateJWT(user)
    const cookie = createAuthCookie(token)
    
    c.header('Set-Cookie', cookie)
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

const LoginPage: FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to WordCross CMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your admin credentials to access the CMS
          </p>
        </div>
        <form className="mt-8 space-y-6" id="login-form">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-slate-800"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-slate-800"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in
            </button>
          </div>
          
          <div id="error-message" className="hidden text-red-600 dark:text-red-400 text-sm text-center"></div>
        </form>
      </div>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('login-form').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;
              const errorDiv = document.getElementById('error-message');
              
              try {
                const response = await fetch('/auth/login/api', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, password }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                  window.location.href = '/admin/dashboard';
                } else {
                  errorDiv.textContent = data.error || 'Login failed';
                  errorDiv.classList.remove('hidden');
                }
              } catch (error) {
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.classList.remove('hidden');
              }
            });
          `,
        }}
      />
    </div>
  )
}

export default app