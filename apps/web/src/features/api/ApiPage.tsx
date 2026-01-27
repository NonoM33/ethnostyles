import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useApiUsage,
  type ApiKey,
} from '../../lib/api'
import { useAuth } from '../../lib/auth'

function ApiKeyCard({
  apiKey,
  onRevoke,
  isRevoking,
}: {
  apiKey: ApiKey
  onRevoke: () => void
  isRevoking: boolean
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl border p-4 ${
        apiKey.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">{apiKey.name}</h4>
            {!apiKey.isActive && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Revoquee
              </span>
            )}
          </div>
          <code className="text-sm text-gray-500 font-mono">{apiKey.keyPrefix}...</code>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-500 mb-1">
            {apiKey.lastUsedAt
              ? `Dernier appel: ${new Date(apiKey.lastUsedAt).toLocaleDateString('fr-FR')}`
              : 'Jamais utilise'}
          </div>
          <div className="text-xs text-gray-400">
            Cree le {new Date(apiKey.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      {apiKey.isActive && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {apiKey.expiresAt ? (
              <>Expire le {new Date(apiKey.expiresAt).toLocaleDateString('fr-FR')}</>
            ) : (
              'Pas d\'expiration'
            )}
          </div>
          <button
            onClick={onRevoke}
            disabled={isRevoking}
            className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {isRevoking ? 'Revocation...' : 'Revoquer'}
          </button>
        </div>
      )}
    </motion.div>
  )
}

function UsageCard({ usage }: { usage: NonNullable<ReturnType<typeof useApiUsage>['data']> }) {
  const usagePercent = usage.credits.weeklyLimit > 0
    ? Math.min((usage.credits.weeklyUsed / usage.credits.weeklyLimit) * 100, 100)
    : 0
  const isWarning = usagePercent >= 70
  const isCritical = usagePercent >= 90

  const resetDate = new Date(usage.credits.weekResetsAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Utilisation API</h3>
            </div>
            <p className="text-sm text-gray-500">Consommation cette semaine</p>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {usage.credits.weeklyUsed}
              </span>
              <span className="text-xl text-gray-400 font-medium">/{usage.credits.weeklyLimit}</span>
            </div>
            <p className="text-sm text-gray-500">appels cette semaine</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isCritical
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{usage.credits.weeklyRemaining} appels restants</span>
            <span>Reset: {resetDate.toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">{usage.recentCallsCount} appels total</span>
          </div>
          {usage.credits.balance > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-full text-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-purple-700">{usage.credits.balance} credits bonus</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ApiDocumentation() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'endpoints' | 'examples'>('quickstart')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Documentation API</h3>
        <p className="text-sm text-gray-500 mt-1">Integrez Ethnostyles dans vos applications</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {[
            { id: 'quickstart', label: 'Quickstart' },
            { id: 'endpoints', label: 'Endpoints' },
            { id: 'examples', label: 'Exemples' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Obtenez votre cle API</h4>
              <p className="text-sm text-gray-600 mb-3">
                Creez une cle API dans la section ci-dessus. La cle ne sera affichee qu'une seule fois.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Authentification</h4>
              <p className="text-sm text-gray-600 mb-3">
                Incluez votre cle API dans le header <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">X-API-Key</code>
              </p>
              <div className="bg-gray-900 rounded-lg p-4 relative group">
                <button
                  onClick={() => copyToClipboard('curl -H "X-API-Key: ethno_sk_YOUR_KEY" https://api.ethnostyles.fr/api/v1/campaigns')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copier"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <pre className="text-sm text-green-400 overflow-x-auto">
{`curl -H "X-API-Key: ethno_sk_YOUR_KEY" \\
  https://api.ethnostyles.fr/api/v1/campaigns`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Rate Limiting</h4>
              <p className="text-sm text-gray-600">
                Les headers de reponse incluent vos limites actuelles:
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li><code className="px-1.5 py-0.5 bg-gray-100 rounded">x-ratelimit-remaining</code> - Appels restants par minute</li>
                <li><code className="px-1.5 py-0.5 bg-gray-100 rounded">x-weekly-used</code> - Appels utilises cette semaine</li>
                <li><code className="px-1.5 py-0.5 bg-gray-100 rounded">x-weekly-limit</code> - Limite hebdomadaire</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  method: 'GET',
                  path: '/api/v1/campaigns',
                  description: 'Liste toutes vos campagnes',
                  credits: 1,
                },
                {
                  method: 'GET',
                  path: '/api/v1/campaigns/:id',
                  description: 'Details d\'une campagne',
                  credits: 1,
                },
                {
                  method: 'GET',
                  path: '/api/v1/campaigns/:id/responses',
                  description: 'Reponses d\'une campagne (pagine)',
                  credits: 1,
                },
                {
                  method: 'GET',
                  path: '/api/v1/responses/:id',
                  description: 'Details d\'une reponse avec profil complet',
                  credits: 1,
                },
                {
                  method: 'POST',
                  path: '/api/v1/analyze',
                  description: 'Analyse des reponses (stateless, ideal pour LLM)',
                  credits: 2,
                },
                {
                  method: 'GET',
                  path: '/api/v1/reference/profiles',
                  description: 'Reference des 8 Mythes culturels',
                  credits: 1,
                },
                {
                  method: 'GET',
                  path: '/api/v1/reference/questions',
                  description: 'Questions du questionnaire',
                  credits: 1,
                },
                {
                  method: 'GET',
                  path: '/api/v1/usage',
                  description: 'Statistiques d\'utilisation',
                  credits: 0,
                },
              ].map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      endpoint.method === 'GET'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                    <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {endpoint.credits === 0 ? 'Gratuit' : `${endpoint.credits} credit${endpoint.credits > 1 ? 's' : ''}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-6">
            {/* JavaScript Example */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">JavaScript</span>
                <h4 className="font-medium text-gray-900">Lister les campagnes</h4>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 relative group">
                <button
                  onClick={() => copyToClipboard(`const response = await fetch('https://api.ethnostyles.fr/api/v1/campaigns', {
  headers: { 'X-API-Key': 'ethno_sk_YOUR_KEY' }
});
const { campaigns } = await response.json();`)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <pre className="text-sm text-green-400 overflow-x-auto">
{`const response = await fetch('https://api.ethnostyles.fr/api/v1/campaigns', {
  headers: { 'X-API-Key': 'ethno_sk_YOUR_KEY' }
});
const { campaigns } = await response.json();`}
                </pre>
              </div>
            </div>

            {/* Python Example */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">Python</span>
                <h4 className="font-medium text-gray-900">Analyser des reponses</h4>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 relative group">
                <button
                  onClick={() => copyToClipboard(`import requests

response = requests.post(
    'https://api.ethnostyles.fr/api/v1/analyze',
    headers={'X-API-Key': 'ethno_sk_YOUR_KEY'},
    json={
        'answers': [0, 1, 2, 3, 0, 1, 2, 3],  # 8 reponses
        'size': 8
    }
)
profile = response.json()['profile']
print(f"Profil dominant: {profile['primary']['name']}")`)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <pre className="text-sm text-green-400 overflow-x-auto">
{`import requests

response = requests.post(
    'https://api.ethnostyles.fr/api/v1/analyze',
    headers={'X-API-Key': 'ethno_sk_YOUR_KEY'},
    json={
        'answers': [0, 1, 2, 3, 0, 1, 2, 3],  # 8 reponses
        'size': 8
    }
)
profile = response.json()['profile']
print(f"Profil dominant: {profile['primary']['name']}")`}
                </pre>
              </div>
            </div>

            {/* LLM Integration Example */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">LLM</span>
                <h4 className="font-medium text-gray-900">Integration IA</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                L'endpoint <code className="px-1.5 py-0.5 bg-gray-100 rounded">/analyze</code> est ideal pour l'integration avec des LLMs.
                Il prend des reponses brutes et retourne un profil culturel complet.
              </p>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-green-400 overflow-x-auto">
{`// Exemple de reponse /analyze
{
  "profile": {
    "primary": {
      "key": "explorateur",
      "score": 85,
      "name": "L'Explorateur",
      "tagline": "La liberte d'etre soi-meme",
      "color": "#f97316"
    },
    "secondary": {
      "key": "createur",
      "score": 72,
      "name": "Le Createur",
      "tagline": "L'imagination au pouvoir"
    },
    "confidence": 78,
    "scores": { ... }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function ApiPage() {
  const { user } = useAuth()
  const { data: keysData, isLoading: keysLoading } = useApiKeys()
  const { data: usageData, isLoading: usageLoading } = useApiUsage()
  const createApiKey = useCreateApiKey()
  const revokeApiKey = useRevokeApiKey()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyExpires, setNewKeyExpires] = useState<string>('')
  const [newKeyValue, setNewKeyValue] = useState('')
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const isAdmin = user?.role === 'admin'
  const apiEnabled = usageData?.apiEnabled ?? false
  const activeKeys = keysData?.keys.filter((k) => k.isActive) || []

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    try {
      const result = await createApiKey.mutateAsync({
        name: newKeyName.trim(),
        expiresAt: newKeyExpires || undefined,
      })
      setNewKeyValue(result.key)
      setShowCreateModal(false)
      setShowNewKeyModal(true)
      setNewKeyName('')
      setNewKeyExpires('')
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  const handleRevokeKey = async (id: string) => {
    setRevokingId(id)
    try {
      await revokeApiKey.mutateAsync(id)
    } catch (error) {
      console.error('Failed to revoke API key:', error)
    } finally {
      setRevokingId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acces restreint</h2>
        <p className="text-gray-500 text-center max-w-md">
          Seuls les administrateurs peuvent acceder a la gestion des cles API.
        </p>
      </div>
    )
  }

  if (!apiEnabled) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API</h1>
          <p className="text-gray-500">Integrez Ethnostyles dans vos applications</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acces API non disponible</h2>
          <p className="text-gray-600 mb-6">
            L'acces a l'API est reserve aux plans Pro et Enterprise.
            Passez a un forfait superieur pour debloquer l'API.
          </p>
          <a
            href="/billing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Voir les forfaits
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <ApiDocumentation />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API</h1>
        <p className="text-gray-500">Gerez vos cles API et consultez votre utilisation</p>
      </div>

      {/* Usage */}
      {usageLoading ? (
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      ) : usageData ? (
        <UsageCard usage={usageData} />
      ) : null}

      {/* API Keys Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cles API</h3>
            <p className="text-sm text-gray-500">{activeKeys.length} cle{activeKeys.length !== 1 ? 's' : ''} active{activeKeys.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle cle
          </button>
        </div>

        <div className="p-6">
          {keysLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : keysData?.keys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">Aucune cle API</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Creer votre premiere cle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {keysData?.keys.map((key) => (
                  <ApiKeyCard
                    key={key.id}
                    apiKey={key}
                    onRevoke={() => handleRevokeKey(key.id)}
                    isRevoking={revokingId === key.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Documentation */}
      <ApiDocumentation />

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle cle API</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la cle
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Ex: Production, Test, Integration CRM..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration (optionnel)
                    </label>
                    <input
                      type="date"
                      value={newKeyExpires}
                      onChange={(e) => setNewKeyExpires(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour une cle sans expiration
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={!newKeyName.trim() || createApiKey.isPending}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createApiKey.isPending ? 'Creation...' : 'Creer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Key Created Modal */}
      <AnimatePresence>
        {showNewKeyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Cle API creee !
                </h3>
                <p className="text-gray-500 text-center text-sm mb-6">
                  Copiez cette cle maintenant. Elle ne sera plus jamais affichee.
                </p>

                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <button
                    onClick={() => copyToClipboard(newKeyValue)}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copier"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <code className="text-green-400 break-all text-sm">{newKeyValue}</code>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Gardez cette cle en securite ! Ne la partagez pas et ne la commitez pas dans votre code.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowNewKeyModal(false)
                    setNewKeyValue('')
                  }}
                  className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  J'ai copie ma cle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
