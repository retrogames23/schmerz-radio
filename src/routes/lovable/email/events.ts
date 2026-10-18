import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'

type SuppressionReason = 'bounce' | 'complaint' | 'unsubscribe'

function mapReasonToStatus(
  reason: SuppressionReason,
): 'bounced' | 'complained' | 'suppressed' {
  switch (reason) {
    case 'bounce':
      return 'bounced'
    case 'complaint':
      return 'complained'
    default:
      return 'suppressed'
  }
}

function mapReasonToMessage(reason: SuppressionReason): string {
  switch (reason) {
    case 'bounce':
      return 'Permanent bounce — email address is invalid or rejected'
    case 'complaint':
      return 'Spam complaint — recipient marked email as spam'
    case 'unsubscribe':
      return 'Recipient unsubscribed'
  }
}

// Records the terminal outcome in the app's own log tables (notification-only;
// Lovable enforces suppression at send time regardless). Throws on failure so
// the delivery is retried.
async function recordSuppression(
  recipient: string,
  reason: SuppressionReason,
): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Server configuration error')
  }
  const supabase = createClient(supabaseUrl, serviceKey)
  const normalizedEmail = recipient.toLowerCase()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert(
      { email: normalizedEmail, reason, metadata: null },
      { onConflict: 'email' },
    )
  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      code: suppressError.code,
      message: suppressError.message,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: insertError } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: 'system',
    recipient_email: normalizedEmail,
    status: mapReasonToStatus(reason),
    error_message: mapReasonToMessage(reason),
    metadata: null,
  })
  if (insertError) {
    console.error('Failed to insert email_send_log', {
      code: insertError.code,
      message: insertError.message,
    })
    throw new Error('Failed to write send log')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await recordSuppression(event.data.recipient, 'bounce')
              console.log('Email bounced', { event_id: event.event_id })
            },
            'email.complaint': async (event) => {
              await recordSuppression(event.data.recipient, 'complaint')
              console.log('Email complaint', { event_id: event.event_id })
            },
            'email.unsubscribed': async (event) => {
              await recordSuppression(event.data.recipient, 'unsubscribe')
              console.log('Email unsubscribed', { event_id: event.event_id })
            },
          },
        })
        return handler(request)
      },
    },
  },
})
