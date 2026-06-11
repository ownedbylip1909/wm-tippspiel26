// Holt Endergebnisse für den 1. Spieltag der WM 2026 von football-data.org
// und schreibt sie nach src/data/results.json. Wird per GitHub Action
// regelmäßig ausgeführt (siehe .github/workflows/fetch-results.yml).

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matches } from '../src/data/matches.js'
import { teamAliases } from './teamAliases.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RESULTS_PATH = path.join(__dirname, '../src/data/results.json')

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
if (!API_KEY) {
  console.error('FOOTBALL_DATA_API_KEY ist nicht gesetzt.')
  process.exit(1)
}

const DATE_FROM = '2026-06-11'
const DATE_TO = '2026-06-19'

function normalize(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// Normalisierter Alias -> unser deutscher Teamname
const aliasLookup = new Map()
for (const [germanName, aliases] of Object.entries(teamAliases)) {
  aliasLookup.set(normalize(germanName), germanName)
  for (const alias of aliases) {
    aliasLookup.set(normalize(alias), germanName)
  }
}

function toGermanName(apiName) {
  return aliasLookup.get(normalize(apiName))
}

async function fetchFinishedMatches() {
  const url = `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${DATE_FROM}&dateTo=${DATE_TO}`
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': API_KEY },
  })
  if (!res.ok) {
    throw new Error(`football-data.org Anfrage fehlgeschlagen: ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  return (data.matches ?? []).filter((m) => m.status === 'FINISHED')
}

async function loadExistingResults() {
  try {
    const raw = await readFile(RESULTS_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function findMatch(germanHome, germanAway) {
  for (const match of matches) {
    if (match.team1 === germanHome && match.team2 === germanAway) {
      return { match, swapped: false }
    }
    if (match.team1 === germanAway && match.team2 === germanHome) {
      return { match, swapped: true }
    }
  }
  return null
}

async function main() {
  const finished = await fetchFinishedMatches()
  const results = await loadExistingResults()
  let changed = false

  for (const apiMatch of finished) {
    const germanHome = toGermanName(apiMatch.homeTeam?.name ?? '')
    const germanAway = toGermanName(apiMatch.awayTeam?.name ?? '')
    if (!germanHome || !germanAway) {
      console.warn(`Kein Alias gefunden für "${apiMatch.homeTeam?.name}" vs "${apiMatch.awayTeam?.name}"`)
      continue
    }

    const found = findMatch(germanHome, germanAway)
    if (!found) {
      console.warn(`Kein Spiel im Plan für "${germanHome}" vs "${germanAway}"`)
      continue
    }

    const { match, swapped } = found
    const homeScore = apiMatch.score?.fullTime?.home
    const awayScore = apiMatch.score?.fullTime?.away
    if (homeScore === null || awayScore === null || homeScore === undefined || awayScore === undefined) {
      continue
    }

    const tip1 = swapped ? awayScore : homeScore
    const tip2 = swapped ? homeScore : awayScore

    const existing = results[match.id]
    if (!existing || existing.tip1 !== tip1 || existing.tip2 !== tip2) {
      results[match.id] = { tip1, tip2 }
      changed = true
      console.log(`${match.team1} ${tip1}:${tip2} ${match.team2} (${match.id})`)
    }
  }

  if (changed) {
    await writeFile(RESULTS_PATH, `${JSON.stringify(results, null, 2)}\n`)
    console.log('results.json aktualisiert.')
  } else {
    console.log('Keine neuen Ergebnisse.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
