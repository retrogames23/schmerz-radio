import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Donation Checkout: erstellt eine Stripe-Checkout-Session für eine Spende.
 * Voraussetzung: User muss eingeloggt sein (Bearer-Token im Authorization-Header).
 * Beträge sind frei wählbar, Mindestbetrag 1 €.
 */

const MIN_AMOUNT_CENTS = 300;
const MAX_AMOUNT_CENTS = 100_000;

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/donation-checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabasePub = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!stripeKey || !supabaseUrl || !supabasePub) {
          return json(500, { error: "Server nicht konfiguriert." });
        }

        // Auth: User-JWT aus Header
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        if (!token) {
          return json(401, { error: "Nicht angemeldet." });
        }
        const supabase = createClient(supabaseUrl, supabasePub, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } =
          await supabase.auth.getUser(token);
        if (userErr) {
          console.error("[donation-checkout] getUser error", {
            message: userErr.message,
            status: (userErr as { status?: number }).status,
            tokenLen: token.length,
          });
          return json(401, { error: "Ungültige Sitzung." });
        }
        if (!userData.user) {
          console.error("[donation-checkout] no user in getUser response");
          return json(401, { error: "Ungültige Sitzung (kein User)." });
        }
        let userEmail = userData.user.email ?? null;
        if (!userEmail) {
          // Fallback: Email aus profiles nachladen (z. B. wenn JWT-Claim
          // die Email nicht enthält — passiert bei manchen OAuth-/Refresh-
          // Pfaden).
          const { data: prof } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", userData.user.id)
            .maybeSingle();
          userEmail = prof?.email ?? null;
          console.warn("[donation-checkout] email fallback from profiles", {
            userId: userData.user.id,
            hasEmail: !!userEmail,
          });
        }
        if (!userEmail) {
          return json(401, { error: "Account ohne E-Mail-Adresse." });
        }
        const user = { ...userData.user, email: userEmail };

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, { error: "Invalid JSON" });
        }
        const b = body as { amountCents?: unknown };
        const amount =
          typeof b.amountCents === "number" && Number.isFinite(b.amountCents)
            ? Math.floor(b.amountCents)
            : 0;
        if (amount < MIN_AMOUNT_CENTS || amount > MAX_AMOUNT_CENTS) {
          return json(400, { error: "Ungültiger Betrag." });
        }

        // Do NOT trust the client-supplied Origin header — it can be spoofed by
        // non-browser clients to turn the Stripe success/cancel URLs into an
        // open redirect. Use a server-configured base URL, falling back to the
        // request Host header (set by the edge, not the client).
        const host = request.headers.get("host") ?? "";
        const baseUrl =
          process.env.APP_BASE_URL ??
          (host ? `https://${host}` : "https://schmerz-radio.com");

        const stripe = new Stripe(stripeKey, {
          apiVersion: "2026-04-22.dahlia",
        });

        let customerId: string | undefined;
        try {
          const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
          });
          if (customers.data.length > 0) customerId = customers.data[0].id;
        } catch (e) {
          console.error("stripe customer lookup failed", e);
        }

        let session: Stripe.Checkout.Session;
        try {
          session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer: customerId,
            customer_email: customerId ? undefined : user.email,
            client_reference_id: user.id ?? null,
            metadata: {
              user_id: user.id,
              email: user.email ?? "",
            },
            line_items: [
              {
                quantity: 1,
                price_data: {
                  currency: "eur",
                  unit_amount: amount,
                  product_data: {
                    name: "Schmerz-Radio Spende",
                    description:
                      "Spende für Schmerz-Radio. Schaltet unbegrenzten Cloud-KI-Chat frei.",
                  },
                },
              },
            ],
            success_url: `${baseUrl}/?donation=success`,
            cancel_url: `${baseUrl}/?donation=cancel`,
          });
        } catch (e) {
          console.error("stripe checkout create failed", e);
          return json(502, { error: "Stripe nicht erreichbar." });
        }

        return json(200, { url: session.url });
      },
    },
  },
});