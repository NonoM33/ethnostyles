import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Results {
  passeportCode: string
  primaryMythe: string
  profileData: {
    primary: string
    scores: Record<string, number>
  } | null
  completedAt: string
  campaign: {
    name: string
    logoUrl: string | null
    primaryColor: string | null
  }
}

// Mythe descriptions (simplified for MVP)
const MYTHE_DESCRIPTIONS: Record<string, { tagline: string; description: string; icon: string }> = {
  Explorateur: {
    tagline: 'La curiosité comme moteur',
    description: 'Vous êtes animé par la découverte et l\'aventure. Votre soif de nouveauté vous pousse à explorer de nouveaux horizons, que ce soit géographiquement, intellectuellement ou spirituellement.',
    icon: '🧭',
  },
  Gardien: {
    tagline: 'La protection comme valeur',
    description: 'Vous accordez une grande importance à la sécurité et à la préservation. Vous êtes un pilier de stabilité pour votre entourage et vous vous engagez à protéger ce qui vous est cher.',
    icon: '🛡️',
  },
  Créateur: {
    tagline: 'L\'innovation comme art de vivre',
    description: 'Vous êtes animé par le désir de créer et d\'innover. Votre imagination débordante vous pousse à transformer les idées en réalité et à laisser votre empreinte unique sur le monde.',
    icon: '✨',
  },
  Sage: {
    tagline: 'La connaissance comme lumière',
    description: 'Vous recherchez la vérité et la compréhension profonde. Votre soif de savoir vous guide vers une réflexion constante et un partage éclairé de vos connaissances.',
    icon: '📚',
  },
  Héros: {
    tagline: 'Le courage comme force',
    description: 'Vous êtes prêt à relever tous les défis pour atteindre vos objectifs. Votre détermination et votre bravoure inspirent les autres à donner le meilleur d\'eux-mêmes.',
    icon: '⚔️',
  },
  Rebelle: {
    tagline: 'Le changement comme mission',
    description: 'Vous remettez en question l\'ordre établi et cherchez à transformer ce qui ne fonctionne pas. Votre esprit révolutionnaire est une force de changement positive.',
    icon: '🔥',
  },
  Magicien: {
    tagline: 'La transformation comme pouvoir',
    description: 'Vous avez le don de voir les possibilités là où les autres voient des limites. Votre capacité à transformer les situations fait de vous un catalyseur de changement.',
    icon: '🪄',
  },
  Innocent: {
    tagline: 'L\'optimisme comme philosophie',
    description: 'Vous voyez le meilleur en chaque personne et situation. Votre foi en l\'humanité et votre pureté d\'intention inspirent la confiance et l\'espoir autour de vous.',
    icon: '🌟',
  },
}

export function QuestionnaireResultsPage() {
  const { slug, respondentId } = useParams<{ slug: string; respondentId: string }>()

  const [results, setResults] = useState<Results | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [deleteMessage, setDeleteMessage] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportEmail, setExportEmail] = useState('')
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [exportMessage, setExportMessage] = useState('')
  const pdfContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(
          `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/respondent/${respondentId}/results`
        )
        const data = await response.json()

        if (response.ok) {
          setResults(data)
        } else {
          setError(data.message || 'Erreur lors du chargement des résultats')
        }
      } catch {
        setError('Erreur réseau')
      }
      setIsLoading(false)
    }
    fetchResults()
  }, [respondentId])

  const copyPasseport = () => {
    if (results?.passeportCode) {
      navigator.clipboard.writeText(results.passeportCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getShareUrl = () => {
    return `${window.location.origin}/profile/${respondentId}`
  }

  const getShareText = () => {
    if (!results) return ''
    return `Je viens de découvrir mon profil Ethnostyles : je suis ${results.primaryMythe} ! ${mytheInfo?.tagline || ''}`
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(getShareText())}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl())
    setShowShareMenu(false)
  }

  const downloadPdf = async () => {
    if (!pdfContentRef.current || !results) return

    setIsGeneratingPdf(true)

    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f9fafb',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      // Add footer
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} - Ethnostyles Profiler`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: 'center' }
      )

      pdf.save(`profil-ethnostyles-${results.primaryMythe.toLowerCase()}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    }

    setIsGeneratingPdf(false)
  }

  const handleDeleteRequest = async () => {
    if (!deleteEmail.trim()) {
      setDeleteMessage('Veuillez entrer votre email')
      setDeleteStatus('error')
      return
    }

    setDeleteStatus('loading')
    setDeleteMessage('')

    try {
      const response = await fetch(
        `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/respondent/${respondentId}/delete-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: deleteEmail }),
        }
      )
      const data = await response.json()

      if (response.ok) {
        setDeleteStatus('success')
        setDeleteMessage(data.message)
      } else {
        setDeleteStatus('error')
        setDeleteMessage(data.message || 'Une erreur est survenue')
      }
    } catch {
      setDeleteStatus('error')
      setDeleteMessage('Erreur réseau')
    }
  }

  const handleExportRequest = async () => {
    if (!exportEmail.trim()) {
      setExportMessage('Veuillez entrer votre email')
      setExportStatus('error')
      return
    }

    setExportStatus('loading')
    setExportMessage('')

    try {
      const response = await fetch(
        `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/respondent/${respondentId}/export-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: exportEmail }),
        }
      )
      const data = await response.json()

      if (response.ok) {
        setExportStatus('success')
        setExportMessage(data.message)
      } else {
        setExportStatus('error')
        setExportMessage(data.message || 'Une erreur est survenue')
      }
    } catch {
      setExportStatus('error')
      setExportMessage('Erreur réseau')
    }
  }

  const primaryColor = results?.campaign.primaryColor || '#4F46E5'
  const mytheInfo = results?.primaryMythe ? MYTHE_DESCRIPTIONS[results.primaryMythe] : null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }} />
          <p className="text-gray-600">Calcul de votre profil en cours...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Résultats non trouvés'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div ref={pdfContentRef} className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {results.campaign.logoUrl && (
            <img src={results.campaign.logoUrl} alt="" className="h-12 mx-auto mb-4 object-contain" />
          )}
          <p className="text-gray-600">Résultats de votre profil Ethnostyles</p>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Mythe Header */}
          <div
            className="p-8 text-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-6xl mb-4"
            >
              {mytheInfo?.icon || '🎯'}
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">{results.primaryMythe}</h1>
            <p className="text-white/80">{mytheInfo?.tagline || 'Votre profil culturel unique'}</p>
          </div>

          {/* Description */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Votre profil</h2>
            <p className="text-gray-600 leading-relaxed">
              {mytheInfo?.description || 'Découvrez votre profil Ethnostyles unique qui reflète vos valeurs, motivations et comportements culturels.'}
            </p>
          </div>

          {/* Scores (if available) */}
          {results.profileData?.scores && (
            <div className="px-8 pb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Répartition de vos mythes
              </h3>
              <div className="space-y-3">
                {Object.entries(results.profileData.scores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([mythe, score], index) => (
                    <div key={mythe}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={index === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                          {MYTHE_DESCRIPTIONS[mythe]?.icon} {mythe}
                        </span>
                        <span className="text-gray-500">{score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: index === 0 ? primaryColor : `${primaryColor}60` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Passeport Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <svg className="w-6 h-6" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Votre code Passeport</h3>
              <p className="text-sm text-gray-500 mb-3">
                Conservez ce code ! Il vous permettra de retrouver votre profil sur d'autres campagnes.
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-mono text-lg tracking-wider text-center">
                  {results.passeportCode}
                </code>
                <button
                  onClick={copyPasseport}
                  className="px-4 py-3 rounded-lg font-medium text-white transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Partager votre profil</h3>
          <div className="flex flex-wrap gap-3">
            {/* Twitter/X */}
            <button
              onClick={shareToTwitter}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Twitter</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={shareToLinkedIn}
              className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006097] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>LinkedIn</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareToFacebook}
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Copier le lien</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={downloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
            </button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500"
        >
          <p>
            Un email avec vos résultats et votre code Passeport vous a été envoyé.
          </p>
          <p className="mt-1">
            Complété le {new Date(results.completedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </motion.div>

        {/* RGPD Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center pt-4 border-t border-gray-200 flex justify-center gap-4 flex-wrap"
        >
          <button
            onClick={() => setShowExportModal(true)}
            className="text-sm text-gray-400 hover:text-indigo-500 transition-colors"
          >
            Exporter mes données (RGPD)
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Supprimer mes données (RGPD)
          </button>
        </motion.div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Exporter mes données</h3>
            <p className="text-gray-600 text-sm mb-4">
              Conformément au RGPD, vous pouvez télécharger une copie de vos données personnelles au format JSON.
            </p>

            {exportStatus === 'success' ? (
              <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-4">
                <p className="font-medium">Demande envoyée</p>
                <p className="text-sm mt-1">{exportMessage}</p>
              </div>
            ) : (
              <>
                <div className="bg-indigo-50 text-indigo-700 rounded-lg p-4 mb-4 text-sm">
                  <strong>Le fichier contiendra :</strong>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Votre profil Ethnostyles</li>
                    <li>Vos réponses au questionnaire</li>
                    <li>Votre code Passeport</li>
                    <li>Les dates et heures</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmez votre email
                  </label>
                  <input
                    type="email"
                    value={exportEmail}
                    onChange={(e) => setExportEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {exportStatus === 'error' && (
                  <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
                    {exportMessage}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExportModal(false)
                  setExportEmail('')
                  setExportStatus('idle')
                  setExportMessage('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {exportStatus === 'success' ? 'Fermer' : 'Annuler'}
              </button>
              {exportStatus !== 'success' && (
                <button
                  onClick={handleExportRequest}
                  disabled={exportStatus === 'loading'}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {exportStatus === 'loading' ? 'Envoi...' : 'Recevoir le lien'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer mes données</h3>
            <p className="text-gray-600 text-sm mb-4">
              Conformément au RGPD, vous pouvez demander la suppression de vos données personnelles.
              Cette action est irréversible.
            </p>

            {deleteStatus === 'success' ? (
              <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-4">
                <p className="font-medium">Demande envoyée</p>
                <p className="text-sm mt-1">{deleteMessage}</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 text-amber-700 rounded-lg p-4 mb-4 text-sm">
                  <strong>Attention :</strong>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Votre email sera supprimé</li>
                    <li>Votre code Passeport sera invalidé</li>
                    <li>Vous ne pourrez plus récupérer vos résultats</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmez votre email
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {deleteStatus === 'error' && (
                  <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
                    {deleteMessage}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteEmail('')
                  setDeleteStatus('idle')
                  setDeleteMessage('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {deleteStatus === 'success' ? 'Fermer' : 'Annuler'}
              </button>
              {deleteStatus !== 'success' && (
                <button
                  onClick={handleDeleteRequest}
                  disabled={deleteStatus === 'loading'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteStatus === 'loading' ? 'Envoi...' : 'Demander la suppression'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
