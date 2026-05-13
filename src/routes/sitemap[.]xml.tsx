import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://whisperquest.app";
const lastmod = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE}/`, changefreq: "monthly", priority: "1.0" },
  { loc: `${SITE}/unsubscribe`, changefreq: "yearly", priority: "0.1" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>`;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});