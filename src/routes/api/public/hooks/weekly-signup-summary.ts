import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'

const TEMPLATE_NAME = 'weekly-signup-summary'

export const Route = createFileRoute('/api/public/hooks/weekly-signup-summary')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth via server-only service role key. Der frühere Check gegen
        // SUPABASE_PUBLISHABLE_KEY war wirkungslos, weil dieser Key im
        // Client-Bundle ausgeliefert wird und damit öffentlich ist.
        const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const authHeader = request.headers.get('authorization') ?? ''
        const bearer = authHeader.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length)
          : null
        const providedKey = bearer ?? request.headers.get('apikey')
        if (!expectedKey || !providedKey || providedKey !== expectedKey) {
          return new Response('Unauthorized', { status: 401 })
        }

        const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'Server misconfigured' }, { status: 500 })
        }
        const supabase = createClient(supabaseUrl, serviceKey)

        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const { data: signups, error: signupsError } = await supabase
          .from('profiles')
          .select('email, created_at')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })

        if (signupsError) {
          console.error('Failed to load signups', signupsError)
          return Response.json({ error: 'query_failed' }, { status: 500 })
        }

        const { count: totalAccounts } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        const rangeLabel = `${since.toLocaleDateString('de-DE')} – ${new Date().toLocaleDateString('de-DE')}`
        const templateData = {
          rangeLabel,
          signups: signups ?? [],
          totalAccounts: totalAccounts ?? 0,
        }

        const template = TEMPLATES[TEMPLATE_NAME]
        if (!template || !template.to) {
          return Response.json({ error: 'template_missing' }, { status: 500 })
        }
        const recipient = template.to

        const messageId = crypto.randomUUID()
        try {
          const result = await sendTemplateEmail(TEMPLATE_NAME, recipient, {
            templateData,
            idempotencyKey: `weekly-signup-${since.toISOString().slice(0, 10)}`,
          })
          const { error: logErr } = await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipient,
            status: result.sent ? 'sent' : 'suppressed',
          })
          if (logErr) console.error('email log failed', logErr)
          if (!result.sent) {
            return Response.json({ skipped: 'suppressed' })
          }
        } catch (sendErr) {
          console.error('send failed', sendErr)
          const { error: logErr } = await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipient,
            status: 'failed',
            error_message:
              sendErr instanceof Error ? sendErr.message.slice(0, 1000) : String(sendErr),
          })
          if (logErr) console.error('email log failed', logErr)
          return Response.json({ error: 'send_failed' }, { status: 500 })
        }

        return Response.json({
          success: true,
          new_signups: signups?.length ?? 0,
          total_accounts: totalAccounts ?? 0,
        })
      },
    },
  },
})