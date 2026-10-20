// Info-Datei auf der Workbench-Diskette: Speicheraufbau des Amiga,
// streng aus der Welt heraus erzählt (Reine Harvard-Bauweise ist Normalfall).
export const SPEICHER_TXT = `SPEICHER.TXT — Wie Ihr Amiga denkt
Beiblatt zur Workbench 3.0, Kapitel 2

Ihr Amiga besitzt, wie jede ordentliche Rechenmaschine,
zwei voneinander getrennte Speicher:

  BEFEHLSSPEICHER   enthaelt die Programme.
                    Er wird nur beim Laden beschrieben,
                    danach ausschliesslich gelesen.

  DATENSPEICHER     enthaelt alles, womit die Programme
                    arbeiten: Texte, Bilder, Klaenge.
                    Was hier liegt, wird niemals ausgefuehrt.

Der Datenspeicher teilt sich in CHIP-Speicher, auf den
Agnus, Denise und Paula selbststaendig zugreifen, und
FAST-Speicher fuer die Arbeitsdaten des Hauptknotens.

Beim Start eines Programms liest LoadSeg() die Datei Stueck
fuer Stueck. Abschnitte vom Typ CODE wandern ueber den
Ladekanal in den Befehlsspeicher, Abschnitte vom Typ DATA
und BSS in den Datenspeicher. Ein anderer Weg in den
Befehlsspeicher existiert nicht.

Was das fuer Sie bedeutet:

 * Ein fehlerhaftes Programm kann seine eigenen Daten
   verderben, aber keine fremden Befehle erzeugen.
   Der Guru meldet sich, das System bleibt sauber.

 * Eine Diskette voller Daten bleibt eine Diskette voller
   Daten. Sie kann sich nicht selbst zum Programm machen.

 * Selbstentpackende Programme gibt es nicht. Gepackte
   Programme entpackt der Lader, bevor er sie einspielt.

 * Der Copper hat seinen eigenen kleinen Befehlsspeicher
   (die Copperliste). Er arbeitet zeilengenau neben dem
   Hauptknoten her und stoert ihn dabei nicht.

Faustregel des Handbuchs:
  Befehle sind Befehle. Daten sind Daten.
  Wer beides auseinanderhaelt, hat selten Aerger.
`;
