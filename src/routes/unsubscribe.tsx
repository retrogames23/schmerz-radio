import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  head: () => ({
    meta: [
      { title: "E-Mail abbestellen – WHISPER·QUEST" },
      {
        name: "description",
        content:
          "Bestätige hier die Abmeldung von WHISPER·QUEST-E-Mails über deinen persönlichen Abmelde-Link.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "E-Mail abbestellen – WHISPER·QUEST" },
      {
        property: "og:description",
        content: "Abmeldung von WHISPER·QUEST-E-Mails bestätigen.",
      },
      { property: "og:url", content: "https://whisperquest.app/unsubscribe" },
    ],
    links: [
      { rel: "canonical", href: "https://whisperquest.app/unsubscribe" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = useSearch({ from: "/unsubscribe" });
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.valid) setState({ kind: "valid" });
        else if (data?.reason === "already_unsubscribed")
          setState({ kind: "already" });
        else setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "invalid" }));
  }, [token]);

  async function confirm() {
    setState({ kind: "submitting" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (data?.success) setState({ kind: "done" });
      else if (data?.reason === "already_unsubscribed")
        setState({ kind: "already" });
      else
        setState({
          kind: "error",
          message: data?.error ?? "Unbekannter Fehler",
        });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Fehler",
      });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-lg border border-border bg-card">
        <h1 className="text-2xl font-semibold text-foreground">
          E-Mail abbestellen
        </h1>
        {state.kind === "loading" && (
          <p className="text-muted-foreground">Token wird geprüft…</p>
        )}
        {state.kind === "invalid" && (
          <p className="text-muted-foreground">
            Dieser Link ist ungültig oder abgelaufen.
          </p>
        )}
        {state.kind === "already" && (
          <p className="text-muted-foreground">
            Diese Adresse ist bereits abgemeldet.
          </p>
        )}
        {state.kind === "valid" && (
          <>
            <p className="text-muted-foreground">
              Möchtest du keine E-Mails mehr von WHISPER·QUEST erhalten?
            </p>
            <button
              onClick={confirm}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Abmeldung bestätigen
            </button>
          </>
        )}
        {state.kind === "submitting" && (
          <p className="text-muted-foreground">Wird verarbeitet…</p>
        )}
        {state.kind === "done" && (
          <p className="text-foreground">
            Du wurdest erfolgreich abgemeldet. Layard winkt müde.
          </p>
        )}
        {state.kind === "error" && (
          <p className="text-destructive">Fehler: {state.message}</p>
        )}
      </div>
    </main>
  );
}