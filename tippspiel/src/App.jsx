import { useEffect, useMemo, useState } from 'react'
import { matches } from './data/matches'
import { flagEmoji } from './utils/flags'
import './App.css'

const STORAGE_KEY = 'wm2026-spieltag1-tipps'

function loadStoredTips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function suggestionsAsTips() {
  return Object.fromEntries(
    matches.map((m) => [m.id, { tip1: m.tip1, tip2: m.tip2 }]),
  )
}

function App() {
  const [tips, setTips] = useState(() => {
    const stored = loadStoredTips()
    return { ...suggestionsAsTips(), ...stored }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tips))
  }, [tips])

  const grouped = useMemo(() => {
    const byDate = new Map()
    for (const match of matches) {
      if (!byDate.has(match.date)) byDate.set(match.date, [])
      byDate.get(match.date).push(match)
    }
    return [...byDate.entries()]
  }, [])

  function updateTip(id, field, rawValue) {
    const value = rawValue === '' ? '' : Math.max(0, Math.min(20, Number(rawValue)))
    setTips((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  function applySuggestion(id) {
    const match = matches.find((m) => m.id === id)
    setTips((prev) => ({
      ...prev,
      [id]: { tip1: match.tip1, tip2: match.tip2 },
    }))
  }

  function applyAllSuggestions() {
    setTips(suggestionsAsTips())
  }

  function clearAll() {
    setTips(
      Object.fromEntries(matches.map((m) => [m.id, { tip1: '', tip2: '' }])),
    )
  }

  const filledCount = matches.filter((m) => {
    const t = tips[m.id]
    return t && t.tip1 !== '' && t.tip2 !== ''
  }).length

  return (
    <div className="app">
      <header className="header">
        <h1>WM 2026 – Tippspiel: 1. Spieltag</h1>
        <p className="subtitle">
          Vorgeschlagene Tipps basieren auf FIFA-Ranking &amp; Form der letzten 5
          Länderspiele. Trag deine eigenen Tipps ein – sie werden automatisch
          lokal in deinem Browser gespeichert.
        </p>
        <div className="actions">
          <button onClick={applyAllSuggestions}>Alle Vorschläge übernehmen</button>
          <button className="secondary" onClick={clearAll}>Alle Tipps leeren</button>
          <span className="progress">{filledCount} / {matches.length} Tipps abgegeben</span>
        </div>
      </header>

      <main>
        {grouped.map(([date, dateMatches]) => (
          <section key={date} className="date-section">
            <h2>{date}</h2>
            <div className="match-grid">
              {dateMatches.map((match) => {
                const tip = tips[match.id] ?? { tip1: '', tip2: '' }
                const suggestionLabel = `${match.tip1}:${match.tip2}`
                return (
                  <article key={match.id} className="match-card">
                    <div className="match-header">
                      <span className="group-badge">Gruppe {match.group}</span>
                      <span className={`tendenz tendenz-${match.tendenz}`}>{match.tendenz}</span>
                    </div>
                    <div className="teams">
                      <div className="team">
                        <span className="flag">{flagEmoji(match.code1)}</span>
                        <span className="team-name">{match.team1}</span>
                      </div>
                      <div className="tip-input">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={tip.tip1}
                          onChange={(e) => updateTip(match.id, 'tip1', e.target.value)}
                          aria-label={`Tipp Tore ${match.team1}`}
                        />
                        <span className="colon">:</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={tip.tip2}
                          onChange={(e) => updateTip(match.id, 'tip2', e.target.value)}
                          aria-label={`Tipp Tore ${match.team2}`}
                        />
                      </div>
                      <div className="team team-right">
                        <span className="team-name">{match.team2}</span>
                        <span className="flag">{flagEmoji(match.code2)}</span>
                      </div>
                    </div>
                    <p className="reasoning">{match.reasoning}</p>
                    <div className="suggestion-row">
                      <span>Vorschlag: {suggestionLabel}</span>
                      <button className="link" onClick={() => applySuggestion(match.id)}>
                        übernehmen
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </main>

      <footer>
        <p>
          Tipps &amp; Begründungen siehe <code>spieltag-1-tipps.md</code> im
          Repository.
        </p>
      </footer>
    </div>
  )
}

export default App
