import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/game/Game";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SCHMERZ·RADIO – Cozypunk Point-&-Click-Adventure" },
      {
        name: "description",
        content:
          "Ein 2D Point & Click-Adventure über bürokratische Erstarrung und das heimliche Begehren nach echtem Erleben.",
      },
      { property: "og:title", content: "SCHMERZ·RADIO – Cozypunk Adventure" },
      {
        property: "og:description",
        content:
          "Ein 2D Point & Click-Adventure über bürokratische Erstarrung und das heimliche Begehren nach echtem Erleben.",
      },
      { property: "og:url", content: "https://schmerz-radio.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://schmerz-radio.com/" },
    ],
  }),
});

function Index() {
  return <Game />;
}
