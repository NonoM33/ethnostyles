// Build timestamp: 2026-01-26T11:00:00Z
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Les 8 Îles-Cultures françaises (étude Laurent Benarbia, nov 2022)
const ILES_CULTURES = [
  { name: 'Incertitudes face à l\'avenir', color: '#6B7280', emoji: '🌫️', description: 'Fragilité et aspiration au bonheur', poids: '19%' },
  { name: 'Primauté du clan', color: '#EC4899', emoji: '👨‍👩‍👧‍👦', description: 'La famille comme refuge et valeur centrale', poids: '18,4%' },
  { name: 'Réconciliation homme/nature', color: '#10B981', emoji: '🌿', description: 'Engagement écologique et solidarité', poids: '13,8%' },
  { name: 'Mythe du contrat social', color: '#8B5CF6', emoji: '⚖️', description: 'Autonomie et valeurs humanistes', poids: '11,4%' },
  { name: 'Mythe du progrès technique', color: '#3B82F6', emoji: '🔬', description: 'Innovation, science et modernité', poids: '11,1%' },
  { name: 'Culte de la consommation', color: '#F59E0B', emoji: '💎', description: 'Réussite individuelle et prestige', poids: '10,9%' },
  { name: 'Quête du plaisir', color: '#EF4444', emoji: '🎉', description: 'Hédonisme et épicurisme', poids: '7,9%' },
  { name: 'Tradition sacrée', color: '#7C3AED', emoji: '🏛️', description: 'Conservatisme et héritage culturel', poids: '7,6%' },
]

// Cas concrets d'utilisation par type de collaborateur
const USE_CASES = [
  {
    role: 'Manager',
    emoji: '👔',
    problem: 'Vos réunions d\'équipe tournent au dialogue de sourds ?',
    solution: 'Un "Mythe du progrès" veut avancer vite avec des données, tandis qu\'un "Primauté du clan" cherche d\'abord le consensus familial.',
    action: 'Adaptez votre animation : commencez par créer du lien, puis présentez les faits.',
    result: '+35% d\'idées exploitables en réunion',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    role: 'DRH / Recruteur',
    emoji: '🎯',
    problem: 'Vos nouvelles recrues partent avant 1 an ?',
    solution: 'Un "Quête du plaisir" dans une équipe "Tradition sacrée" va vite se sentir bridé et partir.',
    action: 'Créez des onboardings personnalisés selon l\'île-culture de chaque nouvel arrivant.',
    result: '+40% de rétention à 12 mois',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    role: 'Chef de projet',
    emoji: '📋',
    problem: 'Vos deadlines explosent malgré une équipe compétente ?',
    solution: 'Les "Culte de la consommation" veulent des résultats rapides, les "Contrat social" veulent comprendre le pourquoi.',
    action: 'Clarifiez les rôles : donnez du sens aux uns, des objectifs chiffrés aux autres.',
    result: '-25% de délais dépassés',
    color: 'from-amber-500 to-orange-600',
  },
  {
    role: 'Dirigeant / CEO',
    emoji: '🏢',
    problem: 'Votre transformation digitale patine ?',
    solution: 'Si votre CODIR est à 80% "Tradition sacrée", normal que l\'innovation bloque.',
    action: 'Intégrez des profils "Mythe du progrès" et "Réconciliation homme/nature" pour le changement.',
    result: '2x plus vite sur les projets de transformation',
    color: 'from-purple-500 to-pink-600',
  },
]

// Démos des features de l'app
const FEATURE_DEMOS = [
  {
    id: 'onboarding',
    title: 'Onboarding personnalisé',
    subtitle: 'Chaque collaborateur reçoit un parcours adapté à son île-culture',
    mockup: {
      profile: 'Quête du plaisir',
      emoji: '🎉',
      color: '#EF4444',
      recommendations: [
        { icon: '🎯', text: 'Proposez-lui des missions stimulantes et variées' },
        { icon: '🤝', text: 'Créez des moments conviviaux dès la première semaine' },
        { icon: '🚀', text: 'Laissez-lui de l\'autonomie dans son organisation' },
        { icon: '⚠️', text: 'Évitez les processus trop rigides et formels' },
      ],
    },
  },
  {
    id: 'team-view',
    title: 'Vue équipe instantanée',
    subtitle: 'Visualisez la composition culturelle de votre équipe en un coup d\'œil',
    mockup: {
      teamName: 'Équipe Produit',
      members: [
        { name: 'Alice', profile: 'Mythe du progrès', emoji: '🔬', color: '#3B82F6' },
        { name: 'Bruno', profile: 'Primauté du clan', emoji: '👨‍👩‍👧‍👦', color: '#EC4899' },
        { name: 'Clara', profile: 'Culte conso', emoji: '💎', color: '#F59E0B' },
        { name: 'David', profile: 'Contrat social', emoji: '⚖️', color: '#8B5CF6' },
      ],
      insight: 'Équipe diversifiée - Attention aux tensions progrès/tradition sur les méthodes',
    },
  },
  {
    id: 'management-tips',
    title: 'Conseils management',
    subtitle: 'Recevez des recommandations concrètes pour manager chaque profil',
    mockup: {
      profile: 'Primauté du clan',
      emoji: '👨‍👩‍👧‍👦',
      color: '#EC4899',
      tips: [
        { do: true, text: 'Valorisez l\'esprit d\'équipe et la convivialité' },
        { do: true, text: 'Respectez l\'équilibre vie pro/vie perso' },
        { do: false, text: 'Ne bousculez pas les traditions établies' },
        { do: false, text: 'Évitez les changements trop rapides' },
      ],
    },
  },
]

const STATS = [
  { value: '8', label: 'minutes pour le questionnaire', icon: '⏱️' },
  { value: '24', label: 'questions scientifiques', icon: '🔬' },
  { value: '94%', label: 'taux de complétion', icon: '✅' },
  { value: '+40%', label: 'cohésion équipe en moyenne', icon: '📈' },
]

const CONCRETE_SCENARIOS = [
  {
    title: 'Réunion qui tourne en rond',
    before: 'Tout le monde parle en même temps, personne ne s\'écoute, aucune décision ne sort.',
    insight: '3 "Culte de la consommation" veulent des résultats rapides, 2 "Contrat social" veulent débattre.',
    after: 'Structurez : 10 min de débat libre, puis prise de décision avec des critères objectifs.',
    emoji: '🗣️',
  },
  {
    title: 'Nouveau collaborateur isolé',
    before: 'Marie, arrivée il y a 3 mois, déjeune seule et ne participe pas aux discussions.',
    insight: 'Marie est "Tradition sacrée", entourée de "Quête du plaisir" très sociables.',
    after: 'Proposez-lui des activités en petit comité, respectez son besoin de repères stables.',
    emoji: '👤',
  },
  {
    title: 'Projet en retard chronique',
    before: 'L\'équipe est motivée mais le projet accumule du retard à chaque sprint.',
    insight: '4 "Réconciliation homme/nature" qui débattent des impacts, 0 "Mythe du progrès" pour exécuter.',
    after: 'Intégrez un profil orienté résultats pour structurer et tenir les délais.',
    emoji: '⏰',
  },
  {
    title: 'Conflit entre 2 collaborateurs',
    before: 'Paul et Julie ne peuvent plus travailler ensemble depuis le dernier projet.',
    insight: 'Paul ("Mythe du progrès") veut innover vite, Julie ("Primauté du clan") protège l\'équipe.',
    after: 'Paul propose les innovations, Julie s\'assure que l\'équipe suit. Rôles complémentaires.',
    emoji: '⚡',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: 'Gratuit',
    description: 'Pour tester sur votre équipe',
    features: ['1 campagne', '20 collaborateurs max', 'Profils individuels', 'Export CSV'],
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
      'Collaborateurs illimités',
      'Vue équipe + analytics',
      'Conseils management personnalisés',
      'Benchmark sectoriel',
      'Export PDF & rapports',
      'Support prioritaire',
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
      'Multi-équipes / BU',
      'SSO / SAML',
      'API dédiée',
      'Formation managers',
      'Account manager dédié',
    ],
    cta: 'Demander une démo',
    popular: false,
  },
]

const FAQ = [
  {
    question: 'Comment ça fonctionne concrètement ?',
    answer: 'Vous créez une campagne, envoyez le lien à vos collaborateurs. Chacun répond à 24 questions en 8 minutes. Vous recevez instantanément le profil de chacun + une vue d\'ensemble de votre équipe avec des recommandations de management personnalisées.',
  },
  {
    question: 'Qu\'est-ce que ça change vraiment au quotidien ?',
    answer: 'Vous comprenez enfin pourquoi certaines personnes fonctionnent bien ensemble et d\'autres non. Vous adaptez vos réunions, vos onboardings, vos affectations de projets. Résultat : moins de conflits, plus de cohésion, meilleure rétention.',
  },
  {
    question: 'Est-ce que mes collaborateurs vont accepter de répondre ?',
    answer: 'Avec un taux de complétion de 94%, c\'est notre meilleur score. Le questionnaire est engageant, pas intrusif. Chaque participant reçoit son propre profil en retour, ce qui les motive à participer.',
  },
  {
    question: 'Comment interpréter les résultats sans formation RH ?',
    answer: 'Pas besoin d\'être expert. Chaque profil vient avec des conseils concrets et actionnables : "Pour ce collaborateur, faites X, évitez Y". On vous dit exactement quoi faire.',
  },
  {
    question: 'Les données sont-elles confidentielles ?',
    answer: 'Absolument. Hébergement en France, chiffrement, conformité RGPD. Chaque collaborateur peut demander l\'export ou la suppression de ses données. Vous décidez qui voit quoi.',
  },
]

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
          className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4"
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

function FeatureDemoCard({ demo, isActive }: { demo: typeof FEATURE_DEMOS[0]; isActive: boolean }) {
  const mockup = demo.mockup as Record<string, unknown>

  if (demo.id === 'onboarding') {
    const profile = mockup['profile'] as string
    const emoji = mockup['emoji'] as string
    const color = mockup['color'] as string
    const recommendations = mockup['recommendations'] as Array<{ icon: string; text: string }>
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.95 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}20` }}>
            {emoji}
          </div>
          <div>
            <div className="text-sm text-gray-500">Nouveau collaborateur</div>
            <div className="font-bold text-gray-900">Profil {profile}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 mb-2">Recommandations d'onboarding :</div>
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-lg">{rec.icon}</span>
              <span className="text-sm text-gray-700">{rec.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (demo.id === 'team-view') {
    const teamName = mockup['teamName'] as string
    const members = mockup['members'] as Array<{ name: string; profile: string; emoji: string; color: string }>
    const insight = mockup['insight'] as string
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.95 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="font-bold text-gray-900">{teamName}</div>
          <div className="text-sm text-gray-500">{members.length} membres</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: `${member.color}15` }}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                {member.emoji}
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{member.name}</div>
                <div className="text-xs" style={{ color: member.color }}>{member.profile}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm text-amber-800">{insight}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (demo.id === 'management-tips') {
    const profile = mockup['profile'] as string
    const emoji = mockup['emoji'] as string
    const color = mockup['color'] as string
    const tips = mockup['tips'] as Array<{ do: boolean; text: string }>
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.95 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}20` }}>
            {emoji}
          </div>
          <div>
            <div className="text-sm text-gray-500">Comment manager un</div>
            <div className="font-bold text-gray-900">{profile}</div>
          </div>
        </div>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg ${tip.do ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${tip.do ? 'bg-green-500' : 'bg-red-500'}`}>
                {tip.do ? '✓' : '✕'}
              </span>
              <span className={`text-sm ${tip.do ? 'text-green-800' : 'text-red-800'}`}>{tip.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  return null
}

export function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [activeDemo, setActiveDemo] = useState(0)
  const [activeScenario, setActiveScenario] = useState(0)

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
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 transition-colors">Cas d'usage</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Démo</a>
              <a href="#scenarios" className="text-gray-600 hover:text-gray-900 transition-colors">Exemples</a>
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

      {/* Hero Section - Valeur immédiate */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 -left-20 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute top-40 -right-20 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-30"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Hook ultra clair */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-8">
                <span className="text-red-600 font-semibold">Le problème :</span>
                <span className="text-red-700">Vos équipes sont compétentes mais ne fonctionnent pas ensemble</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Comprenez enfin
                <br />
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                    pourquoi ça coince
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-indigo-200 to-purple-200 -z-0 origin-left"
                  />
                </span>
                <br />
                <span className="text-gray-900">dans vos équipes</span>
              </h1>

              <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Cartographiez le profil culturel de chaque collaborateur.
                <br />
                <span className="font-semibold text-gray-900">Adaptez votre management. Boostez la cohésion.</span>
              </p>

              {/* Promesse ultra concrète */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                  <span>✓</span> Onboarding personnalisé par profil
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                  <span>✓</span> Conseils management concrets
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                  <span>✓</span> Résolution de conflits
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  Tester sur mon équipe
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#scenarios"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                  Voir des exemples concrets
                </a>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Gratuit pour 20 collaborateurs • Résultats en 8 minutes • Pas de carte bancaire
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
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
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-1 text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases par rôle - Cas concrets */}
      <section id="use-cases" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 mb-4">
                Cas d'usage concrets
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Ça vous parle ?
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Choisissez votre situation. Découvrez comment Ethnostyles la résout.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {USE_CASES.map((useCase, index) => (
              <motion.div
                key={useCase.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-2xl`}>
                    {useCase.emoji}
                  </div>
                  <div className="font-bold text-xl text-gray-900">{useCase.role}</div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">?</span>
                      <p className="text-red-800 font-medium">{useCase.problem}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      <p className="text-amber-800">{useCase.solution}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">→</span>
                      <p className="text-green-800">{useCase.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <span className="text-2xl font-bold text-indigo-600">{useCase.result}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Demos - Interactive */}
      <section id="features" className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-white mb-4">
              Démo de l'application
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Voilà ce que vous obtenez
            </h2>
            <p className="mt-4 text-xl text-indigo-200 max-w-3xl mx-auto">
              Des outils concrets pour manager différemment, dès demain.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Demo selector */}
            <div className="space-y-4">
              {FEATURE_DEMOS.map((demo, index) => (
                <motion.button
                  key={demo.id}
                  onClick={() => setActiveDemo(index)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-6 rounded-2xl transition-all ${
                    activeDemo === index
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">{demo.title}</div>
                  <div className={activeDemo === index ? 'text-gray-600' : 'text-white/70'}>
                    {demo.subtitle}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Demo preview */}
            <div className="lg:sticky lg:top-24">
              <AnimatePresence mode="wait">
                <FeatureDemoCard
                  key={FEATURE_DEMOS[activeDemo]!.id}
                  demo={FEATURE_DEMOS[activeDemo]!}
                  isActive={true}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Les 8 Îles-Cultures */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Les 8 Îles-Cultures françaises
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Étude ethnographique sur 2023 Français - Chaque île-culture représente un système de croyances partagées
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {ILES_CULTURES.map((ile, index) => (
              <motion.div
                key={ile.name}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="group relative"
              >
                <div
                  className="px-5 py-3 rounded-2xl text-white font-medium shadow-lg cursor-pointer transition-shadow hover:shadow-xl flex items-center gap-2"
                  style={{ backgroundColor: ile.color }}
                >
                  <span className="text-xl">{ile.emoji}</span>
                  <span className="text-sm">{ile.name}</span>
                </div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap text-center">
                    <div className="font-bold">{ile.poids}</div>
                    <div>{ile.description}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scénarios concrets - Before/After */}
      <section id="scenarios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 mb-4">
              Exemples réels
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Reconnaissez-vous ces situations ?
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Scenario selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {CONCRETE_SCENARIOS.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScenario(index)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    activeScenario === index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="mr-2">{scenario.emoji}</span>
                  {scenario.title}
                </button>
              ))}
            </div>

            {/* Active scenario */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl">
                      {CONCRETE_SCENARIOS[activeScenario]!.emoji}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {CONCRETE_SCENARIOS[activeScenario]!.title}
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-5 bg-red-50 rounded-xl">
                      <div className="text-red-600 font-bold text-sm mb-2">AVANT</div>
                      <p className="text-red-800">{CONCRETE_SCENARIOS[activeScenario]!.before}</p>
                    </div>

                    <div className="p-5 bg-indigo-50 rounded-xl">
                      <div className="text-indigo-600 font-bold text-sm mb-2">DIAGNOSTIC ETHNOSTYLES</div>
                      <p className="text-indigo-800">{CONCRETE_SCENARIOS[activeScenario]!.insight}</p>
                    </div>

                    <div className="p-5 bg-green-50 rounded-xl">
                      <div className="text-green-600 font-bold text-sm mb-2">APRÈS</div>
                      <p className="text-green-800">{CONCRETE_SCENARIOS[activeScenario]!.after}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* How It Works - Simplifié */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

            {[
              { step: '1', title: 'Créez une campagne', description: 'Nommez votre équipe, personnalisez le message d\'invitation.', emoji: '🚀' },
              { step: '2', title: 'Partagez le lien', description: 'Vos collaborateurs répondent en 8 min. Taux de complétion : 94%.', emoji: '📧' },
              { step: '3', title: 'Agissez', description: 'Recevez les profils + recommandations de management personnalisées.', emoji: '💪' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-pink-100 text-pink-700 mb-4">
              Tarifs simples
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Testez gratuitement
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Commencez avec 20 collaborateurs, sans engagement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                      Recommandé
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Questions fréquentes
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
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
              Prêt à comprendre votre équipe ?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Testez gratuitement sur 20 collaborateurs. Premiers résultats en 8 minutes.
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
              Pas de carte bancaire • RGPD compliant • Support inclus
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
                Comprenez vos équipes. Adaptez votre management. Boostez la cohésion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#use-cases" className="hover:text-white transition-colors">Cas d'usage</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="mailto:contact@ethnostyles.fr" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
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
