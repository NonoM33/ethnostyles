import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'

interface CommandItem {
  id: string
  name: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  section: 'navigation' | 'actions' | 'help'
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === 'admin'

  // Toggle command palette with Ctrl/Cmd + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    setSearch('')
    command()
  }, [])

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      name: 'Aller au Dashboard',
      icon: <HomeIcon />,
      action: () => navigate('/dashboard'),
      keywords: ['accueil', 'home', 'tableau de bord'],
      section: 'navigation',
    },
    {
      id: 'campaigns',
      name: 'Voir les campagnes',
      icon: <CampaignIcon />,
      action: () => navigate('/campaigns'),
      keywords: ['campagne', 'questionnaire', 'sondage'],
      section: 'navigation',
    },
    {
      id: 'teams',
      name: 'Gérer les équipes',
      icon: <TeamIcon />,
      action: () => navigate('/teams'),
      keywords: ['équipe', 'groupe', 'collaborateur'],
      section: 'navigation',
    },
    ...(isAdmin ? [
      {
        id: 'analytics',
        name: 'Analytics Culture',
        icon: <AnalyticsIcon />,
        action: () => navigate('/analytics'),
        keywords: ['analyse', 'statistique', 'culture', 'tendance'],
        section: 'navigation' as const,
      },
      {
        id: 'billing',
        name: 'Facturation',
        icon: <BillingIcon />,
        action: () => navigate('/billing'),
        keywords: ['facture', 'paiement', 'abonnement', 'plan'],
        section: 'navigation' as const,
      },
      {
        id: 'api',
        name: 'Gestion API',
        icon: <ApiIcon />,
        action: () => navigate('/api'),
        keywords: ['api', 'clé', 'intégration', 'développeur'],
        section: 'navigation' as const,
      },
    ] : []),
    {
      id: 'settings',
      name: 'Paramètres organisation',
      icon: <SettingsIcon />,
      action: () => navigate('/settings'),
      keywords: ['paramètre', 'configuration', 'organisation'],
      section: 'navigation',
    },
    {
      id: 'team-members',
      name: 'Gérer les membres',
      icon: <UsersIcon />,
      action: () => navigate('/team'),
      keywords: ['membre', 'utilisateur', 'invitation'],
      section: 'navigation',
    },

    // Actions
    {
      id: 'new-campaign',
      name: 'Créer une campagne',
      shortcut: '⌘N',
      icon: <PlusIcon />,
      action: () => navigate('/campaigns?new=true'),
      keywords: ['nouvelle', 'créer', 'ajouter', 'campagne'],
      section: 'actions',
    },
    {
      id: 'logout',
      name: 'Se déconnecter',
      icon: <LogoutIcon />,
      action: async () => {
        await logout()
        navigate('/login')
      },
      keywords: ['déconnexion', 'logout', 'sortir'],
      section: 'actions',
    },

    // Help
    {
      id: 'help',
      name: 'Aide et documentation',
      shortcut: '?',
      icon: <HelpIcon />,
      action: () => window.open('https://docs.ethnostyles.fr', '_blank'),
      keywords: ['aide', 'documentation', 'support', 'faq'],
      section: 'help',
    },
    {
      id: 'landing',
      name: 'Voir la page de présentation',
      icon: <ExternalIcon />,
      action: () => window.open('/', '_blank'),
      keywords: ['landing', 'présentation', 'vitrine'],
      section: 'help',
    },
  ]

  const filteredCommands = commands.filter((command) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      command.name.toLowerCase().includes(searchLower) ||
      command.keywords?.some((k) => k.toLowerCase().includes(searchLower))
    )
  })

  const navigationCommands = filteredCommands.filter((c) => c.section === 'navigation')
  const actionCommands = filteredCommands.filter((c) => c.section === 'actions')
  const helpCommands = filteredCommands.filter((c) => c.section === 'help')

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <Command
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Rechercher une action, page..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-gray-500">
                  Aucun résultat trouvé
                </Command.Empty>

                {navigationCommands.length > 0 && (
                  <Command.Group heading="Navigation" className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Navigation
                    </div>
                    {navigationCommands.map((command) => (
                      <Command.Item
                        key={command.id}
                        value={command.name}
                        onSelect={() => runCommand(command.action)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-600 transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                          {command.icon}
                        </span>
                        <span className="flex-1 font-medium">{command.name}</span>
                        {command.shortcut && (
                          <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {actionCommands.length > 0 && (
                  <Command.Group heading="Actions" className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </div>
                    {actionCommands.map((command) => (
                      <Command.Item
                        key={command.id}
                        value={command.name}
                        onSelect={() => runCommand(command.action)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-600 transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          {command.icon}
                        </span>
                        <span className="flex-1 font-medium">{command.name}</span>
                        {command.shortcut && (
                          <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {helpCommands.length > 0 && (
                  <Command.Group heading="Aide" className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Aide
                    </div>
                    {helpCommands.map((command) => (
                      <Command.Item
                        key={command.id}
                        value={command.name}
                        onSelect={() => runCommand(command.action)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-600 transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          {command.icon}
                        </span>
                        <span className="flex-1 font-medium">{command.name}</span>
                        {command.shortcut && (
                          <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd>
                    naviguer
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
                    sélectionner
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">⌘K</kbd>
                  ouvrir
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Icons
function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function CampaignIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}

function TeamIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function BillingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function ApiIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}
