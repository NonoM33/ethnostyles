import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  number: number
  text: string
}

interface Progress {
  current: number
  total: number
  percentage: number
}

const ANSWER_OPTIONS = [
  { value: 1, label: 'Pas du tout d\'accord' },
  { value: 2, label: 'Plutôt pas d\'accord' },
  { value: 3, label: 'Plutôt d\'accord' },
  { value: 4, label: 'Tout à fait d\'accord' },
]

export function QuestionnairePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [question, setQuestion] = useState<Question | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')

  const respondentId = sessionStorage.getItem('respondent_id')

  const fetchQuestion = useCallback(async () => {
    if (!respondentId) {
      navigate(`/q/${slug}`)
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/respondent/${respondentId}/question`
      )
      const data = await response.json()

      if (response.ok) {
        if (data.isCompleted) {
          navigate(`/q/${slug}/results/${respondentId}`)
          return
        }
        setQuestion(data.question)
        setProgress(data.progress)
      } else {
        setError(data.message || 'Erreur')
      }
    } catch {
      setError('Erreur réseau')
    }
    setIsLoading(false)
  }, [respondentId, slug, navigate])

  useEffect(() => {
    // Get campaign color
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/${slug}`)
        const data = await response.json()
        if (data.campaign?.primaryColor) {
          setPrimaryColor(data.campaign.primaryColor)
        }
      } catch {
        // Use default color
      }
    }
    fetchCampaign()
    fetchQuestion()
  }, [slug, fetchQuestion])

  const handleSubmitAnswer = async (answer: number) => {
    if (!question || isSubmitting) return

    setSelectedAnswer(answer)
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(
        `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/respondent/${respondentId}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionNumber: question.number,
            answer,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        if (data.isCompleted) {
          // Show completion animation then redirect
          setTimeout(() => {
            navigate(`/q/${slug}/results/${respondentId}`)
          }, 500)
        } else {
          // Show next question with animation
          setSelectedAnswer(null)
          setProgress(data.progress)
          setQuestion({
            number: data.nextQuestion,
            text: `Question ${data.nextQuestion}: Êtes-vous d'accord avec l'affirmation suivante concernant vos valeurs et préférences?`,
          })
        }
      } else {
        setError(data.message || 'Erreur')
      }
    } catch {
      setError('Erreur réseau')
    }

    setIsSubmitting(false)
  }

  // Calculate estimated time remaining
  const getEstimatedTime = () => {
    if (!progress) return ''
    const remaining = progress.total - progress.current + 1
    const minutes = Math.ceil(remaining * 0.15) // ~9 seconds per question avg
    if (minutes <= 1) return '< 1 min'
    return `~${minutes} min`
  }

  // Milestone celebrations
  const getMilestone = () => {
    if (!progress) return null
    if (progress.percentage === 25) return { emoji: '🎯', text: 'Excellent départ !' }
    if (progress.percentage === 50) return { emoji: '🔥', text: 'À mi-chemin !' }
    if (progress.percentage === 75) return { emoji: '⭐', text: 'Presque terminé !' }
    return null
  }

  const milestone = getMilestone()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/q/${slug}`)}
            className="text-indigo-600 hover:underline"
          >
            Recommencer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {progress?.current} / {progress?.total}</span>
            <span>{getEstimatedTime()} restant</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress?.percentage || 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Milestone Celebration */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 text-center"
          >
            <span className="text-2xl mr-2">{milestone.emoji}</span>
            <span className="font-medium">{milestone.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.number}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              {/* Question Text */}
              <div className="mb-8">
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  Question {question?.number}
                </span>
                <h2 className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
                  {question?.text}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {ANSWER_OPTIONS.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSubmitAnswer(option.value)}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === option.value
                        ? 'border-transparent text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    style={{
                      backgroundColor: selectedAnswer === option.value ? primaryColor : undefined,
                      borderColor: selectedAnswer === option.value ? primaryColor : undefined,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          selectedAnswer === option.value
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {option.value}
                      </span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Keyboard hints */}
          <p className="text-center text-sm text-gray-400 mt-6 hidden md:block">
            Appuyez sur 1, 2, 3 ou 4 pour répondre rapidement
          </p>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts onAnswer={handleSubmitAnswer} disabled={isSubmitting} />
    </div>
  )
}

// Keyboard shortcuts component
function KeyboardShortcuts({
  onAnswer,
  disabled,
}: {
  onAnswer: (answer: number) => void
  disabled: boolean
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return
      const key = parseInt(e.key)
      if (key >= 1 && key <= 4) {
        onAnswer(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onAnswer, disabled])

  return null
}
