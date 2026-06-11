import { useEffect, useMemo, useState } from 'react'
import { matches } from './data/matches'
import { flagEmoji } from './utils/flags'
import { calcPoints, POINT_LABELS } from './utils/scoring'
import './App.css'

const TIPS_STORAGE_KEY = 'wm2026-spieltag1-tipps'
const RESULTS_STORAGE_KEY = 'wm2026-spieltag1-ergebnisse'

const EMPTY_SCORE = { tip1: '', tip2: '' }

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
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

function ScoreRow({ label, score1, score2, editable, onChange1, onChange2, points, ariaTeam1, ariaTeam2 }) {
  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <div className="score-cell">
        {editable ? (
          <>
            <input
              type="number"
              min="0"
              max="20"
              value={score1}
              onChange={onChange1}
              aria-label={ariaTeam1}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="20"
              value={score2}
              onChange={onChange2}
              aria-label={ariaTeam2}
            />
          </>
        ) : (
          <span className="score-static">{score1}:{score2}</span>
        )}
      </div>
      {points !== null && points !== undefined ? (
        <span className={`points-badge points-${points}`}>
          {points} Pkt · {POINT_LABELS[points]}
        </span>
      ) : (
        <span className="points-badge points-empty" />
      )}
    </div>
  )
}

function App() {
  const [tips, setTips] = useState(() => {
    const stored = loadFromStorage(TIPS_STORAGE_KEY)
    return { ...suggestionsAsTips(), ...stored }
  })
  const [results, setResults] = useState(() => loadFromStorage(RESULTS_STORAGE_KEY))

  useEffect(() => {
    localStorage.setItem(TIPS_STORAGE_KEY, JSON.stringify(tips))
  }, [tips])

  useEffect(() => {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results))
  }, [results])

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

  function updateResult(id, field, rawValue) {
    const value = rawValue === '' ? '' : Math.max(0, Math.min(20, Number(rawValue)))
    setResults((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY_SCORE), [field]: value },
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

  function clearAllTips() {
    setTips(Object.fromEntries(matches.map((m) => [m.id, { ...EMPTY_SCORE }])))
  }

  function clearResult(id) {
    setResults((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function clearAllResults() {
    setResults({})
  }

  const filledCount = matches.filter((m) => {
    const t = tips[m.id]
    return t && t.tip1 !== '' && t.tip2 !== ''
  }).length

  const { claudeTotal, userTotal, finishedCount } = useMemo(() => {
    let claudeTotal = 0
    let userTotal = 0
    let finishedCount = 0
    for (const match of matches) {
      const result = results[match.id] ?? EMPTY_SCORE
      const tip = tips[match.id] ?? EMPTY_SCORE
      const cp = calcPoints(match.tip1, match.tip2, result.tip1, result.tip2)
      if (cp === null) continue
      const up = calcPoints(tip.tip1, tip.tip2, result.tip1, result.tip2)
      claudeTotal += cp
      userTotal += up ?? 0
      finishedCount += 1
    }
    return { claudeTotal, userTotal, finishedCount }
  }, [tips, results])

  return (
    <div className="app">
      <header className="header">
        <h1>WM 2026 – Tippspiel: 1. Spieltag</h1>
        <p className="subtitle">
          Vorgeschlagene Tipps basieren auf FIFA-Ranking &amp; Form der letzten 5
          Länderspiele. Trag deine eigenen Tipps und nach Spielende die
          Endergebnisse ein – alles wird automatisch lokal in deinem Browser
          gespeichert.
        </p>
        <div className="actions">
          <button onClick={applyAllSuggestions}>Alle Claude-Tipps übernehmen</button>
          <button className="secondary" onClick={clearAllTips}>Alle Tipps leeren</button>
          <button className="secondary" onClick={clearAllResults}>Alle Ergebnisse zurücksetzen</button>
          <span className="progress">{filledCount} / {matches.length} Tipps abgegeben</span>
        </div>

        {finishedCount > 0 && (
          <div className="summary-bar">
            <span>{finishedCount} / {matches.length} Spiele ausgewertet</span>
            <span className="summary-score">Claude: <strong>{claudeTotal}</strong> Punkte</span>
            <span className="summary-score">Du: <strong>{userTotal}</strong> Punkte</span>
            <span className="summary-lead">
              {userTotal > claudeTotal && '🏆 Du führst!'}
              {userTotal < claudeTotal && '🤖 Claude führt!'}
              {userTotal === claudeTotal && '🤝 Unentschieden!'}
            </span>
          </div>
        )}
      </header>

      <main>
        {grouped.map(([date, dateMatches]) => (
          <section key={date} className="date-section">
            <h2>{date}</h2>
            <div className="match-grid">
              {dateMatches.map((match) => {
                const tip = tips[match.id] ?? EMPTY_SCORE
                const result = results[match.id] ?? EMPTY_SCORE
                const isFinished = result.tip1 !== '' && result.tip2 !== ''
                const claudePoints = calcPoints(match.tip1, match.tip2, result.tip1, result.tip2)
                const userPoints = calcPoints(tip.tip1, tip.tip2, result.tip1, result.tip2)

                return (
                  <article key={match.id} className={`match-card ${isFinished ? 'finished' : ''}`}>
                    <div className="match-header">
                      <span className="group-badge">Gruppe {match.group}</span>
                      <span className="status-badge">{isFinished ? 'Beendet' : 'Bevorstehend'}</span>
                      <span className={`tendenz tendenz-${match.tendenz}`}>{match.tendenz}</span>
                    </div>
                    <div className="teams">
                      <div className="team">
                        <span className="flag">{flagEmoji(match.code1)}</span>
                        <span className="team-name">{match.team1}</span>
                      </div>
                      <span className="vs">–</span>
                      <div className="team team-right">
                        <span className="team-name">{match.team2}</span>
                        <span className="flag">{flagEmoji(match.code2)}</span>
                      </div>
                    </div>

                    <div className="score-table">
                      <ScoreRow
                        label="Tipp Claude"
                        score1={match.tip1}
                        score2={match.tip2}
                        points={claudePoints}
                      />
                      <ScoreRow
                        label="Dein Tipp"
                        score1={tip.tip1}
                        score2={tip.tip2}
                        editable
                        onChange1={(e) => updateTip(match.id, 'tip1', e.target.value)}
                        onChange2={(e) => updateTip(match.id, 'tip2', e.target.value)}
                        points={userPoints}
                        ariaTeam1={`Dein Tipp Tore ${match.team1}`}
                        ariaTeam2={`Dein Tipp Tore ${match.team2}`}
                      />
                      <ScoreRow
                        label="Ergebnis"
                        score1={result.tip1}
                        score2={result.tip2}
                        editable
                        onChange1={(e) => updateResult(match.id, 'tip1', e.target.value)}
                        onChange2={(e) => updateResult(match.id, 'tip2', e.target.value)}
                        ariaTeam1={`Endergebnis Tore ${match.team1}`}
                        ariaTeam2={`Endergebnis Tore ${match.team2}`}
                      />
                    </div>

                    <p className="reasoning">{match.reasoning}</p>
                    <div className="suggestion-row">
                      <button className="link" onClick={() => applySuggestion(match.id)}>
                        Claude-Tipp übernehmen
                      </button>
                      {isFinished && (
                        <button className="link" onClick={() => clearResult(match.id)}>
                          Ergebnis zurücksetzen
                        </button>
                      )}
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
          Repository. Punkteschema: 4 = exaktes Ergebnis, 3 = Tordifferenz,
          2 = richtige Tendenz, 0 = daneben.
        </p>
      </footer>
    </div>
  )
}

export default App
