import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { authMiddleware, requireAuth } from '../../middleware/auth'
import { databaseMiddleware } from '../../middleware/database'
import AdminLayout from '../../components/admin/AdminLayout'
import StatsCard from '../../components/admin/StatsCard'
import type { AuthVariables } from '../../middleware/auth'
import type { Variables } from '../../types/database'

const app = new Hono<{ Variables: AuthVariables & Variables }>()

app.use('*', databaseMiddleware)
app.use('*', authMiddleware)
app.use('*', requireAuth)

interface DashboardStats {
  totalSites: number
  totalPages: number
  publishedPages: number
  draftPages: number
}

app.get('/', async (c) => {
  const db = c.get('db')
  
  try {
    // Get dashboard statistics
    const sites = await db.getSites()
    const totalSites = sites.length
    
    let totalPages = 0
    let publishedPages = 0
    let draftPages = 0
    
    for (const site of sites) {
      const pages = await db.getPagesBySiteId(site.id)
      totalPages += pages.length
      
      for (const page of pages) {
        if (page.is_published) {
          publishedPages++
        } else {
          draftPages++
        }
      }
    }
    
    const stats: DashboardStats = {
      totalSites,
      totalPages,
      publishedPages,
      draftPages,
    }
    
    return c.html(<DashboardPage stats={stats} recentSites={sites.slice(0, 5)} />)
  } catch (error) {
    console.error('Dashboard error:', error)
    return c.html(<DashboardPage stats={{
      totalSites: 0,
      totalPages: 0,
      publishedPages: 0,
      draftPages: 0,
    }} recentSites={[]} />)
  }
})

interface DashboardPageProps {
  stats: DashboardStats
  recentSites: Array<{
    id: number
    name: string
    domain: string | null
    created_at: string
  }>
}

const DashboardPage: FC<DashboardPageProps> = ({ stats, recentSites }) => {
  return (
    <AdminLayout title="Dashboard" currentPage="/admin/dashboard">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your CMS.
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Sites"
            value={stats.totalSites}
            icon="🌐"
            color="blue"
          />
          <StatsCard
            title="Total Pages"
            value={stats.totalPages}
            icon="📄"
            color="green"
          />
          <StatsCard
            title="Published Pages"
            value={stats.publishedPages}
            icon="✅"
            color="purple"
          />
          <StatsCard
            title="Draft Pages"
            value={stats.draftPages}
            icon="📝"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/admin/sites/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
            >
              <span className="mr-2">🌐</span>
              Create New Site
            </a>
            <a
              href="/admin/pages/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors"
            >
              <span className="mr-2">📄</span>
              Create New Page
            </a>
            <a
              href="/admin/media"
              className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-400 transition-colors"
            >
              <span className="mr-2">🖼️</span>
              Upload Media
            </a>
          </div>
        </div>

        {/* Recent Sites */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Sites
            </h2>
            <a
              href="/admin/sites"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View All Sites →
            </a>
          </div>
          
          {recentSites.length > 0 ? (
            <div className="space-y-3">
              {recentSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {site.domain || 'No domain set'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(site.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🌐</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No sites yet. Create your first site to get started!
              </p>
              <a
                href="/admin/sites/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
              >
                Create First Site
              </a>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default app