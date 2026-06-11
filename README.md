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