import { Link, useLocation, Outlet } from 'react-router-dom'
import { Sidebar, useSidebar, useSidebarWidth } from './Sidebar'
import { CommandPalette } from './CommandPalette'

// Breadcrumb mappings
const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  campaigns: 'Campagnes',
  teams: 'Équipes',
  team: 'Membres',
  settings: 'Organisation',
  analytics: 'Analytics',
}

export function DashboardLayout() {
  const { setIsMobileOpen } = useSidebar()
  const sidebarWidth = useSidebarWidth()
  const location = useLocation()

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = breadcrumbLabels[segment] || segment
    const isLast = index === pathSegments.length - 1
    const isId = /^[0-9a-f-]{36}$/.test(segment) // UUID check

    return { path, label, isLast, isId }
  }).filter(b => !b.isId) // Filter out UUID segments

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EP</span>
            </div>
            <span className="font-semibold text-gray-900">Ethnostyles</span>
          </Link>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main
        className="transition-all duration-200 pt-14 lg:pt-0"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? sidebarWidth : 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav className="mb-4">
              <ol className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    {crumb.isLast ? (
                      <span className="text-gray-600 font-medium">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path} className="text-gray-500 hover:text-gray-700">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  )
}
