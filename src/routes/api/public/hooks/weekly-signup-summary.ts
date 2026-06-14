import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'SCHMERZ·RADIO'
const SENDER_DOMAIN = 'notify.schmerz-radio.com'
const FROM_DOMAIN = 'schmerz-radio.com'
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

        // Suppression check
        const { data: suppressed } = await supabase
          .from('suppressed_emails')
          .select('id')
          .eq('email', recipient.toLowerCase())
          .maybeSingle()
        if (suppressed) {
          return Response.json({ skipped: 'suppressed' })
        }

        const messageId = crypto.randomUUID()
        const element = React.createElement(template.component, templateData)
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const subject =
          typeof template.subject === 'function'
            ? template.subject(templateData)
            : template.subject

        await supabase.from('email_send_log').insert({
          message_id: messageId,
          template_name: TEMPLATE_NAME,
          recipient_email: recipient,
          status: 'pending',
        })

        const { error: enqueueError } = await supabase.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: recipient,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: TEMPLATE_NAME,
            idempotency_key: `weekly-signup-${since.toISOString().slice(0, 10)}`,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqueueError) {
          console.error('enqueue failed', enqueueError)
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipient,
            status: 'failed',
            error_message: 'enqueue_failed',
          })
          return Response.json({ error: 'enqueue_failed' }, { status: 500 })
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