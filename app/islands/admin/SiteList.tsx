import { useState } from 'hono/jsx'
import type { Site } from '../../types/database'
import { adminApi } from '../../lib/admin-api'

interface SiteListProps {
  initialSites?: Site[]
}

export default function SiteList({ initialSites = [] }: SiteListProps) {
  const [sites, setSites] = useState<Site[]>(initialSites)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSites, setSelectedSites] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const loadSites = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await adminApi.getSites()
      if (response.success && response.data) {
        setSites(response.data.sites)
      } else {
        setError(response.error || 'Failed to load sites')
      }
    } catch (err) {
      setError('Network error loading sites')
    } finally {
      setLoading(false)
    }
  }

  const deleteSite = async (siteId: number, siteName: string) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await adminApi.deleteSite(siteId)
      if (response.success) {
        setSites(sites.filter(site => site.id !== siteId))
      } else {
        alert(`Failed to delete site: ${response.error}`)
      }
    } catch (error) {
      alert('Failed to delete site: Network error')
    }
  }

  const bulkDelete = async () => {
    if (selectedSites.length === 0) return
    
    const siteNames = sites
      .filter(site => selectedSites.includes(site.id))
      .map(site => site.name)
      .join(', ')
    
    if (!confirm(`Are you sure you want to delete ${selectedSites.length} sites (${siteNames})? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await adminApi.deleteSites(selectedSites)
      if (response.success) {
        setSites(sites.filter(site => !selectedSites.includes(site.id)))
        setSelectedSites([])
      } else {
        alert(`Failed to delete sites: ${response.error}`)
      }
    } catch (error) {
      alert('Failed to delete sites: Network error')
    }
  }

  const toggleSiteSelection = (siteId: number) => {
    setSelectedSites(prev => 
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  const toggleAllSites = () => {
    const filteredSites = getFilteredSites()
    if (selectedSites.length === filteredSites.length) {
      setSelectedSites([])
    } else {
      setSelectedSites(filteredSites.map(site => site.id))
    }
  }

  const getFilteredSites = () => {
    if (!searchTerm) return sites
    return sites.filter(site => 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.domain && site.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (site.description && site.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const filteredSites = getFilteredSites()

  return (
    <div className="space-y-4">
      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        {selectedSites.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSites.length} selected
            </span>
            <button
              onClick={bulkDelete}
              className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-400 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-700 dark:text-red-300">{error}</div>
          <button
            onClick={loadSites}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      {/* Sites Table */}
      {filteredSites.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSites.length === filteredSites.length && filteredSites.length > 0}
                      onChange={toggleAllSites}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
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
                {filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site.id)}
                        onChange={() => toggleSiteSelection(site.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
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
                        onClick={() => deleteSite(site.id, site.name)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
          {loading ? (
            <div>
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">⏳</div>
              <p className="text-gray-500 dark:text-gray-400">Loading sites...</p>
            </div>
          ) : searchTerm ? (
            <div>
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🔍</div>
              <p className="text-gray-500 dark:text-gray-400">
                No sites found matching "{searchTerm}"
              </p>
            </div>
          ) : (
            <div>
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
      )}
    </div>
  )
}