import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function DeleteConfirmPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmDeletion = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Lien invalide')
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/delete-confirm`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }
        )
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.message || 'Une erreur est survenue')
        }
      } catch {
        setStatus('error')
        setMessage('Erreur réseau')
      }
    }

    confirmDeletion()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Suppression en cours...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Données supprimées</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 text-left">
              <p className="font-medium mb-2">Ce qui a été fait :</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Votre adresse email a été supprimée</li>
                <li>Votre code Passeport a été invalidé</li>
                <li>Vos réponses ont été anonymisées</li>
              </ul>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Un email de confirmation vous a été envoyé.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Le lien peut avoir expiré ou avoir déjà été utilisé.
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
