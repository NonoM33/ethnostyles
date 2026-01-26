import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface PublicProfile {
  primaryMythe: string
  completedAt: string
}

// Mythe descriptions
const MYTHE_DESCRIPTIONS: Record<string, { tagline: string; description: string; icon: string; color: string }> = {
  Explorateur: {
    tagline: 'La curiosité comme moteur',
    description: 'Animé par la découverte et l\'aventure, l\'Explorateur cherche constamment de nouveaux horizons.',
    icon: '🧭',
    color: '#3B82F6',
  },
  Gardien: {
    tagline: 'La protection comme valeur',
    description: 'Le Gardien accorde une grande importance à la sécurité et à la préservation de ce qui est précieux.',
    icon: '🛡️',
    color: '#10B981',
  },
  Créateur: {
    tagline: 'L\'innovation comme art de vivre',
    description: 'Le Créateur transforme les idées en réalité grâce à son imagination débordante.',
    icon: '✨',
    color: '#8B5CF6',
  },
  Sage: {
    tagline: 'La connaissance comme lumière',
    description: 'Le Sage recherche la vérité et la compréhension profonde du monde.',
    icon: '📚',
    color: '#F59E0B',
  },
  Héros: {
    tagline: 'Le courage comme force',
    description: 'Le Héros relève tous les défis avec détermination et bravoure.',
    icon: '⚔️',
    color: '#EF4444',
  },
  Rebelle: {
    tagline: 'Le changement comme mission',
    description: 'Le Rebelle remet en question l\'ordre établi pour transformer le monde.',
    icon: '🔥',
    color: '#F97316',
  },
  Magicien: {
    tagline: 'La transformation comme pouvoir',
    description: 'Le Magicien voit les possibilités là où les autres voient des limites.',
    icon: '🪄',
    color: '#6366F1',
  },
  Innocent: {
    tagline: 'L\'optimisme comme philosophie',
    description: 'L\'Innocent voit le meilleur en chaque personne et situation.',
    icon: '🌟',
    color: '#EC4899',
  },
}

export function PublicProfilePage() {
  const { respondentId } = useParams<{ respondentId: string }>()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/respondent/${respondentId}/results`
        )
        const data = await response.json()

        if (response.ok) {
          setProfile({
            primaryMythe: data.primaryMythe,
            completedAt: data.completedAt,
          })
        } else {
          setError('Profil non trouvé')
        }
      } catch {
        setError('Erreur de chargement')
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [respondentId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || 'Profil non trouvé'}</p>
          <Link to="/" className="underline hover:no-underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const mytheInfo = MYTHE_DESCRIPTIONS[profile.primaryMythe]
  const mytheColor = mytheInfo?.color || '#6366F1'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${mytheColor} 0%, ${mytheColor}99 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div
          className="p-8 text-center text-white"
          style={{ backgroundColor: mytheColor }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl mb-4"
          >
            {mytheInfo?.icon || '🎯'}
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">{profile.primaryMythe}</h1>
          <p className="text-white/80 text-lg">{mytheInfo?.tagline}</p>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-8 leading-relaxed">
            {mytheInfo?.description}
          </p>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 mb-6">
              Découvrez votre propre profil Ethnostyles !
            </p>

            <a
              href="/"
              className="inline-block px-8 py-3 text-white rounded-full font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: mytheColor }}
            >
              Découvrir mon profil
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-400">
            Profil Ethnostyles
          </p>
        </div>
      </motion.div>
    </div>
  )
}
