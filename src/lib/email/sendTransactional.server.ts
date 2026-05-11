import * as React from "react";
import { render } from "@react-email/components";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "WHISPER·QUEST";
const SENDER_DOMAIN = "notify.schmerz-radio.com";
const FROM_DOMAIN = "schmerz-radio.com";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function redact(email: string | null | undefined): string {
  if (!email) return "***";
  const [l, d] = email.split("@");
  if (!l || !d) return "***";
  return `${l[0]}***@${d}`;
}

export interface SendTransactionalOptions {
  templateName: string;
  recipientEmail: string;
  idempotencyKey?: string;
  templateData?: Record<string, unknown>;
}

/**
 * Server-side enqueue of a transactional email — same pipeline as
 * /lovable/email/transactional/send but callable from trusted server
 * contexts (webhooks, server fns) using a service-role Supabase client.
 */
export async function sendTransactionalEmailServer(
  supabase: SupabaseClient,
  opts: SendTransactionalOptions,
): Promise<{ success: boolean; reason?: string; error?: string }> {
  const { templateName, recipientEmail, templateData = {} } = opts;
  const messageId = crypto.randomUUID();
  const idempotencyKey = opts.idempotencyKey ?? messageId;

  const template = TEMPLATES[templateName];
  if (!template) {
    return { success: false, error: `Template '${templateName}' not found` };
  }

  const effectiveRecipient = template.to || recipientEmail;
  if (!effectiveRecipient) {
    return { success: false, error: "recipientEmail required" };
  }
  const normalizedEmail = effectiveRecipient.toLowerCase();

  // Suppression check (fail-closed)
  const { data: suppressed, error: supErr } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (supErr) {
    console.error("Suppression check failed", supErr);
    return { success: false, error: "suppression_check_failed" };
  }
  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "suppressed",
    });
    return { success: false, reason: "email_suppressed" };
  }

  // Get or create unsubscribe token
  let unsubscribeToken: string;
  const { data: existingToken } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    const newToken = generateToken();
    await supabase
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: newToken, email: normalizedEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (!stored) {
      return { success: false, error: "token_storage_failed" };
    }
    unsubscribeToken = stored.token;
  } else {
    return { success: false, reason: "email_suppressed" };
  }

  // Render
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const resolvedSubject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
  });

  const { error: enqueueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    console.error("enqueue failed", enqueueError, redact(effectiveRecipient));
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { success: false, error: "enqueue_failed" };
  }

  return { success: true };
}