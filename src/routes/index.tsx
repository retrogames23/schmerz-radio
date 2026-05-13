import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/game/Game";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "WHISPER·QUEST – Cozypunk Point-&-Click-Adventure" },
      {
        name: "description",
        content:
          "Ein 2D Point & Click-Adventure über bürokratische Erstarrung und das heimliche Begehren nach echtem Erleben.",
      },
      { property: "og:title", content: "WHISPER·QUEST – Cozypunk Adventure" },
      {
        property: "og:description",
        content:
          "Ein 2D Point & Click-Adventure über bürokratische Erstarrung und das heimliche Begehren nach echtem Erleben.",
      },
      { property: "og:url", content: "https://whisperquest.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://whisperquest.app/" },
    ],
  }),
});

function Index() {
  return <Game />;
}
