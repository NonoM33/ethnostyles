import { Resend } from 'resend'

// Email client will be initialized with API key from environment
let resendClient: Resend | null = null

export function getEmailClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env['RESEND_API_KEY']
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// Email sending interface
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions) {
  const client = getEmailClient()

  const result = await client.emails.send({
    from: options.from || 'Ethnostyles <noreply@ethnostyles.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  })

  return result
}

// Re-export Resend for advanced usage
export { Resend }

// Email templates
export { generateResultsEmailHtml, getResultsEmailSubject } from './templates/results'
