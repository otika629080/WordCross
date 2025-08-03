import { useState, useEffect } from 'hono/jsx'
import StatsCard from '../../components/admin/StatsCard'
import { adminApi, type SiteStatsResponse } from '../../lib/admin-api'

interface DashboardStatsProps {
  initialStats?: SiteStatsResponse
}

export default function DashboardStats({ initialStats }: DashboardStatsProps) {
  const [stats, setStats] = useState<SiteStatsResponse>(initialStats || {
    totalSites: 0,
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await adminApi.getDashboardStats()
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.error || 'Failed to load statistics')
      }
    } catch (err) {
      setError('Network error loading statistics')
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = () => {
    loadStats()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Overview
        </h2>
        <button
          onClick={refreshStats}
          disabled={loading}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-700 dark:text-red-300">{error}</div>
          <button
            onClick={loadStats}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`transform transition-transform ${loading ? 'opacity-50' : ''}`}>
          <StatsCard
            title="Total Sites"
            value={stats.totalSites}
            icon="🌐"
            color="blue"
          />
        </div>
        <div className={`transform transition-transform ${loading ? 'opacity-50' : ''}`}>
          <StatsCard
            title="Total Pages"
            value={stats.totalPages}
            icon="📄"
            color="green"
          />
        </div>
        <div className={`transform transition-transform ${loading ? 'opacity-50' : ''}`}>
          <StatsCard
            title="Published Pages"
            value={stats.publishedPages}
            icon="✅"
            color="purple"
          />
        </div>
        <div className={`transform transition-transform ${loading ? 'opacity-50' : ''}`}>
          <StatsCard
            title="Draft Pages"
            value={stats.draftPages}
            icon="📝"
            color="yellow"
          />
        </div>
      </div>
    </div>
  )
}