import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingStep {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

interface OnboardingChecklistProps {
  hasCampaigns: boolean
  hasTeamMembers: boolean
  hasResponses: boolean
  hasProfile: boolean
}

export function OnboardingChecklist({
  hasCampaigns,
  hasTeamMembers,
  hasResponses,
  hasProfile,
}: OnboardingChecklistProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('onboarding_dismissed') === 'true'
  })

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Compléter votre profil',
      description: 'Ajoutez vos informations personnelles',
      href: '/settings',
      completed: hasProfile,
    },
    {
      id: 'campaign',
      title: 'Créer votre première campagne',
      description: 'Lancez une campagne de profiling',
      href: '/campaigns',
      completed: hasCampaigns,
    },
    {
      id: 'team',
      title: 'Inviter des membres',
      description: 'Ajoutez des collaborateurs à votre équipe',
      href: '/team',
      completed: hasTeamMembers,
    },
    {
      id: 'results',
      title: 'Voir vos premiers résultats',
      description: 'Analysez les profils de votre équipe',
      href: '/dashboard',
      completed: hasResponses,
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const progress = (completedCount / steps.length) * 100
  const allCompleted = completedCount === steps.length

  useEffect(() => {
    if (allCompleted) {
      localStorage.setItem('onboarding_dismissed', 'true')
      setIsDismissed(true)
    }
  }, [allCompleted])

  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true')
    setIsDismissed(true)
  }

  if (isDismissed || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Bienvenue !</h3>
              <p className="text-sm text-indigo-100">
                Complétez ces étapes pour bien démarrer
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-indigo-100 mb-2">
              <span>{completedCount} sur {steps.length} complétées</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <ul className="divide-y divide-gray-100">
          {steps.map((step, index) => (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={step.href}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                  step.completed ? 'opacity-60' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      step.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {!step.completed && (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  )
}
