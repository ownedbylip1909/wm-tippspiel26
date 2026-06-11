# wm-tippspiel26

## Tippspiel-Dashboard (Spieltag 1)

Im Verzeichnis [`tippspiel/`](./tippspiel) liegt eine kleine React/Vite-App,
die die Tipps für den 1. Spieltag der WM 2026 (siehe
[`spieltag-1-tipps.md`](./spieltag-1-tipps.md)) als interaktives Dashboard
anzeigt. Eigene Tipps können pro Spiel eingetragen werden und werden lokal im
Browser gespeichert.

### Lokal starten

```bash
cd tippspiel
npm install
npm run dev
```

### Deployment

Ein GitHub-Actions-Workflow (`.github/workflows/deploy-pages.yml`) baut die
App bei jedem Push nach `main` und veröffentlicht sie über GitHub Pages.
Dafür muss in den Repo-Einstellungen unter **Settings → Pages** als Quelle
**GitHub Actions** ausgewählt sein. Die Seite ist danach unter
`https://<owner>.github.io/wm-tippspiel26/` erreichbar.

### Automatischer Ergebnis-Abruf

Der Workflow `.github/workflows/fetch-results.yml` ruft während des
1. Spieltags (11.–19. Juni) alle 30 Minuten die Endergebnisse von
[football-data.org](https://www.football-data.org/) ab und committet
beendete Spiele nach `tippspiel/src/data/results.json`. Dadurch erscheinen
Endergebnisse spätestens kurz nach Spielende automatisch im Dashboard
(markiert mit "🤖 automatisch erkannt").

Damit das funktioniert, wird ein kostenloser API-Key benötigt:

1. Auf [football-data.org](https://www.football-data.org/client/register)
   mit E-Mail-Adresse registrieren (kein Kreditkarte nötig, Free-Tier deckt
   die WM ab).
2. Den erhaltenen API-Token in den Repo-Einstellungen unter
   **Settings → Secrets and variables → Actions** als Secret
   `FOOTBALL_DATA_API_KEY` hinterlegen.
3. Optional kann der Workflow manuell über **Actions → Fetch
   Spieltag-1-Ergebnisse → Run workflow** angestoßen werden.