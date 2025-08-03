import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { requireAuth } from '../../../middleware/auth'
import AdminLayout from '../../../components/admin/AdminLayout'
import type { Database } from '../../../lib/db'
import type { AuthVariables } from '../../../middleware/auth'
import type { Site } from '../../../types/database'

const app = new Hono<{ Variables: AuthVariables & { db: Database } }>()

app.use('*', requireAuth)

app.get('/', async (c) => {
  const db = c.get('db')
  
  try {
    const sites = await db.getSites()
    return c.html(<SitesListPage sites={sites} />)
  } catch (error) {
    console.error('Sites list error:', error)
    return c.html(<SitesListPage sites={[]} />)
  }
})

interface SitesListPageProps {
  sites: Site[]
}

const SitesListPage: FC<SitesListPageProps> = ({ sites }) => {
  return (
    <AdminLayout title="Sites" currentPage="/admin/sites">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sites
          </h1>
          <a
            href="/admin/sites/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
          >
            <span className="mr-2">+</span>
            Create New Site
          </a>
        </div>

        {/* Sites List */}
        {sites.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {site.name}
                          </div>
                          {site.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {site.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {site.domain || (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              No domain
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(site.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <a
                          href={`/admin/sites/${site.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          View
                        </a>
                        <a
                          href={`/admin/sites/${site.id}/edit`}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        >
                          Edit
                        </a>
                        <button
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onclick={`deleteSite(${site.id}, '${site.name}')`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🌐</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No sites yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first site to get started with WordCross CMS.
            </p>
            <a
              href="/admin/sites/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
            >
              <span className="mr-2">+</span>
              Create First Site
            </a>
          </div>
        )}
      </div>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.deleteSite = async function(siteId, siteName) {
              if (!confirm('Are you sure you want to delete "' + siteName + '"? This action cannot be undone.')) {
                return;
              }
              
              try {
                const response = await fetch('/api/sites/' + siteId, {
                  method: 'DELETE'
                });
                
                if (response.ok) {
                  window.location.reload();
                } else {
                  const error = await response.json();
                  alert('Failed to delete site: ' + (error.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Failed to delete site: ' + error.message);
              }
            };
          `,
        }}
      />
    </AdminLayout>
  )
}

export default app