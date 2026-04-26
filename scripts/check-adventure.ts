import { DSA_CAMPAIGN, meetsRequirement } from "../src/game/dsa/adventure";
import { DSA_CLASSES } from "../src/game/dsa/classes";

const issues: string[] = [];
for (const act of DSA_CAMPAIGN) {
  for (const beat of act.beats) {
    for (const cls of DSA_CLASSES) {
      const visible = beat.options.filter((o) =>
        meetsRequirement(cls.id, cls.magic, o.requires),
      );
      if (visible.length === 0) {
        issues.push(`DEAD END: ${beat.id} / ${cls.id} (magic=${cls.magic}) → 0 Optionen`);
      } else if (visible.length === 1 && beat.options.length > 1) {
        issues.push(`THIN: ${beat.id} / ${cls.id} → nur 1 Option (von ${beat.options.length})`);
      }
    }
  }
}
console.log(issues.length === 0 ? "✓ Keine Dead Ends." : issues.join("\n"));
console.log("\n— Übersicht (sichtbare Optionen pro Klasse pro Beat) —");
for (const act of DSA_CAMPAIGN) {
  for (const beat of act.beats) {
    const counts = DSA_CLASSES.map((cls) => {
      const n = beat.options.filter((o) => meetsRequirement(cls.id, cls.magic, o.requires)).length;
      return `${cls.id.padEnd(9)}=${n}`;
    });
    console.log(`${beat.id} (${beat.options.length} total)\n  ${counts.join("  ")}`);
  }
}
