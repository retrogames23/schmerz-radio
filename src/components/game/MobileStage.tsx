import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mobile-Stage: skaliert die Desktop-App (virtuelle 1024×640-Bühne) so,
 * dass sie ins Mobil-Viewport passt. Auf Desktop (>= 768px Breite) wird
 * der Wrapper transparent (`display: contents`-artig) — die Kinder
 * rendern unverändert.
 *
 * Im Hochformat auf Mobil zeigen wir einen Hinweis-Banner, der dazu
 * auffordert, das Gerät querzuhalten (mit "Trotzdem spielen"-Option).
 */
const STAGE_W = 1024;
const STAGE_H = 640;
const MOBILE_BREAKPOINT = 768;

/**
 * `uprightOnPortrait`: Wenn true, wird im Hochformat NICHT gedreht — die
 * Bühne bleibt aufrecht und wird passend skaliert. Wird für offene
 * Text-Konsolen (Terminal, NodeTerminal) gesetzt, weil dort die
 * System-Tastatur aufpoppt und mit einer 90°-Rotation kollidiert.
 */
export function MobileStage({
  children,
  uprightOnPortrait = false,
}: {
  children: ReactNode;
  uprightOnPortrait?: boolean;
}) {
  const [enabled, setEnabled] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(false);
  const [passthrough, setPassthrough] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < MOBILE_BREAKPOINT;
      setEnabled(isMobile);
      if (isMobile) {
        const isPortrait = h > w;
        if (isPortrait && !uprightOnPortrait) {
          // Bühne um 90° drehen → Höhe wird zur "Breite" für die Skalierung.
          setRotate(true);
          setPassthrough(false);
          setScale(Math.min(h / STAGE_W, w / STAGE_H));
        } else if (isPortrait && uprightOnPortrait) {
          // Aufrecht im Hochformat (Konsole offen): Pass-Through-Modus.
          // Wir verzichten auf die fixe 1024×640-Bühne und lassen die
          // Konsolen-Overlays den echten Viewport voll ausfüllen
          // (mehr Platz für Text + Tastatur, größere Schrift mobil).
          setRotate(false);
          setPassthrough(true);
          setScale(1);
        } else {
          setRotate(false);
          setPassthrough(false);
          setScale(Math.min(w / STAGE_W, h / STAGE_H));
        }
      }
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [uprightOnPortrait]);

  if (!enabled) {
    // Desktop-Pfad: unverändert, kein Wrapper-Effekt.
    return <>{children}</>;
  }

  if (passthrough) {
    // Konsolen-Modus: kein Skalieren, kein Rotieren. Children erhalten den
    // vollen mobilen Viewport — die offenen Konsolen-Overlays (Terminal,
    // NodeTerminal) liegen ohnehin als `fixed`/`absolute inset-0`-Layer
    // darüber und nutzen den Platz dann komplett aus.
    return (
      <div
        data-mobile-passthrough="true"
        className="fixed inset-0 overflow-hidden bg-black"
        style={{ touchAction: "manipulation" }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black"
      style={{ touchAction: "manipulation" }}
    >
      <div
        ref={wrapRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) rotate(${rotate ? -90 : 0}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
