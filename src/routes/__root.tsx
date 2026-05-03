import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/auth/AuthContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      { title: "WHISPER·QUEST – kostenloses klassisches Point-&-Click-Adventure im Cozypunk-Universum" },
      { name: "description", content: "Ein dystopisch-gemütliches Cozypunk-Grafik-Adventure" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "WHISPER·QUEST – kostenloses klassisches Point-&-Click-Adventure im Cozypunk-Universum" },
      { property: "og:description", content: "Ein dystopisch-gemütliches Cozypunk-Grafik-Adventure" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "WHISPER·QUEST – kostenloses klassisches Point-&-Click-Adventure im Cozypunk-Universum" },
      { name: "twitter:description", content: "Ein dystopisch-gemütliches Cozypunk-Grafik-Adventure" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bc900fd6-891e-4eb3-94e5-250b99b05fd1/id-preview-ff0a6747--1c79d45f-aa8e-4dca-81ae-ef180577487c.lovable.app-1776893954764.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bc900fd6-891e-4eb3-94e5-250b99b05fd1/id-preview-ff0a6747--1c79d45f-aa8e-4dca-81ae-ef180577487c.lovable.app-1776893954764.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
