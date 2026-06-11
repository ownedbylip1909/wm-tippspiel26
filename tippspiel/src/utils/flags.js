// Wandelt einen ISO-3166-1-alpha-2-Code in das passende Flaggen-Emoji um.
// Sonderfälle (England, Schottland) nutzen die UK-Subdivision-Flag-Sequenzen.

const SPECIAL_FLAGS = {
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  SCT: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
}

export function flagEmoji(code) {
  if (SPECIAL_FLAGS[code]) return SPECIAL_FLAGS[code]

  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}
