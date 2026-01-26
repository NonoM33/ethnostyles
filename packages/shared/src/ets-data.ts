// Données ETS V4 - 8 Cultural Profiles (Mythes)
// Based on the 8 Mythes methodology

export const ETS_GROUPS = {
  maintien: {
    name: "Mythe du contrat social",
    shortName: "Contrat Social",
    color: "#3B82F6",
    emoji: "🤝",
    percent: "11,4%",
    tagline: "La passion du respect",
    description: "Harmonie sociale, confiance, bien-être collectif",
    mythes: ["Sécurité", "Tendresse", "Respect", "Confiance", "Harmonie", "Solidarité"],
    fullDescription: "Vous croyez que l'homme est naturellement bon, mais que c'est la société qui le pervertit. Pour vous, l'autonomie et la liberté individuelle priment sur les institutions. Vous vous méfiez du pouvoir et des élites, préférant vous recentrer sur vous-même et vos proches pour trouver sérénité et harmonie.",
    obligations: ["Autonomie", "Famille", "Vérité", "Liberté", "Nature", "Éducation", "Humanisme"],
    interdits: ["Pouvoir", "Politique", "Élites", "Mensonge", "Consommation ostentatoire"],
    motto: "« L'homme est naturellement bon, c'est la société qui le corrompt »",
    strengths: ["Empathie naturelle", "Sens de la vérité", "Quête d'harmonie", "Esprit indépendant"],
    keywords: [
      "équipe", "collaboration", "collectif", "harmonie", "bien-être", "qualité",
      "satisfaction", "confiance", "respect", "solidarité", "entraide", "cohésion"
    ],
    negativeKeywords: ["seul", "individuel", "compétition interne"]
  },
  reconciliation: {
    name: "Réconciliation homme/nature",
    shortName: "Réconciliation",
    color: "#10B981",
    emoji: "🌍",
    percent: "13,8%",
    tagline: "La passion de la nature",
    description: "Écologie, éthique, altruisme, diversité",
    mythes: ["Éthique", "Écologie", "Diversité", "Altruisme", "Planète", "Générosité"],
    fullDescription: "Vous êtes l'île la plus engagée ! Universaliste dans l'âme, vous croyez qu'il faut prendre soin des Hommes et de la planète. Vous rejetez le capitalisme consumériste et militez pour un monde plus juste. La solidarité n'est pas une inclinaison morale pour vous, c'est un principe d'action quotidien.",
    obligations: ["Écologie", "Solidarité", "Démocratie", "Militantisme", "Générosité", "Collectif", "Fraternité"],
    interdits: ["Consumérisme", "Capitalisme", "Individualisme", "Racisme", "Conformisme"],
    motto: "« Prendre soin des Hommes et de la planète »",
    strengths: ["Engagement sincère", "Vision globale", "Sens de la justice", "Esprit solidaire"],
    keywords: [
      "RSE", "durable", "impact", "environnement", "diversité", "inclusion",
      "humanitaire", "bénévolat", "vert", "responsable", "éthique", "social"
    ],
    negativeKeywords: ["profit uniquement", "rentabilité pure"]
  },
  incertitudes: {
    name: "Incertitudes face à l'avenir",
    shortName: "Incertitudes",
    color: "#6B7280",
    emoji: "🌫️",
    percent: "19%",
    tagline: "La traversée du brouillard",
    description: "Anxiété, méfiance, pessimisme, prudence",
    mythes: ["Indifférence", "Tristesse", "Méfiance", "Passé", "Prudence", "Crainte"],
    fullDescription: "Vous faites face à des difficultés qui vous mettent à distance de la société. Ce n'est pas une faiblesse, c'est une réalité que beaucoup partagent. Vous aspirez à la reconnaissance et au bonheur, mais les obstacles semblent nombreux. Votre lucidité sur le monde est aussi votre force.",
    obligations: ["Survie", "Reconnaissance", "Stabilité", "Sécurité"],
    interdits: ["Confiance aveugle", "Prise de risque", "Optimisme naïf"],
    motto: "« Garder les pieds sur terre dans un monde incertain »",
    strengths: ["Lucidité", "Prudence", "Résilience", "Authenticité"],
    keywords: [
      "crise", "risque", "incertitude", "difficile", "problème", "stress",
      "pression", "complexe", "instable", "précaire"
    ],
    negativeKeywords: ["opportunité", "croissance", "optimiste"]
  },
  consommation: {
    name: "Culte de l'appropriation",
    shortName: "Appropriation",
    color: "#F59E0B",
    emoji: "🏆",
    percent: "10,9%",
    tagline: "La passion de la réussite",
    description: "Ambition, performance, conquête, richesse",
    mythes: ["Conquérir", "Héros", "Force", "Argent", "Réussite", "Pouvoir"],
    fullDescription: "Vous croyez au mérite et à la réussite individuelle. Pour vous, la consommation est une façon d'affirmer son statut social. Vous admirez les leaders et aspirez à faire partie de l'élite. L'ambition et la performance sont vos moteurs, et vous assumez pleinement votre quête de reconnaissance.",
    obligations: ["Performance", "Possession", "Domination", "Réussite", "Progrès"],
    interdits: ["Médiocrité", "Collectivisme", "Redistribution", "Passivité"],
    motto: "« Réussir sa vie, c'est posséder et être reconnu »",
    strengths: ["Ambition", "Détermination", "Leadership", "Goût du défi"],
    keywords: [
      "performance", "objectifs", "croissance", "résultats", "ambition",
      "gagner", "leader", "succès", "compétition", "excellence"
    ],
    negativeKeywords: ["nonprofit", "désintéressé"]
  },
  plaisir: {
    name: "Quête du plaisir",
    shortName: "Plaisir",
    color: "#EC4899",
    emoji: "✨",
    percent: "7,9%",
    tagline: "La passion de l'instant",
    description: "Créativité, passion, légèreté, changement",
    mythes: ["Légèreté", "Changement", "Passion", "Beauté", "Aventure", "Liberté"],
    fullDescription: "Carpe Diem ! Vous croyez que la vie est faite pour être savourée intensément. Hédoniste assumé, vous fuyez la routine et les contraintes pour privilégier les expériences, les sensations et la légèreté. Pour vous, le plaisir n'est pas un luxe, c'est une philosophie de vie.",
    obligations: ["Plaisir", "Jeunesse", "Vie", "Modernité", "Luxe", "Sensualité"],
    interdits: ["Routine", "Contraintes", "Passé", "Religion", "Ordre établi"],
    motto: "« Profiter de chaque instant, intensément »",
    strengths: ["Joie de vivre", "Créativité", "Spontanéité", "Audace"],
    keywords: [
      "créatif", "voyage", "passion", "aventure", "expérience", "découverte",
      "innovation", "nouveau", "flexible", "liberté", "fun"
    ],
    negativeKeywords: ["routine", "répétitif", "monotone"]
  },
  tradition: {
    name: "Tradition sacrée",
    shortName: "Tradition",
    color: "#8B5CF6",
    emoji: "⚜️",
    percent: "7,6%",
    tagline: "La passion du sacré",
    description: "Autorité, rigueur, ordre, règles",
    mythes: ["Fermeté", "Patriotisme", "Ordre", "Discipline", "Hiérarchie", "Devoir"],
    fullDescription: "Vous croyez que le respect des traditions protège des maux de la société moderne. Ancré dans des valeurs spirituelles ou morales profondes, vous cherchez ordre et stabilité dans un monde chaotique. La France, le terroir, le devoir et la morale sont vos repères intangibles.",
    obligations: ["Tradition", "Morale", "Terroir", "Ordre", "Spiritualité", "Devoir"],
    interdits: ["Anarchie", "Exotisme", "Aventure", "Passion débridée", "Diversité"],
    motto: "« L'Ordre et la Tradition protègent des chaos »",
    strengths: ["Fidélité aux valeurs", "Sens du devoir", "Stabilité", "Rigueur"],
    keywords: [
      "rigueur", "process", "règles", "procédure", "norme", "contrôle",
      "hiérarchie", "protocole", "qualité", "fiabilité", "sécurité"
    ],
    negativeKeywords: ["agile", "informel", "horizontal"]
  },
  progres: {
    name: "Maîtrise du progrès technique",
    shortName: "Progrès",
    color: "#06B6D4",
    emoji: "🚀",
    percent: "11,1%",
    tagline: "La passion du progrès",
    description: "Innovation, science, entreprise, technologie",
    mythes: ["Science", "Innovation", "Entreprise", "Technologie", "Expertise", "Modernité"],
    fullDescription: "Vous croyez que le progrès technique mène l'Humanité vers le bonheur. Science, innovation et technologie sont vos mantras. Vous êtes optimiste sur l'avenir car vous faites confiance à l'intelligence humaine pour résoudre les problèmes. L'économie de marché et la démocratie forment le substrat de votre vision.",
    obligations: ["Progrès", "Ordre", "Modernité", "Science", "Performance", "Économie"],
    interdits: ["Superstition", "Anarchie", "Passé", "Irrationalité", "Précarité"],
    motto: "« Le Progrès mène l'Homme vers le bonheur »",
    strengths: ["Vision d'avenir", "Rationalité", "Innovation", "Optimisme"],
    keywords: [
      "innovation", "tech", "digital", "IA", "data", "leadership",
      "stratégie", "transformation", "automatisation", "optimisation"
    ],
    negativeKeywords: ["artisanal", "manuel", "traditionnel"]
  },
  famille: {
    name: "Primauté du clan",
    shortName: "Famille",
    color: "#EF4444",
    emoji: "❤️",
    percent: "18,4%",
    tagline: "La passion de la famille",
    description: "Famille, fidélité, transmission, racines",
    mythes: ["Enfant", "Famille", "Fidélité", "Transmission", "Racines", "Foyer"],
    fullDescription: "Pour vous, le Bonheur se trouve au sein du foyer. La famille et les amis proches forment un clan soudé qui vous protège du désordre extérieur. Vous croyez que réussir sa vie, c'est être quelqu'un d'honnête, de digne et de fidèle, pas forcément quelqu'un de riche ou d'influent.",
    obligations: ["Famille", "Vérité", "Amour", "Courage", "Respect", "Harmonie", "Générosité"],
    interdits: ["Désordre", "Mensonge", "Héros médiatiques", "Anarchie", "Peur"],
    motto: "« Amour + Famille + Foyer = Bonheur »",
    strengths: ["Loyauté", "Générosité", "Sens des valeurs", "Stabilité émotionnelle"],
    keywords: [
      "famille", "fidélité", "loyauté", "transmission", "héritage",
      "équilibre", "vie privée", "proximité", "valeurs", "stabilité"
    ],
    negativeKeywords: ["turnover", "mobilité forcée"]
  }
} as const

export type GroupKey = keyof typeof ETS_GROUPS
export type ETSGroup = typeof ETS_GROUPS[GroupKey]

// Question types for dynamic questionnaires
export type QuestionType = "binary" | "choice"

export interface QuestionOption {
  text: string
  groups: Partial<Record<GroupKey, number>>  // Positive points
  negative?: Partial<Record<GroupKey, number>>  // Negative points
}

export interface QuizQuestion {
  id: number
  type: QuestionType
  question: string
  options: QuestionOption[]
  round?: number  // Optional grouping
}

// Questionnaire sizes
export const QUESTIONNAIRE_SIZES = {
  EXPRESS: 8,    // Quick assessment
  STANDARD: 16,  // Balanced
  COMPLETE: 30,  // Full depth
} as const

export type QuestionnaireSize = typeof QUESTIONNAIRE_SIZES[keyof typeof QUESTIONNAIRE_SIZES]

// Questionnaire styles
export const QUESTIONNAIRE_STYLES = {
  PROFESSIONAL: 'professional',  // Formal language, work context
  CASUAL: 'casual',              // Friendly, personal context
  NEUTRAL: 'neutral',            // Standard balanced
} as const

export type QuestionnaireStyle = typeof QUESTIONNAIRE_STYLES[keyof typeof QUESTIONNAIRE_STYLES]

// QUESTIONS V4 - 30 questions gamifiées
// type: "binary" = 2 choix ultra rapides | "choice" = 4 choix classiques
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════
  // ROUND 1: QUI ÊTES-VOUS ? (Questions rapides d'intro)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 1,
    type: "binary",
    round: 1,
    question: "Vous préférez...",
    options: [
      { text: "🎯 Atteindre mes objectifs", groups: { consommation: 3, progres: 1 } },
      { text: "🤝 Être bien entouré", groups: { maintien: 3, famille: 1 } }
    ]
  },
  {
    id: 2,
    type: "binary",
    round: 1,
    question: "Le week-end idéal :",
    options: [
      { text: "🏠 Cocooning en famille/amis", groups: { famille: 3, maintien: 1 } },
      { text: "🌍 Aventure et découverte", groups: { plaisir: 3, progres: 1 } }
    ]
  },
  {
    id: 3,
    type: "binary",
    round: 1,
    question: "Face à un problème :",
    options: [
      { text: "📋 Je suis la méthode", groups: { tradition: 3, progres: 1 } },
      { text: "💡 J'improvise", groups: { plaisir: 2, consommation: 2 } }
    ]
  },
  {
    id: 4,
    type: "binary",
    round: 1,
    question: "L'argent c'est :",
    options: [
      { text: "🔒 La sécurité", groups: { tradition: 2, famille: 2 } },
      { text: "🚀 La liberté", groups: { plaisir: 2, consommation: 2 } }
    ]
  },
  {
    id: 5,
    type: "binary",
    round: 1,
    question: "Vous êtes plutôt :",
    options: [
      { text: "🌱 Écolo engagé", groups: { reconciliation: 3, maintien: 1 } },
      { text: "📈 Pragmatique efficace", groups: { consommation: 2, progres: 2 } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUND 2: VOS VALEURS (Questions de fond)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 6,
    type: "choice",
    round: 2,
    question: "Ce qui compte le plus dans la vie :",
    options: [
      { text: "L'harmonie avec les autres", groups: { maintien: 3, famille: 1 } },
      { text: "La réussite personnelle", groups: { consommation: 3, progres: 1 } },
      { text: "La liberté et les expériences", groups: { plaisir: 3 } },
      { text: "Les valeurs et les principes", groups: { tradition: 2, reconciliation: 2 } }
    ]
  },
  {
    id: 7,
    type: "binary",
    round: 2,
    question: "Le changement :",
    options: [
      { text: "✨ M'excite", groups: { plaisir: 2, progres: 2 } },
      { text: "😰 M'inquiète", groups: { incertitudes: 2, tradition: 2 } }
    ]
  },
  {
    id: 8,
    type: "binary",
    round: 2,
    question: "En groupe, vous êtes :",
    options: [
      { text: "👑 Le leader naturel", groups: { consommation: 3, progres: 1 } },
      { text: "🤗 Le liant social", groups: { maintien: 3, reconciliation: 1 } }
    ]
  },
  {
    id: 9,
    type: "binary",
    round: 2,
    question: "Votre force :",
    options: [
      { text: "🧠 L'analyse et la logique", groups: { progres: 2, tradition: 2 } },
      { text: "❤️ L'empathie et l'écoute", groups: { maintien: 2, reconciliation: 2 } }
    ]
  },
  {
    id: 10,
    type: "binary",
    round: 2,
    question: "Vous préférez :",
    options: [
      { text: "📱 Les nouvelles technologies", groups: { progres: 3, plaisir: 1 } },
      { text: "📚 Les méthodes éprouvées", groups: { tradition: 3, famille: 1 } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUND 3: SITUATIONS DE VIE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 11,
    type: "choice",
    round: 3,
    question: "Un ami vous propose un projet risqué mais excitant :",
    options: [
      { text: "Je fonce, on verra bien !", groups: { plaisir: 2, consommation: 2 } },
      { text: "J'analyse les risques d'abord", groups: { tradition: 2, incertitudes: 2 } },
      { text: "Ça dépend si c'est éthique", groups: { reconciliation: 3, maintien: 1 } },
      { text: "Je préfère la stabilité actuelle", groups: { famille: 2, incertitudes: 2 } }
    ]
  },
  {
    id: 12,
    type: "binary",
    round: 3,
    question: "Réussir c'est :",
    options: [
      { text: "🏆 Être reconnu et admiré", groups: { consommation: 3 } },
      { text: "😊 Être épanoui et serein", groups: { maintien: 2, famille: 2 } }
    ]
  },
  {
    id: 13,
    type: "binary",
    round: 3,
    question: "La routine :",
    options: [
      { text: "😴 Me tue", groups: { plaisir: 3, progres: 1 } },
      { text: "🛡️ Me rassure", groups: { tradition: 2, famille: 2 } }
    ]
  },
  {
    id: 14,
    type: "binary",
    round: 3,
    question: "Face à l'injustice :",
    options: [
      { text: "✊ Je m'engage activement", groups: { reconciliation: 3, maintien: 1 } },
      { text: "🤷 Je reste pragmatique", groups: { consommation: 2, tradition: 2 } }
    ]
  },
  {
    id: 15,
    type: "binary",
    round: 3,
    question: "Votre devise :",
    options: [
      { text: "🎲 Carpe diem !", groups: { plaisir: 3 } },
      { text: "🎯 Qui veut la fin veut les moyens", groups: { consommation: 2, tradition: 2 } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUND 4: RELATIONS ET SOCIÉTÉ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 16,
    type: "choice",
    round: 4,
    question: "L'idéal dans une relation :",
    options: [
      { text: "La complicité et le partage", groups: { maintien: 3, famille: 1 } },
      { text: "L'admiration mutuelle", groups: { consommation: 2, progres: 2 } },
      { text: "La liberté de chacun", groups: { plaisir: 3 } },
      { text: "La loyauté et la durée", groups: { famille: 3, tradition: 1 } }
    ]
  },
  {
    id: 17,
    type: "binary",
    round: 4,
    question: "La compétition :",
    options: [
      { text: "🔥 Me motive", groups: { consommation: 3, progres: 1 } },
      { text: "😔 Me stresse", groups: { maintien: 2, incertitudes: 2 } }
    ]
  },
  {
    id: 18,
    type: "binary",
    round: 4,
    question: "Pour convaincre :",
    options: [
      { text: "📊 Les faits et la logique", groups: { progres: 2, tradition: 2 } },
      { text: "💬 L'émotion et les valeurs", groups: { reconciliation: 2, maintien: 2 } }
    ]
  },
  {
    id: 19,
    type: "binary",
    round: 4,
    question: "Votre cercle d'amis :",
    options: [
      { text: "👥 Petit mais solide", groups: { famille: 3, maintien: 1 } },
      { text: "🌐 Large et varié", groups: { plaisir: 2, progres: 2 } }
    ]
  },
  {
    id: 20,
    type: "binary",
    round: 4,
    question: "La hiérarchie :",
    options: [
      { text: "✅ Nécessaire et utile", groups: { tradition: 3, consommation: 1 } },
      { text: "❌ Souvent un frein", groups: { plaisir: 2, progres: 2 } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUND 5: PROJECTION DANS L'AVENIR
  // ═══════════════════════════════════════════════════════════════
  {
    id: 21,
    type: "choice",
    round: 5,
    question: "Dans 10 ans, vous voulez :",
    options: [
      { text: "Avoir réussi et être influent", groups: { consommation: 3, progres: 1 } },
      { text: "Être entouré de ceux que j'aime", groups: { famille: 3, maintien: 1 } },
      { text: "Avoir vécu plein d'aventures", groups: { plaisir: 3 } },
      { text: "Avoir contribué à un monde meilleur", groups: { reconciliation: 3 } }
    ]
  },
  {
    id: 22,
    type: "binary",
    round: 5,
    question: "L'avenir :",
    options: [
      { text: "🌟 Plein d'opportunités", groups: { plaisir: 2, progres: 2 } },
      { text: "⚠️ Incertain et inquiétant", groups: { incertitudes: 3, tradition: 1 } }
    ]
  },
  {
    id: 23,
    type: "binary",
    round: 5,
    question: "Transmettre :",
    options: [
      { text: "📖 Mes valeurs et mon histoire", groups: { famille: 3, tradition: 1 } },
      { text: "🚀 Mon impact et mes réussites", groups: { consommation: 2, progres: 2 } }
    ]
  },
  {
    id: 24,
    type: "binary",
    round: 5,
    question: "Prendre des risques :",
    options: [
      { text: "💪 Ça me booste", groups: { consommation: 2, plaisir: 2 } },
      { text: "😬 Ça m'angoisse", groups: { incertitudes: 3, tradition: 1 } }
    ]
  },
  {
    id: 25,
    type: "binary",
    round: 5,
    question: "La planète :",
    options: [
      { text: "🌍 Ma priorité absolue", groups: { reconciliation: 3 } },
      { text: "⚖️ Important mais pas que", groups: { consommation: 2, progres: 2 } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUND 6: QUESTIONS FINALES (Précision)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 26,
    type: "choice",
    round: 6,
    question: "Ce qui vous fait vibrer :",
    options: [
      { text: "Innover et créer", groups: { progres: 2, plaisir: 2 } },
      { text: "Aider et connecter", groups: { maintien: 2, reconciliation: 2 } },
      { text: "Gagner et accomplir", groups: { consommation: 3 } },
      { text: "Protéger et préserver", groups: { famille: 2, tradition: 2 } }
    ]
  },
  {
    id: 27,
    type: "binary",
    round: 6,
    question: "Le bonheur :",
    options: [
      { text: "🎁 Se construit chaque jour", groups: { plaisir: 2, maintien: 2 } },
      { text: "🏗️ Se mérite sur la durée", groups: { tradition: 2, consommation: 2 } }
    ]
  },
  {
    id: 28,
    type: "binary",
    round: 6,
    question: "Ce qui vous définit :",
    options: [
      { text: "🧭 Mes valeurs profondes", groups: { reconciliation: 2, tradition: 2 } },
      { text: "🎯 Mes actions et résultats", groups: { consommation: 2, progres: 2 } }
    ]
  },
  {
    id: 29,
    type: "choice",
    round: 6,
    question: "Ce que vous ne supportez pas :",
    options: [
      { text: "L'injustice et l'égoïsme", groups: { reconciliation: 3, maintien: 1 }, negative: { consommation: 1 } },
      { text: "La médiocrité et la lenteur", groups: { consommation: 2, progres: 2 }, negative: { tradition: 1 } },
      { text: "Le chaos et l'improvisation", groups: { tradition: 3 }, negative: { plaisir: 1 } },
      { text: "L'ennui et la monotonie", groups: { plaisir: 3 }, negative: { tradition: 1 } }
    ]
  },
  {
    id: 30,
    type: "choice",
    round: 6,
    question: "Si vous deviez choisir UN mot :",
    options: [
      { text: "LIBERTÉ", groups: { plaisir: 3, progres: 1 } },
      { text: "HARMONIE", groups: { maintien: 3, reconciliation: 1 } },
      { text: "RÉUSSITE", groups: { consommation: 3, progres: 1 } },
      { text: "FAMILLE", groups: { famille: 3, tradition: 1 } }
    ]
  }
]

// Question subsets for different sizes
export const EXPRESS_QUESTION_IDS = [1, 2, 6, 11, 16, 21, 26, 30]  // 8 key questions
export const STANDARD_QUESTION_IDS = [1, 2, 3, 5, 6, 7, 10, 11, 12, 14, 16, 17, 21, 22, 26, 30]  // 16 balanced

// Get questions for a specific questionnaire size
export function getQuestionsForSize(size: QuestionnaireSize): QuizQuestion[] {
  switch (size) {
    case QUESTIONNAIRE_SIZES.EXPRESS:
      return QUIZ_QUESTIONS.filter(q => EXPRESS_QUESTION_IDS.includes(q.id))
    case QUESTIONNAIRE_SIZES.STANDARD:
      return QUIZ_QUESTIONS.filter(q => STANDARD_QUESTION_IDS.includes(q.id))
    case QUESTIONNAIRE_SIZES.COMPLETE:
    default:
      return QUIZ_QUESTIONS
  }
}

// Calculate quiz scores from answers
export function calculateQuizScores(answers: number[], questions: QuizQuestion[]): Record<GroupKey, number> {
  const scores: Record<GroupKey, number> = {
    maintien: 0,
    reconciliation: 0,
    incertitudes: 0,
    consommation: 0,
    plaisir: 0,
    tradition: 0,
    progres: 0,
    famille: 0
  }

  answers.forEach((answerIndex, questionIndex) => {
    const question = questions[questionIndex]
    if (question && question.options[answerIndex]) {
      const option = question.options[answerIndex]

      // Add positive points
      for (const [groupKey, points] of Object.entries(option.groups)) {
        scores[groupKey as GroupKey] += points
      }

      // Subtract negative points if present
      if (option.negative) {
        for (const [groupKey, points] of Object.entries(option.negative)) {
          scores[groupKey as GroupKey] -= points
        }
      }
    }
  })

  // Ensure no negative scores
  for (const key of Object.keys(scores) as GroupKey[]) {
    scores[key] = Math.max(0, scores[key])
  }

  // Normalize
  const maxScore = Math.max(...Object.values(scores), 1)
  for (const key of Object.keys(scores) as GroupKey[]) {
    scores[key] = scores[key] / maxScore
  }

  return scores
}

// Get dominant and secondary myths
export function getDominantMyths(scores: Record<GroupKey, number>): {
  primary: { key: GroupKey; score: number }
  secondary: { key: GroupKey; score: number }
} {
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)

  return {
    primary: { key: sorted[0][0] as GroupKey, score: sorted[0][1] },
    secondary: { key: sorted[1][0] as GroupKey, score: sorted[1][1] }
  }
}

// Calculate confidence score
export function calculateConfidence(scores: Record<GroupKey, number>): number {
  const values = Object.values(scores).sort((a, b) => b - a)
  const top1 = values[0]
  const top2 = values[1]
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  // Multiple factors for confidence:
  // 1. Dominance: How much does the top score stand out from the average?
  const dominance = top1 > 0 ? (top1 - avg) / top1 : 0

  // 2. Gap clarity: Clear separation between top 2 profiles
  const gapClarity = top1 > 0 ? (top1 - top2) / top1 : 0

  // 3. Spread: Distribution across categories (higher spread = clearer pattern)
  const spread = Math.max(...values) - Math.min(...values)

  // Combined formula: weighted average with floor
  const rawConfidence = (dominance * 0.4) + (gapClarity * 0.35) + (spread * 0.25)

  // Scale to 40-95% range (never too low, never 100%)
  return Math.min(0.95, 0.40 + (rawConfidence * 0.55))
}

// Get all group keys
export const GROUP_KEYS: GroupKey[] = [
  'maintien', 'reconciliation', 'incertitudes', 'consommation',
  'plaisir', 'tradition', 'progres', 'famille'
]
