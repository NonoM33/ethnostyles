import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const MYTHES = [
  { name: 'Explorateur', color: '#3B82F6', emoji: '🧭', description: 'Aventure et découverte' },
  { name: 'Gardien', color: '#10B981', emoji: '🛡️', description: 'Protection et stabilité' },
  { name: 'Créateur', color: '#F59E0B', emoji: '🎨', description: 'Innovation et originalité' },
  { name: 'Sage', color: '#8B5CF6', emoji: '📚', description: 'Connaissance et sagesse' },
  { name: 'Héros', color: '#EF4444', emoji: '⚔️', description: 'Courage et défi' },
  { name: 'Rebelle', color: '#EC4899', emoji: '🔥', description: 'Liberté et transgression' },
  { name: 'Magicien', color: '#6366F1', emoji: '✨', description: 'Transformation et vision' },
  { name: 'Innocent', color: '#14B8A6', emoji: '🌟', description: 'Optimisme et confiance' },
]

const TESTIMONIALS = [
  {
    name: 'Marie Dubois',
    role: 'DRH',
    company: 'TechCorp France',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    quote: 'Ethnostyles a transformé notre approche du recrutement. Nous comprenons enfin pourquoi certaines équipes fonctionnent mieux que d\'autres.',
    rating: 5,
  },
  {
    name: 'Thomas Martin',
    role: 'CEO',
    company: 'Startup Factory',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    quote: 'En 3 mois, notre taux de rétention a augmenté de 40%. La cartographie culturelle nous a permis de créer des équipes vraiment complémentaires.',
    rating: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Directrice Transformation',
    company: 'BNP Paribas',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    quote: 'Un outil indispensable pour piloter notre transformation culturelle. Les insights sont précieux et actionnables immédiatement.',
    rating: 5,
  },
  {
    name: 'Pierre Durand',
    role: 'Manager IT',
    company: 'Capgemini',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    quote: 'Mes équipes de devs ont enfin compris pourquoi ils avaient du mal à communiquer avec le business. Game changer !',
    rating: 5,
  },
]

const STATS = [
  { value: '50K+', label: 'Profils analysés', icon: '👥' },
  { value: '500+', label: 'Entreprises clientes', icon: '🏢' },
  { value: '97%', label: 'Taux de satisfaction', icon: '⭐' },
  { value: '40%', label: 'Amélioration cohésion', icon: '📈' },
]

const LOGOS = [
  { name: 'BNP Paribas', opacity: 0.7 },
  { name: 'Capgemini', opacity: 0.7 },
  { name: 'L\'Oréal', opacity: 0.7 },
  { name: 'Orange', opacity: 0.7 },
  { name: 'Société Générale', opacity: 0.7 },
  { name: 'SNCF', opacity: 0.7 },
]

const FEATURES = [
  {
    title: 'Questionnaire en 8 minutes',
    description: '24 questions scientifiquement validées. Taux de complétion de 94%.',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    title: 'Profils instantanés',
    description: 'Chaque participant reçoit son profil détaillé avec recommandations personnalisées.',
    icon: '🎯',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    title: 'Analytics temps réel',
    description: 'Visualisez la composition culturelle de vos équipes en un coup d\'œil.',
    icon: '📊',
    color: 'from-green-400 to-emerald-500',
  },
  {
    title: 'Recommandations IA',
    description: 'Des conseils actionnables pour améliorer la cohésion et la performance.',
    icon: '🤖',
    color: 'from-purple-400 to-pink-500',
  },
  {
    title: 'Benchmark national',
    description: 'Comparez vos résultats avec plus de 50 000 profils français.',
    icon: '🇫🇷',
    color: 'from-red-400 to-rose-500',
  },
  {
    title: 'RGPD compliant',
    description: 'Données hébergées en France. Anonymisation et export sur demande.',
    icon: '🔒',
    color: 'from-gray-400 to-slate-500',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: 'Gratuit',
    description: 'Parfait pour découvrir',
    features: ['1 campagne', '20 réponses max', 'Profils individuels', 'Export CSV'],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Pro',
    price: '49€',
    period: '/mois',
    description: 'Pour les équipes ambitieuses',
    features: [
      'Campagnes illimitées',
      'Réponses illimitées',
      'Analytics équipe avancés',
      'Benchmark national',
      'Export PDF & rapports',
      'Support prioritaire',
      'Intégration Slack',
    ],
    cta: 'Essai gratuit 14 jours',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    description: 'Grandes organisations',
    features: [
      'Tout Pro inclus',
      'Multi-tenants / BU',
      'SSO / SAML',
      'API dédiée',
      'Formation sur site',
      'Account manager dédié',
      'SLA garanti',
    ],
    cta: 'Demander une démo',
    popular: false,
  },
]

const FAQ = [
  {
    question: 'Qu\'est-ce que la méthodologie des 8 Mythes ?',
    answer: 'Basée sur les archétypes jungiens, cette méthodologie identifie 8 profils culturels fondamentaux (Explorateur, Gardien, Créateur, Sage, Héros, Rebelle, Magicien, Innocent) qui façonnent nos comportements en organisation. Elle a été validée scientifiquement sur plus de 50 000 profils français.',
  },
  {
    question: 'Combien de temps prend le questionnaire ?',
    answer: 'Le questionnaire comprend 24 questions et se complète en moyenne en 8 minutes. Notre taux de complétion est de 94%, le plus élevé du marché.',
  },
  {
    question: 'Les données sont-elles sécurisées ?',
    answer: 'Absolument. Toutes les données sont hébergées en France, chiffrées et conformes au RGPD. Chaque participant peut demander l\'export ou la suppression de ses données à tout moment.',
  },
  {
    question: 'Puis-je tester avant de m\'engager ?',
    answer: 'Oui ! Notre plan Starter est 100% gratuit et vous permet de créer une campagne avec jusqu\'à 20 réponses. Le plan Pro inclut un essai gratuit de 14 jours sans engagement.',
  },
  {
    question: 'Comment interpréter les résultats ?',
    answer: 'Chaque profil vient avec une explication détaillée et des recommandations personnalisées. Pour les équipes, notre dashboard fournit une visualisation claire de la composition culturelle avec des conseils de management adaptés.',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const currentTestimonial = TESTIMONIALS[activeTestimonial]!

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Ethnostyles</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#methodology" className="text-gray-600 hover:text-gray-900 transition-colors">Méthode</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Témoignages</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 -left-20 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute top-40 -right-20 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 4 }}
            className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-300 rounded-full filter blur-3xl opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-indigo-700">+500 entreprises nous font confiance</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Transformez votre
                <br />
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                    culture d'entreprise
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-indigo-200 to-purple-200 -z-0 origin-left"
                  />
                </span>
              </h1>

              <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Révélez le profil culturel de vos équipes avec la méthodologie scientifique des
                <span className="font-semibold text-indigo-600"> 8 Mythes</span>.
                Boostez la cohésion et la performance.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  Démarrer gratuitement
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Voir la démo
                </a>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Pas de carte bancaire requise • Résultats en 8 minutes
              </p>
            </motion.div>

            {/* Floating Mythes Animation */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 relative"
            >
              <div className="flex flex-wrap justify-center gap-4">
                {MYTHES.map((mythe, index) => (
                  <motion.div
                    key={mythe.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="group relative"
                  >
                    <div
                      className="px-5 py-3 rounded-2xl text-white font-medium shadow-lg cursor-pointer transition-shadow hover:shadow-xl flex items-center gap-2"
                      style={{ backgroundColor: mythe.color }}
                    >
                      <span className="text-xl">{mythe.emoji}</span>
                      <span>{mythe.name}</span>
                    </div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                        {mythe.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof - Logos */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 mb-8">
            ILS NOUS FONT CONFIANCE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="text-2xl font-bold text-gray-400"
                style={{ opacity: logo.opacity }}
              >
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-2 text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Voyez Ethnostyles en action
            </h2>
            <p className="text-lg text-indigo-200">
              2 minutes pour comprendre comment transformer votre culture d'entreprise
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
              <button className="group w-24 h-24 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110 shadow-2xl">
                <svg className="w-10 h-10 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {/* Placeholder for video thumbnail */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/70">
                <div className="text-6xl mb-4">🎬</div>
                <p>Vidéo de présentation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 mb-4">
                Méthodologie validée scientifiquement
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Les 8 Mythes culturels
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Basée sur les archétypes jungiens et validée sur <span className="font-semibold">50 000+ profils</span>,
                cette méthodologie révèle les dynamiques profondes de votre organisation.
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MYTHES.map((mythe, index) => (
              <motion.div
                key={mythe.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${mythe.color}15` }}
                >
                  {mythe.emoji}
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: mythe.color }}
                >
                  {mythe.name}
                </h3>
                <p className="text-gray-600">{mythe.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 mb-4">
                Plateforme tout-en-un
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Tout ce dont vous avez besoin
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Une solution complète pour cartographier, analyser et développer votre culture d'entreprise
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700 mb-4">
                Témoignages clients
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Ce qu'ils disent de nous
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez comment Ethnostyles a transformé la culture de centaines d'entreprises
              </p>
            </motion.div>
          </div>

          {/* Featured Testimonial */}
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <svg className="w-12 h-12 text-white/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="text-xl sm:text-2xl leading-relaxed mb-8">
                  "{currentTestimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                  />
                  <div>
                    <div className="font-semibold text-lg">{currentTestimonial.name}</div>
                    <div className="text-white/70">
                      {currentTestimonial.role} • {currentTestimonial.company}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={currentTestimonial.rating} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial Selector */}
          <div className="flex justify-center gap-4">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeTestimonial
                    ? 'w-8 bg-indigo-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Mini Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`text-left p-6 rounded-2xl transition-all ${
                  index === activeTestimonial
                    ? 'bg-indigo-50 border-2 border-indigo-200'
                    : 'bg-white border border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-gray-500 text-xs">{testimonial.company}</div>
                  </div>
                </div>
                <StarRating rating={testimonial.rating} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 mb-4">
              Simple et rapide
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Démarrez en 3 étapes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

            {[
              { step: '1', title: 'Créez votre campagne', description: 'En 2 clics, configurez votre première campagne de profiling culturel.', emoji: '🚀' },
              { step: '2', title: 'Partagez le lien', description: 'Envoyez le lien unique à vos collaborateurs. Questionnaire en 8 min.', emoji: '📧' },
              { step: '3', title: 'Analysez & Agissez', description: 'Visualisez la composition culturelle et recevez des recommandations.', emoji: '📊' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl shadow-xl mb-6">
                      {item.emoji}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-indigo-600">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-pink-100 text-pink-700 mb-4">
              Tarifs transparents
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Choisissez votre plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-105 shadow-2xl'
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-lg font-semibold ${plan.popular ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`ml-2 ${plan.popular ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 ${plan.popular ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-indigo-200' : 'text-green-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.popular ? 'text-white' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full py-4 text-center rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center mt-8 text-gray-500">
            Tous les plans incluent le support par email et les mises à jour automatiques
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Questions fréquentes
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm">
            {FAQ.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre culture ?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Rejoignez les 500+ entreprises qui ont déjà révélé le potentiel culturel de leurs équipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl transition-all shadow-xl hover:-translate-y-1"
              >
                Démarrer gratuitement
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="mailto:contact@ethnostyles.fr"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 rounded-xl transition-all"
              >
                Nous contacter
              </a>
            </div>
            <p className="mt-6 text-white/60 text-sm">
              Pas de carte bancaire requise • Setup en 2 minutes • Support inclus
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="font-bold text-xl">Ethnostyles</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme de profiling culturel pour les entreprises qui veulent révéler le potentiel de leurs équipes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#methodology" className="hover:text-white transition-colors">Méthodologie</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Ethnostyles. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
