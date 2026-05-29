## Befund

Es gibt im `phoneApt`-Hotspot (`src/game/scenes/apartmentAct1.ts`, Zeilen 100–147) einen Fallback-Zweig, der genau dein beobachtetes Symptom erklärt:

```text
sentForgedQuittung  &&  !receivedTillaTransfer
  → setFlag("receivedTillaTransfer")
  → addItem("tillaTransfer")
  → setFlag("calledForCode")     ← Code-Mail erscheint
  → startDialog("insa2")
```

Dieser Zweig setzt **nicht** `insaGaveTransferTask`. Genau dieses Flag ist aber Voraussetzung für Kowalks `kInsa1`-Choice in der Kantine (`src/game/dialogs/cafeteria.ts`). Ohne `kInsa1` läuft die Kette `kInsa6c → knowsVossbeckPath` nie an — und ohne `knowsVossbeckPath` sind sowohl die Brust-Trainingsfälle als auch Vossbecks Hinterzimmer (3603) tot. Der einzige Reserveweg wäre `gotB3Authorization` über Philippe.

Genauer Hergang, der zu deinem Spielstand passt:
1. Du gehst den Bodo-/Quittungs-Pfad statt Insa zweimal anzurufen.
2. Die gefälschte Quittung wandert ins Rohr → `sentForgedQuittung` gesetzt.
3. Beim nächsten Telefonat schlägt der obige Fallback an, gibt dir Transferbogen + Code-Mail in einem Rutsch.
4. `insaGaveTransferTask` wurde nie gesetzt → Kantinen-Quest (Kowalk → Brust → Vossbeck) bleibt komplett unerreichbar.

## Fix

In `src/game/scenes/apartmentAct1.ts`, im Fallback-Zweig (~Zeile 120–131), vor dem `setFlag("calledForCode")` zusätzlich `api.setFlag("insaGaveTransferTask")` setzen. Damit bleibt Kowalks `kInsa1` immer erreichbar, egal über welchen Weg `receivedTillaTransfer` gesetzt wurde.

## Bonus (optional, in selber Änderung)

UX-Stolperstein in der Mail 003 (`src/components/game/Terminal.tsx`, Zeilen 998–1004): Der Text sagt „Sie kennen das Datum" und nennt es nicht. Wer das Telefonat länger her hat, steht am Keypad und rät. Vorschlag: Eine dezente Zeile ergänzen, die das Datum nicht direkt nennt, aber klarer auf den Transferbogen verweist (z. B. „Das Datum steht auf dem Bogen, den Sie heute erhalten haben."). So bleibt das Rätsel intakt, aber der Lookup ist eindeutig.

## Was ich NICHT anfasse

- Die Hauptpfade (`insa2`, `insaDispatch`) setzen `insaGaveTransferTask` bereits korrekt — kein Eingriff.
- Keine Änderung an Keypad-Logik, Codes oder Vossbeck-Gates.

## Verifikation

- Quick-Check via Dev-Playback: Forged-Quittung-Pfad → Telefonat → in Kantine prüfen, dass Kowalks `kInsa1` und danach Brust-Trainingschoice erscheinen.
- Standardpfad (Insa zweimal anrufen) muss unverändert funktionieren — der neue Flag-Set ist additiv und idempotent.