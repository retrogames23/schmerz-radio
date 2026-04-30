import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Stripe Webhook: empfängt `checkout.session.completed`,
 * loggt die Spende und schaltet den User für Cloud-Chat frei.
 * Verifiziert die Stripe-Signatur — niemals ohne Verifikation Daten verändern.
 */

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
          console.error("stripe-webhook: missing env");
          return json(500, { error: "Server nicht konfiguriert." });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) return json(400, { error: "Missing signature" });

        const rawBody = await request.text();
        const stripe = new Stripe(stripeKey, {
          apiVersion: "2026-04-22.dahlia",
        });

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            rawBody,
            signature,
            webhookSecret,
          );
        } catch (e) {
          console.error("stripe-webhook signature verify failed", e);
          return json(400, { error: "Invalid signature" });
        }

        if (event.type !== "checkout.session.completed") {
          // Andere Events still ignorieren.
          return json(200, { received: true });
        }

        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ??
          (session.metadata?.user_id as string | undefined);
        const email =
          session.customer_details?.email ??
          (session.customer_email as string | null) ??
          (session.metadata?.email as string | undefined) ??
          "";
        const amount = session.amount_total ?? 0;
        const currency = session.currency ?? "eur";
        const paymentIntent =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null);

        if (!userId) {
          console.error("stripe-webhook: no user_id in session", session.id);
          return json(200, { received: true, skipped: "no user_id" });
        }
        if (session.payment_status !== "paid") {
          return json(200, { received: true, skipped: "not paid" });
        }

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // Spende loggen (idempotent via UNIQUE auf stripe_session_id).
        const { error: insertErr } = await admin.from("donations").insert({
          user_id: userId,
          email,
          amount_cents: amount,
          currency,
          stripe_session_id: session.id,
          stripe_payment_intent: paymentIntent,
        });
        if (insertErr && !/duplicate key/i.test(insertErr.message)) {
          console.error("stripe-webhook: donations insert failed", insertErr);
          // 500 → Stripe retried den Webhook automatisch.
          return json(500, { error: "DB insert failed" });
        }

        // User für unbegrenzten Cloud-Chat freischalten.
        const { error: profErr } = await admin
          .from("profiles")
          .update({ donation_unlocked: true })
          .eq("user_id", userId);
        if (profErr) {
          console.error("stripe-webhook: profile update failed", profErr);
          return json(500, { error: "Profile update failed" });
        }

        return json(200, { received: true });
      },
    },
  },
});