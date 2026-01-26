import { db, tenants, users, questions } from './src/index'
import { createHash } from 'crypto'

const MYTHES = ['Explorateur', 'Gardien', 'Créateur', 'Sage', 'Héros', 'Rebelle', 'Magicien', 'Innocent'] as const

// Sample questions - 170 questions distributed across 8 mythes
const QUESTION_TEMPLATES = [
  { dimension: 'Explorateur', questions: [
    "J'aime découvrir de nouveaux endroits",
    "La routine me pèse rapidement",
    "Je suis curieux de nature",
    "J'aime sortir de ma zone de confort",
    "Les voyages m'enrichissent",
  ]},
  { dimension: 'Gardien', questions: [
    "La sécurité de mes proches est primordiale",
    "Je préfère la stabilité au changement",
    "Les traditions ont de la valeur pour moi",
    "Je planifie toujours à l'avance",
    "La fiabilité est une qualité essentielle",
  ]},
  { dimension: 'Créateur', questions: [
    "J'aime créer des choses nouvelles",
    "L'art m'inspire au quotidien",
    "Je vois le monde différemment",
    "L'innovation me passionne",
    "J'aime exprimer ma créativité",
  ]},
  { dimension: 'Sage', questions: [
    "La connaissance est un trésor",
    "J'aime comprendre le pourquoi des choses",
    "La réflexion guide mes décisions",
    "J'apprécie les discussions profondes",
    "L'apprentissage est un plaisir continu",
  ]},
  { dimension: 'Héros', questions: [
    "Je relève les défis avec détermination",
    "L'adversité me rend plus fort",
    "Je protège ceux qui en ont besoin",
    "L'excellence est mon objectif",
    "Je n'abandonne jamais facilement",
  ]},
  { dimension: 'Rebelle', questions: [
    "Je remets en question l'ordre établi",
    "Les règles injustes doivent être changées",
    "Je défends mes convictions",
    "Le conformisme me déplaît",
    "Le changement est nécessaire",
  ]},
  { dimension: 'Magicien', questions: [
    "Je crois aux possibilités infinies",
    "La transformation est toujours possible",
    "Je vois le potentiel caché des choses",
    "L'impossible n'existe pas vraiment",
    "Je sais créer des opportunités",
  ]},
  { dimension: 'Innocent', questions: [
    "Je vois le bon côté des choses",
    "La confiance est naturelle pour moi",
    "L'optimisme guide ma vie",
    "La simplicité a de la valeur",
    "Je crois en la bonté humaine",
  ]},
]

async function seed() {
  console.log('🌱 Starting seed...')

  // Create sample tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: 'Entreprise Demo',
      domain: 'demo.ethnostyles.com',
    })
    .onConflictDoNothing()
    .returning()

  if (tenant) {
    console.log(\`✅ Created tenant: \${tenant.name}\`)

    // Create admin user (password: "password123")
    const passwordHash = createHash('sha256').update('password123').digest('hex')
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: 'admin@demo.ethnostyles.com',
        name: 'Admin Demo',
        passwordHash,
        role: 'admin',
      })
      .onConflictDoNothing()
      .returning()

    if (user) {
      console.log(\`✅ Created admin user: \${user.email}\`)
    }
  }

  // Generate 170 questions
  const allQuestions: { number: number; text: string; mytheDimension: string; category: string }[] = []
  let questionNumber = 1

  // Generate questions by rotating through mythes
  while (questionNumber <= 170) {
    for (const template of QUESTION_TEMPLATES) {
      for (const baseQuestion of template.questions) {
        if (questionNumber > 170) break

        // Add variation to questions
        const variations = [
          baseQuestion,
          \`\${baseQuestion} dans ma vie quotidienne\`,
          \`\${baseQuestion} dans mes relations\`,
          \`\${baseQuestion} au travail\`,
        ]
        const text = variations[Math.floor((questionNumber - 1) / 40) % variations.length] || baseQuestion

        allQuestions.push({
          number: questionNumber,
          text: \`\${text}.\`,
          mytheDimension: template.dimension,
          category: template.dimension.toLowerCase(),
        })
        questionNumber++
        if (questionNumber > 170) break
      }
      if (questionNumber > 170) break
    }
  }

  // Insert questions
  const insertedQuestions = await db
    .insert(questions)
    .values(allQuestions)
    .onConflictDoNothing()
    .returning()

  console.log(\`✅ Created \${insertedQuestions.length} questions\`)

  console.log('🎉 Seed complete!')
  console.log('')
  console.log('Demo credentials:')
  console.log('  Email: admin@demo.ethnostyles.com')
  console.log('  Password: password123')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
