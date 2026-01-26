interface ResultsEmailData {
  recipientName?: string
  primaryMythe: string
  mytheDescription: string
  passeportCode: string
  resultsUrl: string
  campaignName: string
  campaignLogo?: string | null
  primaryColor?: string
}

const MYTHE_COLORS: Record<string, string> = {
  Explorateur: '#3B82F6',
  Gardien: '#10B981',
  Créateur: '#8B5CF6',
  Sage: '#F59E0B',
  Héros: '#EF4444',
  Rebelle: '#F97316',
  Magicien: '#6366F1',
  Innocent: '#EC4899',
}

export function generateResultsEmailHtml(data: ResultsEmailData): string {
  const mytheColor = MYTHE_COLORS[data.primaryMythe] || data.primaryColor || '#4F46E5'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vos résultats Ethnostyles</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Mythe -->
          <tr>
            <td style="background-color: ${mytheColor}; padding: 40px 32px; text-align: center;">
              ${data.campaignLogo ? `<img src="${data.campaignLogo}" alt="" style="height: 48px; margin-bottom: 24px;">` : ''}
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                ${data.primaryMythe}
              </h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Votre profil Ethnostyles
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                ${data.recipientName ? `Bonjour ${data.recipientName},` : 'Bonjour,'}
              </p>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Merci d'avoir complété le questionnaire <strong>${data.campaignName}</strong>.
                Voici vos résultats !
              </p>

              <!-- Profile Description -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 12px 0; color: ${mytheColor}; font-size: 20px;">
                  Votre Mythe : ${data.primaryMythe}
                </h2>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                  ${data.mytheDescription}
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 8px 0 24px 0;">
                    <a href="${data.resultsUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${mytheColor}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Voir mes résultats complets
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Passeport Section -->
              <div style="border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Votre Code Passeport
                </p>
                <p style="margin: 0 0 12px 0; color: #111827; font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 2px;">
                  ${data.passeportCode}
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                  Conservez ce code pour retrouver votre profil sur d'autres campagnes
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                Cet email a été envoyé par Ethnostyles Profiler.<br>
                Vos données sont traitées conformément au RGPD.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function getResultsEmailSubject(primaryMythe: string): string {
  return `Votre profil Ethnostyles : ${primaryMythe}`
}
