// Core Mastermind game logic — shared by all sections

export type Code = [number, number, number, number] // values 1–6
export type Response = { black: number; white: number }

export const COLORS = 6
export const PEGS = 4

// Tailwind color classes for each peg value (1–6)
export const COLOR_CLASSES: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-green-500',
  5: 'bg-blue-500',
  6: 'bg-purple-500',
}

export const COLOR_NAMES: Record<number, string> = {
  1: 'Red',
  2: 'Orange',
  3: 'Yellow',
  4: 'Green',
  5: 'Blue',
  6: 'Purple',
}

// All 1296 possible codes (1^4 through 6^4)
export const ALL_CODES: Code[] = (() => {
  const codes: Code[] = []
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++)
      for (let c = 1; c <= 6; c++)
        for (let d = 1; d <= 6; d++)
          codes.push([a, b, c, d] as Code)
  return codes
})()

/** Score a guess against a secret. */
export function score(guess: Code, secret: Code): Response {
  let black = 0
  let white = 0
  const gCount = new Array(7).fill(0)
  const sCount = new Array(7).fill(0)

  for (let i = 0; i < PEGS; i++) {
    if (guess[i] === secret[i]) {
      black++
    } else {
      gCount[guess[i]]++
      sCount[secret[i]]++
    }
  }
  for (let c = 1; c <= COLORS; c++) {
    white += Math.min(gCount[c], sCount[c])
  }
  return { black, white }
}

/** Serialize a response to a stable string key. */
export function responseKey(r: Response): string {
  return `${r.black}B${r.white}W`
}

/** Filter codes consistent with a guess+response pair. */
export function filterCodes(codes: Code[], guess: Code, resp: Response): Code[] {
  const key = responseKey(resp)
  return codes.filter((c) => responseKey(score(guess, c)) === key)
}

/** Partition remaining codes by response to a given guess. */
export function partition(guess: Code, remaining: Code[]): Map<string, Code[]> {
  const map = new Map<string, Code[]>()
  for (const code of remaining) {
    const key = responseKey(score(guess, code))
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(code)
  }
  return map
}

/** Worst-case partition size for a guess against remaining codes. */
export function worstCase(guess: Code, remaining: Code[]): number {
  const parts = partition(guess, remaining)
  let max = 0
  for (const group of parts.values()) {
    // The 4B0W group (correct guess) reduces remaining to 0, so exclude it
    if (group.length > max) max = group.length
  }
  return max
}

/**
 * Minimax: given remaining possibilities, return the best guess.
 * Searches ALL_CODES as candidates (not just remaining) so we can
 * sometimes use a code that can't be the answer to maximally partition.
 * Tie-break: prefer a candidate that is itself still in `remaining`.
 */
export function minimaxGuess(remaining: Code[]): Code {
  if (remaining.length === 1) return remaining[0]
  if (remaining.length === 0) return ALL_CODES[0]

  // Well-known optimal first guess — skip full search for speed
  if (remaining.length === ALL_CODES.length) return [1, 1, 2, 2]

  let bestGuess: Code = remaining[0]
  let bestWorst = Infinity
  let bestIsRemaining = true

  const candidates = remaining.length <= 6 ? remaining : ALL_CODES

  for (const guess of candidates) {
    const wc = worstCase(guess, remaining)
    const isInRemaining = remaining.some((r) => r.every((v, i) => v === guess[i]))
    if (
      wc < bestWorst ||
      (wc === bestWorst && isInRemaining && !bestIsRemaining)
    ) {
      bestWorst = wc
      bestGuess = guess
      bestIsRemaining = isInRemaining
    }
  }
  return bestGuess
}

/** Check code equality */
export function codesEqual(a: Code, b: Code): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

/** Random code */
export function randomCode(): Code {
  return [
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
  ] as Code
}
