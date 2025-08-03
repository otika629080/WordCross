import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { FC } from 'hono/jsx'
import { requireAuth } from '../../../middleware/auth'
import AdminLayout from '../../../components/admin/AdminLayout'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'
import type { Site, Page } from '../../../types/database'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
})

app.use('*', requireAuth)

app.get('/:id', zValidator('param', paramsSchema), async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')
  
  try {
    const site = await db.getSiteById(id)
    
    if (!site) {
      return c.html(<NotFoundPage />)
    }
    
    const pages = await db.getPagesBySiteId(id)
    
    return c.html(<SiteDetailPage site={site} pages={pages} />)
  } catch (error) {
    console.error('Site detail error:', error)
    return c.html(<NotFoundPage />)
  }
})

interface SiteDetailPageProps {
  site: Site
  pages: Page[]
}

const SiteDetailPage: FC<SiteDetailPageProps> = ({ site, pages }) => {
  const publishedPages = pages.filter(page => page.is_published)
  const draftPages = pages.filter(page => !page.is_published)

  return (
    <AdminLayout title={site.name} currentPage="/admin/sites">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a
              href="/admin/sites"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← Back to Sites
            </a>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {site.name}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={`/admin/sites/${site.id}/edit`}
              className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-400 transition-colors"
            >
              Edit Site
            </a>
            <a
              href={`/admin/pages/new?siteId=${site.id}`}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
            >
              Add Page
            </a>
          </div>
        </div>

        {/* Site Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Site Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{site.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Domain</dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {site.domain || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No domain set</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {new Date(site.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {new Date(site.updated_at).toLocaleDateString()}
              </dd>
            </div>
            {site.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{site.description}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Pages Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {pages.length}
                </p>
              </div>
              <div className="text-blue-500 text-2xl">📄</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {publishedPages.length}
                </p>
              </div>
              <div className="text-green-500 text-2xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {draftPages.length}
                </p>
              </div>
              <div className="text-yellow-500 text-2xl">📝</div>
            </div>
          </div>
        </div>

        {/* Pages List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pages</h3>
          </div>
          
          {pages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {page.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          /{page.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          page.is_published
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(page.updated_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No pages yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first page to get started.
              </p>
              <a
                href={`/admin/pages/new?siteId=${site.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
              >
                Create First Page
              </a>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

const NotFoundPage: FC = () => {
  return (
    <AdminLayout title="Site Not Found" currentPage="/admin/sites">
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Site Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The site you're looking for doesn't exist or has been deleted.
        </p>
        <a
          href="/admin/sites"
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
        >
          Back to Sites
        </a>
      </div>
    </AdminLayout>
  )
}

export default app