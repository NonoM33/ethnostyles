import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { useTeam, useInviteTeamMember, useCancelInvitation, useRevokeMember, useReactivateMember, useSubscription } from '../../lib/api'

// Role explanations
const ROLES = [
  {
    id: 'admin',
    name: 'Administrateur',
    icon: '👑',
    color: 'indigo',
    permissions: [
      'Créer et gérer les campagnes',
      'Inviter et gérer les membres',
      'Accéder aux analytics',
      'Modifier les paramètres'
    ]
  },
  {
    id: 'manager',
    name: 'Manager',
    icon: '📊',
    color: 'purple',
    permissions: [
      'Créer et gérer les campagnes',
      'Voir les membres',
      'Accéder aux analytics',
      'Exporter les données'
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    icon: '👁️',
    color: 'gray',
    permissions: [
      'Consulter les campagnes',
      'Voir les résultats',
      'Accéder en lecture seule'
    ]
  }
]

// Tips for team management
const TIPS = [
  {
    icon: '💡',
    title: 'Astuce',
    content: 'Invitez plusieurs membres en une seule fois en séparant les emails par des virgules.'
  },
  {
    icon: '🔐',
    title: 'Sécurité',
    content: 'Les invitations expirent après 7 jours. Renvoyez une invitation si nécessaire.'
  },
  {
    icon: '📧',
    title: 'Email',
    content: 'Les nouveaux membres reçoivent un email avec les instructions pour rejoindre.'
  }
]

export function TeamPage() {
  const { user } = useAuth()
  const { data, isLoading } = useTeam()
  const { data: subscriptionData } = useSubscription()
  const inviteTeamMember = useInviteTeamMember()
  const cancelInvitation = useCancelInvitation()
  const revokeMember = useRevokeMember()
  const reactivateMember = useReactivateMember()

  const [inviteEmail, setInviteEmail] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [showBulkInvite, setShowBulkInvite] = useState(false)
  const [showRolesInfo, setShowRolesInfo] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const members = data?.members || []
  const pendingInvitations = data?.pendingInvitations || []
  const subscription = subscriptionData?.subscription
  const usage = subscriptionData?.usage

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await inviteTeamMember.mutateAsync(inviteEmail)
      setSuccess(`Invitation envoyée à ${inviteEmail}`)
      setInviteEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    }
  }

  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const emails = bulkEmails
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.includes('@'))

    if (emails.length === 0) {
      setError('Veuillez entrer au moins un email valide')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const email of emails) {
      try {
        await inviteTeamMember.mutateAsync(email)
        successCount++
      } catch {
        errorCount++
      }
    }

    if (successCount > 0) {
      setSuccess(`${successCount} invitation(s) envoyée(s) avec succès`)
    }
    if (errorCount > 0) {
      setError(`${errorCount} invitation(s) échouée(s)`)
    }

    setBulkEmails('')
    setShowBulkInvite(false)
  }

  const handleCancelInvitation = async (id: string) => {
    try {
      await cancelInvitation.mutateAsync(id)
    } catch {
      setError('Failed to cancel invitation')
    }
  }

  const handleRevokeMember = async (id: string, email: string) => {
    if (!confirm(`Voulez-vous vraiment révoquer l'accès de ${email} ?`)) {
      return
    }

    try {
      await revokeMember.mutateAsync(id)
      setSuccess(`Accès révoqué pour ${email}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke access')
    }
  }

  const handleReactivateMember = async (id: string, email: string) => {
    try {
      await reactivateMember.mutateAsync(id)
      setSuccess(`Accès restauré pour ${email}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate')
    }
  }

  const resendInvitation = async (email: string) => {
    try {
      await inviteTeamMember.mutateAsync(email)
      setSuccess(`Invitation renvoyée à ${email}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'
  const activeMembers = members.filter(m => m.isActive)
  const inactiveMembers = members.filter(m => !m.isActive)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
            <span>👑</span> Admin
          </span>
        )
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            <span>📊</span> Manager
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            <span>👁️</span> Viewer
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de l'équipe</h1>
          <p className="text-gray-500">Gérez les membres et les permissions de votre organisation</p>
        </div>
        <button
          onClick={() => setShowRolesInfo(!showRolesInfo)}
          className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Comprendre les rôles
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Membres actifs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activeMembers.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Invitations en attente</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingInvitations.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {activeMembers.filter(m => m.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Seats Quota Banner */}
      {usage?.teamMembers && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 ${
            usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit
              ? 'bg-red-50 border border-red-200'
              : usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit * 0.8
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit
                  ? 'bg-red-100'
                  : 'bg-white shadow-sm'
              }`}>
                <svg className={`w-6 h-6 ${
                  usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit
                    ? 'text-red-600'
                    : 'text-indigo-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold ${
                  usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit
                    ? 'text-red-700'
                    : 'text-gray-900'
                }`}>
                  Places utilisees : {usage.teamMembers.used} / {usage.teamMembers.limit ?? '∞'}
                </h3>
                {usage.teamMembers.limit && (
                  <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage.teamMembers.used >= usage.teamMembers.limit
                          ? 'bg-red-500'
                          : usage.teamMembers.used >= usage.teamMembers.limit * 0.8
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min((usage.teamMembers.used / usage.teamMembers.limit) * 100, 100)}%` }}
                    />
                  </div>
                )}
                {usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit && (
                  <p className="text-sm text-red-600 mt-1">
                    Limite atteinte - Passez a un plan superieur pour ajouter plus de membres
                  </p>
                )}
              </div>
            </div>
            {subscription?.planId !== 'enterprise' && (
              <Link
                to="/billing"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {usage.teamMembers.limit && usage.teamMembers.used >= usage.teamMembers.limit ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Ajouter des places
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Gerer les places
                  </>
                )}
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Roles Info Panel */}
      <AnimatePresence>
        {showRolesInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Les différents rôles</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {ROLES.map((role) => (
                  <div key={role.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{role.icon}</span>
                      <h4 className="font-semibold text-gray-900">{role.name}</h4>
                    </div>
                    <ul className="space-y-2">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read-only notice for viewers */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Mode lecture seule</p>
            <p className="text-sm text-blue-600">En tant que Viewer, vous pouvez consulter les membres mais pas les modifier.</p>
          </div>
        </motion.div>
      )}

      {/* Invite Form - Admin Only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Inviter des membres</h2>
            <button
              onClick={() => setShowBulkInvite(!showBulkInvite)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showBulkInvite ? 'Invitation simple' : 'Invitation multiple'}
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showBulkInvite ? (
              <motion.form
                key="single"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleInvite}
                className="flex gap-4"
              >
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inviteTeamMember.isPending}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {inviteTeamMember.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Inviter
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="bulk"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleBulkInvite}
                className="space-y-4"
              >
                <div>
                  <textarea
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={4}
                    placeholder="Entrez les emails séparés par des virgules ou des retours à la ligne :&#10;jean@exemple.com, marie@exemple.com&#10;pierre@exemple.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bulkEmails.split(/[,;\n]/).filter(e => e.trim().includes('@')).length} email(s) détecté(s)
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={inviteTeamMember.isPending}
                  className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Envoyer les invitations
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Les nouveaux membres rejoignent en tant que <strong>Viewer</strong> par défaut.
          </p>
        </motion.div>
      )}

      {/* Tips */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {TIPS.map((tip, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="text-xl">{tip.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{tip.content}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Membres actifs</h2>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {activeMembers.length}
            </span>
          </div>
          {activeMembers.length > 0 && (
            <Link
              to="/teams"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Voir les équipes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {activeMembers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">Aucun membre dans l'équipe</p>
            <p className="text-sm text-gray-400">Commencez par inviter des collaborateurs</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activeMembers.map((member, index) => (
              <motion.li
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(member.name || member.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name || member.email}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.role)}
                    {isAdmin && member.role === 'viewer' && member.id !== user?.id && (
                      <button
                        onClick={() => handleRevokeMember(member.id, member.email)}
                        className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Invitations en attente</h2>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              {pendingInvitations.length}
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {pendingInvitations.map((invitation, index) => {
              const expiresAt = new Date(invitation.expiresAt)
              const isExpiringSoon = expiresAt.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 // 2 days

              return (
                <motion.li
                  key={invitation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className={`text-sm ${isExpiringSoon ? 'text-amber-600' : 'text-gray-500'}`}>
                          {isExpiringSoon && '⚠️ '}
                          Expire le {expiresAt.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => resendInvitation(invitation.email)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                        >
                          Renvoyer
                        </button>
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
      )}

      {/* Inactive Members (Admin only) */}
      {isAdmin && inactiveMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Accès révoqués</h2>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              {inactiveMembers.length}
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {inactiveMembers.map((member) => (
              <li key={member.id} className="px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold">
                      {(member.name || member.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">{member.name || member.email}</p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReactivateMember(member.id, member.email)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restaurer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
