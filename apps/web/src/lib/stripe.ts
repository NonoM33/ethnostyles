import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY']
    if (!key) {
      console.warn('Stripe publishable key not found')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}
