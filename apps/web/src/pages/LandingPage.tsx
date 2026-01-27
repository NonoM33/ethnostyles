// Build timestamp: 2026-01-26T11:00:00Z
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Les 8 profils culturels (étude Laurent Benarbia, nov 2022 - 2023 Français)
// Noms simplifiés pour la landing page + noms scientifiques entre parenthèses
const ILES_CULTURES = [
  { name: 'Les Prudents', scientificName: 'Incertitudes face à l\'avenir', color: '#6B7280', emoji: '🌫️', description: 'Cherchent la sécurité et la stabilité', poids: '19%' },
  { name: 'Les Protecteurs', scientificName: 'Primauté du clan', color: '#EC4899', emoji: '👨‍👩‍👧‍👦', description: 'La famille et l\'équipe avant tout', poids: '18,4%' },
  { name: 'Les Engagés', scientificName: 'Réconciliation homme/nature', color: '#10B981', emoji: '🌿', description: 'Portés par les valeurs et l\'impact', poids: '13,8%' },
  { name: 'Les Équilibristes', scientificName: 'Mythe du contrat social', color: '#8B5CF6', emoji: '⚖️', description: 'Justice, autonomie et consensus', poids: '11,4%' },
  { name: 'Les Innovateurs', scientificName: 'Mythe du progrès technique', color: '#3B82F6', emoji: '🔬', description: 'Veulent tester, innover, avancer', poids: '11,1%' },
  { name: 'Les Ambitieux', scientificName: 'Culte de la consommation', color: '#F59E0B', emoji: '💎', description: 'Résultats, performance, reconnaissance', poids: '10,9%' },
  { name: 'Les Enthousiastes', scientificName: 'Quête du plaisir', color: '#EF4444', emoji: '🎉', description: 'Énergie, convivialité, spontanéité', poids: '7,9%' },
  { name: 'Les Gardiens', scientificName: 'Tradition sacrée', color: '#7C3AED', emoji: '🏛️', description: 'Respect des process et de l\'histoire', poids: '7,6%' },
]

// Cas concrets d'utilisation par type de collaborateur
const USE_CASES = [
  {
    role: 'Manager',
    emoji: '👔',
    problem: 'Vos réunions d\'équipe tournent au dialogue de sourds ?',
    solution: 'Un Innovateur 🔬 veut avancer vite avec des données, tandis qu\'un Protecteur 👨‍👩‍👧‍👦 cherche d\'abord le consensus.',
    action: 'Adaptez votre animation : commencez par créer du lien, puis présentez les faits.',
    result: '+35% d\'idées exploitables en réunion',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    role: 'DRH / Recruteur',
    emoji: '🎯',
    problem: 'Vos nouvelles recrues partent avant 1 an ?',
    solution: 'Un Enthousiaste 🎉 dans une équipe de Gardiens 🏛️ va vite se sentir bridé et partir.',
    action: 'Créez des onboardings personnalisés selon le profil de chaque nouvel arrivant.',
    result: '+40% de rétention à 12 mois',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    role: 'Chef de projet',
    emoji: '📋',
    problem: 'Vos deadlines explosent malgré une équipe compétente ?',
    solution: 'Les Ambitieux 💎 veulent des résultats rapides, les Équilibristes ⚖️ veulent comprendre le pourquoi.',
    action: 'Clarifiez les rôles : donnez du sens aux uns, des objectifs chiffrés aux autres.',
    result: '-25% de délais dépassés',
    color: 'from-amber-500 to-orange-600',
  },
  {
    role: 'Dirigeant / CEO',
    emoji: '🏢',
    problem: 'Votre transformation digitale patine ?',
    solution: 'Si votre CODIR est à 80% Gardiens 🏛️, normal que l\'innovation bloque.',
    action: 'Intégrez des Innovateurs 🔬 et des Engagés 🌿 pour accélérer le changement.',
    result: '2x plus vite sur les projets de transformation',
    color: 'from-purple-500 to-pink-600',
  },
]

// Démos des features de l'app
const FEATURE_DEMOS = [
  {
    id: 'onboarding',
    title: 'Onboarding personnalisé',
    subtitle: 'Chaque collaborateur reçoit un parcours adapté à son profil',
    mockup: {
      profile: 'Enthousiaste',
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
    subtitle: 'Visualisez la composition de votre équipe en un coup d\'œil',
    mockup: {
      teamName: 'Équipe Produit',
      members: [
        { name: 'Alice', profile: 'Innovateur', emoji: '🔬', color: '#3B82F6' },
        { name: 'Bruno', profile: 'Protecteur', emoji: '👨‍👩‍👧‍👦', color: '#EC4899' },
        { name: 'Clara', profile: 'Ambitieux', emoji: '💎', color: '#F59E0B' },
        { name: 'David', profile: 'Équilibriste', emoji: '⚖️', color: '#8B5CF6' },
      ],
      insight: 'Équipe diversifiée - Attention aux tensions innovation/tradition',
    },
  },
  {
    id: 'management-tips',
    title: 'Conseils management',
    subtitle: 'Recevez des recommandations concrètes pour manager chaque profil',
    mockup: {
      profile: 'Protecteur',
      emoji: '👨‍👩‍👧‍👦',
      color: '#EC4899',
      tips: [
        { do: true, text: 'Valorisez l\'esprit d\'équipe et la convivialité' },
        { do: true, text: 'Respectez l\'équilibre vie pro/vie perso' },
        { do: false, text: 'Ne bousculez pas les habitudes établies' },
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
    insight: '3 Ambitieux 💎 veulent des résultats rapides, 2 Équilibristes ⚖️ veulent débattre.',
    after: 'Structurez : 10 min de débat libre, puis prise de décision avec des critères objectifs.',
    emoji: '🗣️',
  },
  {
    title: 'Nouveau collaborateur isolé',
    before: 'Marie, arrivée il y a 3 mois, déjeune seule et ne participe pas aux discussions.',
    insight: 'Marie est Gardienne 🏛️, entourée d\'Enthousiastes 🎉 très sociables.',
    after: 'Proposez-lui des activités en petit comité, respectez son besoin de repères stables.',
    emoji: '👤',
  },
  {
    title: 'Projet en retard chronique',
    before: 'L\'équipe est motivée mais le projet accumule du retard à chaque sprint.',
    insight: '4 Engagés 🌿 qui débattent des impacts, 0 Innovateur 🔬 pour exécuter.',
    after: 'Intégrez un profil orienté résultats pour structurer et tenir les délais.',
    emoji: '⏰',
  },
  {
    title: 'Conflit entre 2 collaborateurs',
    before: 'Paul et Julie ne peuvent plus travailler ensemble depuis le dernier projet.',
    insight: 'Paul (Innovateur 🔬) veut avancer vite, Julie (Protectrice 👨‍👩‍👧‍👦) protège l\'équipe.',
    after: 'Paul propose les innovations, Julie s\'assure que l\'équipe suit. Rôles complémentaires.',
    emoji: '⚡',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: 'Gratuit',
    description: 'Testez sur votre équipe',
    limit: 'Jusqu\'à 20 personnes',
    features: [
      '1 campagne de test',
      '20 collaborateurs max',
      'Profils individuels complets',
      'Export CSV des résultats',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
    note: 'Sans carte bancaire',
  },
  {
    name: 'Pro',
    price: '49€',
    period: '/mois',
    description: 'Pour les équipes qui grandissent',
    limit: 'Jusqu\'à 100 personnes',
    features: [
      'Campagnes illimitées',
      'Jusqu\'à 100 collaborateurs',
      'Vue équipe + analytics',
      'Conseils management par profil',
      'Benchmark vs votre secteur',
      'Export PDF & rapports',
      'Support par email prioritaire',
    ],
    cta: 'Essai gratuit 14 jours',
    popular: true,
    note: '14 jours d\'essai gratuit',
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    description: 'Grandes organisations',
    limit: 'Collaborateurs illimités',
    features: [
      'Tout Pro inclus',
      'Multi-équipes / Business Units',
      'SSO / SAML (Okta, Azure AD...)',
      'API dédiée + webhooks',
      'Formation managers incluse',
      'Account manager dédié',
    ],
    cta: 'Demander une démo',
    popular: false,
    note: 'Devis sous 48h',
  },
]

// Témoignages clients
const TESTIMONIALS = [
  {
    name: 'Sophie Martin',
    role: 'DRH',
    company: 'Nexia Consulting',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    quote: 'On a divisé notre turnover par 2 en adaptant nos onboardings aux profils. Le ROI est évident.',
    metric: '-52% turnover',
  },
  {
    name: 'Thomas Durand',
    role: 'CEO',
    company: 'TechFlow',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    quote: 'Je comprends enfin pourquoi certaines équipes fonctionnent et d\'autres non. Indispensable.',
    metric: '+40% cohésion',
  },
  {
    name: 'Marie Lefebvre',
    role: 'Manager',
    company: 'Groupe Altitude',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    quote: 'Mes réunions sont passées de 2h de débat stérile à 45 min de décisions concrètes.',
    metric: '-60% temps réunion',
  },
]

const FAQ = [
  {
    question: 'Comment ça fonctionne concrètement ?',
    answer: 'Vous créez une campagne en 2 minutes, envoyez le lien à vos collaborateurs par email ou Slack. Chacun répond à 24 questions en 8 minutes. Vous recevez instantanément le profil de chacun + une vue d\'ensemble de votre équipe avec des recommandations de management personnalisées.',
    icon: '🚀',
    category: 'Démarrage',
  },
  {
    question: 'Et si mes collaborateurs refusent de répondre ?',
    answer: 'Avec un taux de complétion de 94%, c\'est rare. Le secret : chaque participant reçoit son propre profil détaillé en retour. C\'est du gagnant-gagnant. Présentez-le comme un outil de développement personnel, pas d\'évaluation. Nous fournissons aussi des templates d\'email qui fonctionnent.',
    icon: '🤔',
    category: 'Adoption',
  },
  {
    question: 'Quelle différence avec un test MBTI ou DISC ?',
    answer: 'MBTI et DISC mesurent la personnalité individuelle. Ethnostyles mesure les valeurs culturelles profondes — ce qui motive vraiment les gens et comment ils interagissent en équipe. C\'est basé sur une étude ethnographique de 2023 Français, pas sur des typologies américaines des années 60.',
    icon: '🔬',
    category: 'Science',
  },
  {
    question: 'Est-ce que ça fonctionne avec une équipe en remote ?',
    answer: 'Parfaitement. Le questionnaire est 100% en ligne. La vue équipe est même plus utile en remote car vous n\'avez pas les signaux non-verbaux du présentiel. Plusieurs clients l\'utilisent pour leurs équipes distribuées sur plusieurs pays.',
    icon: '🌍',
    category: 'Remote',
  },
  {
    question: 'Combien de temps avant de voir des résultats concrets ?',
    answer: 'Premiers insights dès que 3-4 personnes ont répondu (souvent sous 24h). Vous pouvez commencer à adapter votre management immédiatement. Les gains mesurables (rétention, productivité) apparaissent généralement sous 2-3 mois.',
    icon: '⏱️',
    category: 'Résultats',
  },
  {
    question: 'Comment interpréter les résultats sans formation RH ?',
    answer: 'Pas besoin d\'être expert. Chaque profil vient avec des conseils concrets et actionnables : "Pour ce collaborateur, faites X, évitez Y". On vous dit exactement quoi faire, pas de jargon psy.',
    icon: '📊',
    category: 'Utilisation',
  },
  {
    question: 'Les données sont-elles confidentielles ?',
    answer: 'Absolument. Hébergement en France (pas aux USA), chiffrement AES-256, conformité RGPD totale. Chaque collaborateur peut demander l\'export ou la suppression de ses données en 1 clic. Vous décidez qui voit quoi dans votre organisation.',
    icon: '🔒',
    category: 'Sécurité',
  },
  {
    question: 'Puis-je tester sur moi-même d\'abord ?',
    answer: 'Oui ! Créez une campagne gratuite et passez le questionnaire vous-même. Vous verrez votre propre profil et comprendrez exactement ce que vos collaborateurs recevront. C\'est la meilleure façon de vous convaincre.',
    icon: '🎯',
    category: 'Test',
  },
]

function FAQItem({ question, answer, icon, category, isOpen, onClick }: { question: string; answer: string; icon: string; category: string; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div
      className={`rounded-xl sm:rounded-2xl transition-all duration-300 ${
        isOpen
          ? 'bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg ring-1 ring-indigo-100'
          : 'bg-white hover:bg-gray-50 shadow-sm'
      }`}
      layout
    >
      <button
        onClick={onClick}
        className="w-full p-4 sm:p-6 flex items-start gap-3 sm:gap-4 text-left"
      >
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 transition-colors ${
          isOpen ? 'bg-indigo-100' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
              isOpen ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {category}
            </span>
          </div>
          <span className={`text-sm sm:text-base lg:text-lg font-semibold block leading-snug ${isOpen ? 'text-indigo-900' : 'text-gray-900'}`}>
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            isOpen ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pl-[3.25rem] sm:pl-[4.5rem]">
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

      {/* Hero Section - Simplifié et percutant */}
      <section className="relative pt-32 pb-16 overflow-hidden">
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                En 8 minutes, comprenez
                <br />
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                    pourquoi vos équipes
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-indigo-200 to-purple-200 -z-0 origin-left"
                  />
                </span>
                <br />
                <span className="text-gray-900">ne fonctionnent pas ensemble</span>
              </h1>

              <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Le questionnaire scientifique qui révèle les profils de vos collaborateurs — et comment les manager.
              </p>

              {/* Stats en ligne */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">24</span> questions
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">94%</span> taux de complétion
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-2">
                  Gratuit jusqu'à <span className="text-indigo-600 font-bold">20</span> personnes
                </span>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  Créer ma première campagne
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#demo-test"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border-2 border-indigo-200 hover:border-indigo-300"
                >
                  <span className="mr-2">🎯</span>
                  Faire le test moi-même (2 min)
                </a>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Pas de carte bancaire requise • RGPD compliant • Support inclus
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mini-test CTA Section */}
      <section id="demo-test" className="py-8 sm:py-12 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Curieux de découvrir votre propre profil ?
              </h3>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-indigo-200">
                Passez le mini-test en 2 minutes et recevez un aperçu de votre profil culturel.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg whitespace-nowrap text-sm sm:text-base"
            >
              <span className="mr-2">🎯</span>
              Faire le mini-test gratuit
            </Link>
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

      {/* Témoignages clients */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700 mb-4">
                Ils utilisent Ethnostyles
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Ce qu'en disent nos clients
              </h2>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                  "{testimonial.quote}"
                </blockquote>
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-full font-bold text-xs sm:text-sm">
                  {testimonial.metric}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Logos entreprises */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 mb-6">Ils nous font confiance</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale">
              <div className="text-2xl font-bold text-gray-400">Nexia</div>
              <div className="text-2xl font-bold text-gray-400">TechFlow</div>
              <div className="text-2xl font-bold text-gray-400">Altitude</div>
              <div className="text-2xl font-bold text-gray-400">Synapse</div>
              <div className="text-2xl font-bold text-gray-400">Horizon</div>
            </div>
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

      {/* Les 8 Profils Culturels */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 mb-4">
              La science derrière Ethnostyles
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              8 profils culturels, 8 façons de voir le monde
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Basé sur une étude ethnographique de 2023 Français. Chaque profil représente un système de valeurs profondes.
            </p>
          </div>

          {/* Grille responsive des profils */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {ILES_CULTURES.map((ile, index) => (
              <motion.div
                key={ile.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <div
                  className="relative p-4 sm:p-5 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  style={{ backgroundColor: ile.color }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl">{ile.emoji}</span>
                    <span className="font-bold text-sm sm:text-base leading-tight">{ile.name}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 leading-snug">
                    {ile.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <span className="text-xs font-bold text-white/90">{ile.poids} des Français</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scénarios concrets - Before/After */}
      <section id="scenarios" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 mb-4">
              Exemples réels
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Reconnaissez-vous ces situations ?
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Scenario selector - scrollable on mobile */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center scrollbar-hide">
              {CONCRETE_SCENARIOS.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScenario(index)}
                  className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                    activeScenario === index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{scenario.emoji}</span>
                  <span className="hidden sm:inline">{scenario.title}</span>
                  <span className="sm:hidden">{scenario.title.split(' ')[0]}</span>
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
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                      {CONCRETE_SCENARIOS[activeScenario]!.emoji}
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {CONCRETE_SCENARIOS[activeScenario]!.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="p-4 sm:p-5 bg-red-50 rounded-xl">
                      <div className="text-red-600 font-bold text-xs sm:text-sm mb-1 sm:mb-2">AVANT</div>
                      <p className="text-red-800 text-sm sm:text-base">{CONCRETE_SCENARIOS[activeScenario]!.before}</p>
                    </div>

                    <div className="p-4 sm:p-5 bg-indigo-50 rounded-xl">
                      <div className="text-indigo-600 font-bold text-xs sm:text-sm mb-1 sm:mb-2">DIAGNOSTIC</div>
                      <p className="text-indigo-800 text-sm sm:text-base">{CONCRETE_SCENARIOS[activeScenario]!.insight}</p>
                    </div>

                    <div className="p-4 sm:p-5 bg-green-50 rounded-xl">
                      <div className="text-green-600 font-bold text-xs sm:text-sm mb-1 sm:mb-2">APRÈS</div>
                      <p className="text-green-800 text-sm sm:text-base">{CONCRETE_SCENARIOS[activeScenario]!.after}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden sm:block absolute top-16 left-[16%] right-[16%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

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
                className="relative text-center sm:text-center flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl sm:mb-6">
                    {item.emoji}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-indigo-600 text-sm">
                    {item.step}
                  </div>
                </div>
                <div className="text-left sm:text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coût de l'inaction - Urgence */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700 mb-4">
                Le coût de l'inaction
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Chaque mois sans agir vous coûte
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 text-center shadow-sm border border-red-100"
            >
              <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1 sm:mb-2">15 000€</div>
              <div className="text-gray-600 text-sm sm:text-base">par départ évitable</div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">Coût moyen de remplacement d'un collaborateur</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 text-center shadow-sm border border-orange-100"
            >
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">31h</div>
              <div className="text-gray-600 text-sm sm:text-base">perdues par mois en conflits</div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">Temps passé à gérer des tensions au lieu de produire</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 text-center shadow-sm border border-amber-100"
            >
              <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-1 sm:mb-2">-23%</div>
              <div className="text-gray-600 text-sm sm:text-base">de productivité</div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">Perte de performance avec des tensions non résolues</p>
            </motion.div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 px-5 sm:px-6 py-4 sm:py-4 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-xl sm:max-w-none sm:inline-flex mx-auto"
            >
              <span className="text-2xl hidden sm:block">💡</span>
              <div className="text-center sm:text-left">
                <div className="font-bold text-gray-900 text-sm sm:text-base">Premiers insights exploitables sous 24h</div>
                <div className="text-xs sm:text-sm text-gray-500">Commencez à agir dès demain</div>
              </div>
              <Link
                to="/register"
                className="w-full sm:w-auto sm:ml-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap text-sm sm:text-base"
              >
                Commencer maintenant
              </Link>
            </motion.div>
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
              Tarifs simples et transparents
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Commencez gratuitement, évoluez quand vous êtes prêt
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Une campagne = un questionnaire envoyé à une équipe. Relancez autant de fois que nécessaire.
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
                  {plan.limit && (
                    <p className={`mt-1 text-sm font-medium ${plan.popular ? 'text-indigo-200' : 'text-indigo-600'}`}>
                      {plan.limit}
                    </p>
                  )}
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
                {plan.note && (
                  <p className={`mt-3 text-center text-sm ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {plan.note}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 mb-4">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Vous avez des questions ?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tout ce que vous devez savoir pour démarrer
              </p>
            </motion.div>
          </div>

          <div className="space-y-4">
            {FAQ.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <FAQItem
                  question={item.question}
                  answer={item.answer}
                  icon={item.icon}
                  category={item.category}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              </motion.div>
            ))}
          </div>

          {/* CTA sous la FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-4">Vous ne trouvez pas la réponse à votre question ?</p>
            <a
              href="mailto:contact@ethnostyles.fr"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contactez-nous
            </a>
          </motion.div>
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
              Prêt à transformer votre équipe ?
            </h2>
            <p className="text-xl text-white/80 mb-4 max-w-2xl mx-auto">
              Créez votre première campagne en 2 minutes. Premiers insights sous 24h.
            </p>

            {/* Récapitulatif des bénéfices */}
            <div className="flex flex-wrap justify-center gap-4 mb-10 text-white/90">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                20 collaborateurs gratuits
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Support inclus
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl transition-all shadow-xl hover:-translate-y-1"
              >
                Créer ma première campagne
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="mailto:contact@ethnostyles.fr"
                className="inline-flex items-center justify-center px-8 py-5 text-lg font-semibold text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 rounded-xl transition-all"
              >
                Poser une question
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
