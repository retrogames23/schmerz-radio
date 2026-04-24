import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";

/**
 * Teleempfänger — drei Kanäle in zermürbender Bürokraten-Sprache.
 *
 * Jeder Kanal hat ein eigenes Programm: eine sehr lange Sequenz aus
 * Meldungen, die in einer Endlos-Schleife abgespielt wird.
 */

interface Channel {
  id: "z1" | "z2" | "z3";
  name: string;
  tag: string;
  ticker: string;
  bulletins: string[];
  /** Sekunden pro Meldung */
  hold: number;
}

const CHANNELS: Channel[] = [
  {
    "id": "z1",
    "name": "ZDS · Sektorbericht",
    "tag": "Zentrale Direktion für Sektorale Lage",
    "ticker": "+++ Lagebild stabil +++ keine meldepflichtigen Abweichungen +++ Fortführung des Regelbetriebs in allen Quadranten bestätigt +++ Vorgangsnummern werden im Rahmen der etablierten Verfahren weiterverarbeitet +++ Empfehlung: Beibehaltung der gewohnten Tagesabläufe +++",
    "hold": 13,
    "bulletins": [
      "Sektor E67. Im Berichtszeitraum keine Vorkommnisse oberhalb der zur Vorlage geeigneten Schwelle. Vereinzelte Erfassungen werden im Rahmen der dafür vorgesehenen Verfahren einer geordneten Bewertung zugeführt.",
      "Quadrant E67-Süd. Die Versorgungslage entspricht in der Gesamtbetrachtung den Erwartungen, die aus den Erwartungen vergangener Berichtszeiträume hervorgegangen sind. Eine gesonderte Mitteilung erübrigt sich daher.",
      "Sektor E71. Die in Teilbereichen beobachtete erhöhte Eingangslage wird durch geeignete organisatorische Maßnahmen einer regulären Bearbeitung zugänglich gemacht. Eine Befassung der Öffentlichkeit ist zum gegenwärtigen Zeitpunkt nicht angezeigt.",
      "Sektor E71, Korridor 15. Hinweise auf eine über das übliche Maß hinausgehende Belegungsdichte einzelner Räumlichkeiten lassen sich aus der vorliegenden Datenlage nicht in einer der Veröffentlichung zugänglichen Form ableiten.",
      "Quadrant E71-Nord. Die Anwendung der Frequenzhygiene 104,6 wird ausdrücklich erinnert. Verstöße werden, soweit sie als Verstöße in Erscheinung treten, einer angemessenen Würdigung zugeführt.",
      "Sektor E73. Es liegen Hinweise auf Hinweise vor. Eine abschließende Einschätzung steht in Aussicht. Ein Zeitpunkt für diese Einschätzung kann derzeit nicht in einer abschließend belastbaren Weise benannt werden.",
      "Sektor E04. Die personelle Erreichbarkeit der zuständigen Stellen ist gewährleistet, soweit dies unter Berücksichtigung der jeweiligen Erreichbarkeitsfenster möglich erscheint.",
      "Sektor E12. Vereinzelte Rückmeldungen aus der Bevölkerung haben die zuständigen Stellen erreicht. Sie werden, sofern sie sich als rückmeldefähig erweisen, einer Rückmeldung zugeführt.",
      "Quadrant E12-West. Eine Häufung von Quarantänesiegeln im Erdgeschossbereich konnte nicht in einer für die Berichterstattung verwertbaren Weise verifiziert werden. Die Berichterstattung beschränkt sich daher auf den Hinweis, dass eine Verifizierung nicht erfolgt ist.",
      "Sektor E29. Die Lage ist, wie in den vorangegangenen Berichtszeiträumen, in einem nicht weiter zu spezifizierenden Maß als der Lage entsprechend zu beschreiben.",
      "Sektor E55. Hinsichtlich der dort registrierten Resonanzwerte ist auf die etablierten Auslegungsspielräume zu verweisen, die ein abschließendes Urteil ausdrücklich offenhalten.",
      "Sektor E58. Es ist davon abzusehen, aus singulären Beobachtungen einen sektoralen Trend abzuleiten. Trends bedürfen der vorherigen Feststellung durch die hierfür zuständige Stelle.",
      "Quadrant E61-Ost. Eine im Umlauf befindliche Darstellung über sogenannte „leere Etagen“ entbehrt der durch die Datenlage gedeckten Grundlage und wird hiermit als nicht durch die Datenlage gedeckt eingeordnet.",
      "Sektor E66. Im Berichtszeitraum wurden Anfragen zur Lage entgegengenommen. Sie wurden im Rahmen der hierfür vorgesehenen Verfahren entgegengenommen.",
      "Sektor E70. Die in einzelnen Häusern beobachtete reduzierte Wohnaktivität bewegt sich in einem Bereich, der aus statistischer Sicht keiner über das Statistische hinausgehenden Bewertung bedarf.",
      "Sektor E71. Aufgrund der besonderen medizinischen Funktion des Sektors gelten dort die einschlägigen Regelungen, die jeweils in der jeweils gültigen Fassung gelten.",
      "Sektor E84. Hinweise auf eine erhöhte Aufmerksamkeit für die Frequenz 104,6 werden zur Kenntnis genommen und in den allgemeinen Erkenntnisfluss überführt.",
      "Sektor E91. Die zuständige Stelle hat die Zuständigkeit der zuständigen Stelle bestätigt. Eine darüber hinausgehende Befassung ist nicht vorgesehen.",
      "Sektor E96. In Bezug auf den dort gemeldeten Sachverhalt wird auf die Möglichkeit hingewiesen, dass sich der Sachverhalt nach abschließender Prüfung als ein anderer Sachverhalt darstellen kann.",
      "Allgemeiner Hinweis. Die Bewohnerinnen und Bewohner aller Sektoren werden gebeten, ihre Meldepflichten in der gewohnten Sorgfalt wahrzunehmen. Meldungen, die nicht erfolgen, gelten als nicht erfolgt.",
      "Schlussvermerk. Die nächste Lagedarstellung erfolgt im Anschluss an die vorliegende Lagedarstellung. Eine darüber hinausgehende Vorankündigung ist nicht erforderlich."
    ]
  },
  {
    "id": "z2",
    "name": "BV-Aktuell",
    "tag": "Bürger-Verlautbarung — Programm 2",
    "ticker": "+++ Bekanntmachung +++ Anpassung der Sprechzeiten in den nicht öffentlich zugänglichen Bereichen +++ Hinweise zur Frequenzhygiene 104,6 sind unverändert gültig +++ Antragsformular B-3a in der Fassung vom Vortag weiterhin anwendbar +++ Bei Rückfragen gilt die Auskunftslage des Vortages +++",
    "hold": 13,
    "bulletins": [
      "Bekanntmachung der zuständigen Verlautbarungsstelle. Die nachfolgenden Inhalte ersetzen frühere Bekanntmachungen nur insoweit, als frühere Bekanntmachungen erkennbar ersetzt werden sollen.",
      "Antragsformular B-3a. Die Verwendung der Fassung vom Vortag bleibt zulässig, solange keine aktuellere Fassung in einer dem Antragsteller zumutbaren Weise zur Kenntnis gelangt ist.",
      "Antragsformular B-3a, Hinweis 2. Eine Antragstellung ohne vorherige Antragstellung wird ausdrücklich nicht empfohlen. Die hierfür vorgesehenen Vorverfahren sind in der gewohnten Reihenfolge zu durchlaufen.",
      "Sprechzeiten. Die Sprechzeiten der nicht öffentlich zugänglichen Bereiche werden, soweit erforderlich, angepasst. Eine Veröffentlichung der angepassten Sprechzeiten erfolgt nach Maßgabe der jeweiligen Erfordernisse.",
      "Hinweis zur Erreichbarkeit. Die telefonische Erreichbarkeit der Leitstelle ist innerhalb der hierfür vorgesehenen Erreichbarkeitsfenster erreichbar. Außerhalb dieser Fenster ist die Erreichbarkeit nicht gewährleistet.",
      "Hinweis zur Erreichbarkeit, Ergänzung. Bei nicht zustande gekommener Verbindung wird empfohlen, die Verbindung zu einem späteren Zeitpunkt erneut herzustellen, sofern eine Herstellung möglich erscheint.",
      "Frequenzhygiene 104,6. Die Bewohnerinnen und Bewohner werden daran erinnert, dass die Frequenz 104,6 in näher zu bezeichnenden Sektoren einer besonderen Behandlung unterliegt. Einzelheiten ergeben sich aus den einschlägigen Regelungen.",
      "Frequenzhygiene 104,6, Ergänzung. Eine Verwendung des Schmerz-Radios in einer der Verwendung nicht zuträglichen Weise wird ausdrücklich nicht empfohlen.",
      "Hausmeisterdienste. Die Bereitschaft der Hausmeisterdienste richtet sich nach den jeweils gültigen Bereitschaftsplänen. Diese sind bei der zuständigen Stelle zur Einsichtnahme hinterlegt, soweit eine Hinterlegung erfolgt ist.",
      "Wartungsfenster. Die im Umlauf befindlichen Wartungsfenster gelten in der jeweils festgelegten Reihenfolge. Eine Festlegung der Reihenfolge erfolgt durch die für die Festlegung zuständige Stelle.",
      "Zugangskontrollen. Zugangskontrollen werden, sofern sie als Zugangskontrollen vorgesehen sind, in der vorgesehenen Form durchgeführt. Eine darüber hinausgehende Erläuterung ist nicht vorgesehen.",
      "Mitteilung an Antragstellende. Anträge, deren Bearbeitung sich verzögert, werden bei der Bearbeitung berücksichtigt, sobald sie zur Bearbeitung vorgesehen sind.",
      "Mitteilung an Antragstellende, Fortsetzung. Eine zwischenzeitliche Sachstandsanfrage ist möglich. Die Beantwortung erfolgt im Rahmen der Möglichkeiten der bearbeitenden Stelle.",
      "Hinweis Quarantäne-Siegel. Türen, die mit einem Siegel der Kategorie „Resonanz-Überlastung“ versehen sind, sind nicht zu öffnen, nicht zu beklopfen und nicht in einer der Aufmerksamkeit zugänglichen Weise zu kommentieren.",
      "Hinweis Quarantäne-Siegel, Ergänzung. Eine Beschwerde gegen die Anbringung eines solchen Siegels ist im hierfür vorgesehenen Beschwerdeweg vorzusehen, sofern ein Beschwerdeweg vorgesehen ist.",
      "Hinweis zur Berichterstattung. Berichte über das Vorhandensein nicht erteilter Auskünfte sind nicht erteilte Auskünfte und werden als solche behandelt.",
      "Mitteilung Schichtdienst. Die Schichtpläne der Leitstelle gelten in der bekannten Reihenfolge. Abweichungen von der bekannten Reihenfolge gelten erst nach Bekanntgabe der Abweichungen.",
      "Mitteilung Empfangsbereich. In Empfangsbereichen ist auf eine ruhige und an die jeweilige Empfangssituation angepasste Sprechweise zu achten. Lautes Sprechen kann zu einer Anpassung der Sprechweise führen.",
      "Mitteilung Wartebereich. Wartezeiten gelten als Wartezeiten und werden nicht gesondert ausgewiesen.",
      "Schlussbemerkung. Diese Verlautbarung wiederholt sich, solange eine Wiederholung als angezeigt erscheint. Über das Vorliegen eines Anlasses zur Nicht-Wiederholung wird gegebenenfalls gesondert informiert."
    ]
  },
  {
    "id": "z3",
    "name": "Wetter & Resonanz",
    "tag": "Sektorale Wetter- und Resonanzlage",
    "ticker": "+++ Resonanzindex im Mittel +++ keine sektorenübergreifenden Auffälligkeiten +++ punktuelle Erhöhungen werden im Rahmen der dafür vorgesehenen Glättung berücksichtigt +++ Empfehlung: Innenräume bevorzugen, Frequenzhygiene 104,6 beachten +++",
    "hold": 12,
    "bulletins": [
      "Sektorenübergreifend. Die Resonanzlage bewegt sich innerhalb der Bandbreite, die als die der Resonanzlage entsprechende Bandbreite anerkannt ist.",
      "Sektor E67. Resonanzindex: im Erwartungsbereich. Eine Häufung von Hörmeldungen wurde nicht in einer der Veröffentlichung zugänglichen Form festgestellt.",
      "Sektor E71. Resonanzindex: erhöht, jedoch nicht erhöht im Sinne der für eine Erhöhung vorgesehenen Schwellen. Eine Veröffentlichung erfolgt daher nicht.",
      "Sektor E73. Resonanzindex: nicht abschließend bestimmbar. Es wird empfohlen, vorerst von einem als nicht abschließend bestimmbar gekennzeichneten Wert auszugehen.",
      "Wetter Quadrant E67-Süd. Bewölkung wechselnd, mit Phasen, in denen die Bewölkung nicht wechselt. Niederschlag möglich, soweit Niederschlag möglich ist.",
      "Wetter Quadrant E71-Nord. Sicht eingeschränkt durch Hochnebel. Eine Aufhellung wird in Aussicht gestellt, sobald eine Aufhellung in Aussicht zu stellen ist.",
      "Wetter Quadrant E12-West. Wind aus wechselnden Richtungen. Die Richtungen unterliegen der jeweils vorherrschenden Großwetterlage.",
      "Hinweis zur Frequenzhygiene. In den Sektoren mit erhöhter sensorischer Sensibilität wird ausdrücklich daran erinnert, die Frequenz 104,6 ausschließlich in der dafür vorgesehenen Weise zu verwenden.",
      "Hinweis zu Hörphänomenen. Vereinzelt gemeldete Hörphänomene können nicht ausgeschlossen werden. Sie können jedoch auch nicht als bestätigt gelten.",
      "Hinweis zu Hörphänomenen, Ergänzung. Eine Mitteilung an die zuständige Stelle ist möglich. Eine Bestätigung des Eingangs erfolgt, sofern eine Bestätigung erfolgt.",
      "Sektor E55. Im Tagesverlauf wurden vereinzelt Resonanzspitzen registriert. Eine Einordnung als Spitzen erfolgt erst nach abschließender Einordnung.",
      "Sektor E58. Resonanzlage: ruhig. Eine ruhige Resonanzlage ist als ruhige Resonanzlage zu beschreiben.",
      "Sektor E61. Es liegen einzelne Meldungen über sogenanntes „inneres Mitschwingen“ vor. Diese Meldungen werden zur Kenntnis genommen, sofern sie als zur Kenntnis zu nehmende Meldungen vorliegen.",
      "Sektor E66. Resonanzlage stabil. Eine Stabilität der Resonanzlage gilt nur insoweit, als die Stabilität nicht erkennbar instabil wird.",
      "Sektor E70. Frühnebel im Erdgeschossbereich. Mit zunehmender Tageshöhe ist mit zunehmender Tageshöhe zu rechnen.",
      "Sektor E71, Korridor 15. Eine ergänzende Resonanzbeobachtung ist nicht vorgesehen, da eine Beobachtung in dem dafür nicht vorgesehenen Bereich nicht vorgesehen ist.",
      "Sektor E84. Resonanzwerte unauffällig, mit Ausnahme der Auffälligkeiten, die für diesen Sektor als unauffällige Auffälligkeiten anerkannt sind.",
      "Allgemeiner Hinweis. Bewohnerinnen und Bewohner werden gebeten, bei subjektiven Veränderungen der eigenen Resonanzempfindung den Aufenthalt in Innenräumen zu bevorzugen.",
      "Allgemeiner Hinweis, Ergänzung. Eine Selbstbeobachtung ersetzt die Beobachtung durch die hierfür zuständige Stelle nicht.",
      "Aussicht. Im weiteren Tagesverlauf ist mit einer Fortsetzung des bisherigen Tagesverlaufs zu rechnen.",
      "Schlussbemerkung. Die nächste Wetter- und Resonanzlage wird im Anschluss an die vorliegende Wetter- und Resonanzlage ausgestrahlt."
    ]
  }
];

export function Television() {
  const { tvOpen, closeTelevision } = useGame();
  const [channelIdx, setChannelIdx] = useState(0);
  // Cursor pro Kanal — bleibt erhalten, wenn der Spieler umschaltet.
  const cursorsRef = useRef<number[]>(CHANNELS.map(() => 0));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!tvOpen) {
      cursorsRef.current = CHANNELS.map(() => 0);
      setChannelIdx(0);
      setTick(0);
    }
  }, [tvOpen]);

  const channel = CHANNELS[channelIdx];

  useEffect(() => {
    if (!tvOpen) return;
    const id = window.setInterval(() => {
      cursorsRef.current[channelIdx] =
        (cursorsRef.current[channelIdx] + 1) % channel.bulletins.length;
      setTick((t) => t + 1);
    }, channel.hold * 1000);
    return () => window.clearInterval(id);
  }, [tvOpen, channelIdx, channel.bulletins.length, channel.hold]);

  const bulletinIdx = cursorsRef.current[channelIdx];
  const bulletin = channel.bulletins[bulletinIdx];

  const time = useMemo(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  if (!tvOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 px-4 py-6">
      <div className="relative flex h-full max-h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-sm border border-amber-glow/40 bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <CloseButton
          onClick={closeTelevision}
          label="Aus"
          className="absolute right-3 top-3 z-20"
        />

        <div className="relative flex flex-1 flex-col overflow-hidden bg-[oklch(0.16_0.02_120)] scanlines">
          <div className="flex items-start justify-between px-5 pt-5">
            <div>
              <div className="font-mono-crt text-2xl text-amber-glow amber-glow">
                {channel.name}
              </div>
              <div className="mt-1 font-display text-xs uppercase tracking-widest text-muted-foreground">
                {channel.tag}
              </div>
            </div>
            <div className="text-right font-mono-crt text-amber-glow/80">
              <div className="text-lg leading-none">{time}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Live · Sektorfunk
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-8 py-6">
            <p
              key={`${channelIdx}-${bulletinIdx}`}
              className="fade-in max-w-2xl text-center font-display text-base leading-relaxed text-foreground text-shadow-hard sm:text-lg"
            >
              {bulletin}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-amber-glow/20 px-5 py-2 font-mono-crt text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>
              Meldung {bulletinIdx + 1} / {channel.bulletins.length}
            </span>
            <span className="text-amber-glow/70">▌Programm läuft</span>
          </div>

          <div className="overflow-hidden border-t border-amber-glow/30 bg-black/60 py-1">
            <div className="tv-ticker whitespace-nowrap font-mono-crt text-sm text-amber-glow amber-glow">
              {channel.ticker}
              <span className="px-8">·</span>
              {channel.ticker}
            </div>
          </div>
        </div>

        <div className="flex items-stretch gap-px bg-amber-glow/20 p-px">
          {CHANNELS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChannelIdx(i)}
              className={`flex-1 px-3 py-2 text-left font-mono-crt text-xs uppercase tracking-widest transition-colors ${
                i === channelIdx
                  ? "bg-amber-glow/20 text-amber-glow amber-glow"
                  : "bg-black text-muted-foreground hover:bg-amber-glow/10 hover:text-amber-glow"
              }`}
              aria-pressed={i === channelIdx}
            >
              <span className="mr-2 opacity-60">K{i + 1}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
