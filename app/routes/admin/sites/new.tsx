import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { FC } from 'hono/jsx'
import { requireAuth } from '../../../middleware/auth'
import AdminLayout from '../../../components/admin/AdminLayout'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  description: z.string().optional(),
})

app.use('*', requireAuth)

app.get('/', (c) => {
  return c.html(<NewSitePage />)
})

app.post('/', zValidator('form', createSiteSchema), async (c) => {
  const siteData = c.req.valid('form')
  const db = c.get('db')
  
  try {
    const site = await db.createSite({
      name: siteData.name,
      domain: siteData.domain || null,
      description: siteData.description || null,
    })
    
    return c.redirect(`/admin/sites/${site.id}`)
  } catch (error) {
    console.error('Error creating site:', error)
    return c.html(<NewSitePage error="Failed to create site" />)
  }
})

interface NewSitePageProps {
  error?: string
}

const NewSitePage: FC<NewSitePageProps> = ({ error }) => {
  return (
    <AdminLayout title="Create New Site" currentPage="/admin/sites">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-4">
          <a
            href="/admin/sites"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Back to Sites
          </a>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create New Site
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Create Site Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="My Awesome Site"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The display name for your site
              </p>
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain (Optional)
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="example.com"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Custom domain for your site (can be set later)
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="A brief description of your site"
              ></textarea>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Optional description for your site
              </p>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
              >
                Create Site
              </button>
              <a
                href="/admin/sites"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

export default app