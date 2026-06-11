// Punkteschema für den Tipp-Vergleich (gängiges 4-3-2-0-Schema):
// 4 Punkte = Ergebnis exakt getroffen
// 3 Punkte = Tordifferenz korrekt (z.B. 2:1 getippt, 3:2 ist Ergebnis)
// 2 Punkte = nur die Tendenz korrekt (Sieg/Unentschieden/Niederlage)
// 0 Punkte = komplett daneben

export const POINT_LABELS = {
  4: 'Exakt',
  3: 'Tordifferenz',
  2: 'Tendenz',
  0: 'Falsch',
}

export function calcPoints(tip1, tip2, result1, result2) {
  if (tip1 === '' || tip2 === '' || result1 === '' || result2 === '') return null

  if (tip1 === result1 && tip2 === result2) return 4

  const tipDiff = tip1 - tip2
  const resultDiff = result1 - result2
  if (tipDiff === resultDiff) return 3

  if (Math.sign(tipDiff) === Math.sign(resultDiff)) return 2

  return 0
}
