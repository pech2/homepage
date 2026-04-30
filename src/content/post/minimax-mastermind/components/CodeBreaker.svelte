<script lang="ts">
  import {
    score,
    randomCode,
    codesEqual,
    filterCodes,
    COLOR_CLASSES,
    COLOR_NAMES,
    ALL_CODES,
  } from '../lib/mastermind'
  import type { Code, Response } from '../lib/mastermind'
  import Peg from './Peg.svelte'
  import FeedbackDots from './FeedbackDots.svelte'

  const MAX_GUESSES = 10

  interface GuessRow {
    guess: Code
    response: Response
  }

  let secret = $state<Code>(randomCode())
  let history = $state<GuessRow[]>([])
  let currentGuess = $state<Code>([0, 0, 0, 0])
  let selectedPeg = $state<number>(-1)
  let gameOver = $state(false)
  let won = $state(false)

  function reset() {
    secret = randomCode()
    history = []
    currentGuess = [0, 0, 0, 0]
    selectedPeg = -1
    gameOver = false
    won = false
  }

  function selectPeg(i: number) {
    if (gameOver) return
    selectedPeg = selectedPeg === i ? -1 : i
  }

  function pickColor(c: number) {
    if (selectedPeg === -1 || gameOver) return
    const next = [...currentGuess] as Code
    next[selectedPeg] = c
    currentGuess = next
    // Auto-advance to next empty peg
    const nextEmpty = next.findIndex((v, i) => i > selectedPeg && v === 0)
    if (nextEmpty !== -1) {
      selectedPeg = nextEmpty
    } else {
      selectedPeg = -1
    }
  }

  function submitGuess() {
    if (currentGuess.some((v) => v === 0) || gameOver) return
    const resp = score(currentGuess, secret)
    history = [...history, { guess: [...currentGuess] as Code, response: resp }]
    if (resp.black === 4) {
      gameOver = true
      won = true
    } else if (history.length >= MAX_GUESSES) {
      gameOver = true
      won = false
    }
    currentGuess = [0, 0, 0, 0]
    selectedPeg = -1
  }

  let canSubmit = $derived(!currentGuess.some((v) => v === 0) && !gameOver)
  let guessesLeft = $derived(MAX_GUESSES - history.length)
</script>

<div class="space-y-4">
  <!-- History rows -->
  {#each history as row, i}
    <div class="flex items-center gap-4">
      <span class="text-xs text-neutral-400 dark:text-white/30 w-4 text-right">{i + 1}</span>
      <div class="flex gap-2">
        {#each row.guess as val}
          <Peg value={val} size="md" />
        {/each}
      </div>
      <FeedbackDots black={row.response.black} white={row.response.white} />
      <span class="text-xs text-neutral-400 dark:text-white/40">
        {row.response.black}B {row.response.white}W
      </span>
    </div>
  {/each}

  <!-- Current input row (if game ongoing) -->
  {#if !gameOver}
    <div class="flex items-center gap-4">
      <span class="text-xs text-neutral-400 dark:text-white/30 w-4 text-right">{history.length + 1}</span>
      <div class="flex gap-2">
        {#each currentGuess as val, i}
          <Peg
            value={val}
            size="md"
            onclick={() => selectPeg(i)}
            selected={selectedPeg === i}
          />
        {/each}
      </div>
      <button
        class="px-3 py-1 text-sm rounded border border-neutral-300 dark:border-white/20 text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/50 transition disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={!canSubmit}
        onclick={submitGuess}
      >
        Submit
      </button>
    </div>

    <!-- Color picker -->
    {#if selectedPeg !== -1}
      <div class="pl-8 flex gap-2 items-center">
        <span class="text-xs text-neutral-400 dark:text-white/30">Peg {selectedPeg + 1}:</span>
        {#each [1, 2, 3, 4, 5, 6] as c}
          <button
            class="w-8 h-8 rounded-full {COLOR_CLASSES[c]} hover:scale-110 transition-transform border-2
              {currentGuess[selectedPeg] === c ? 'border-neutral-900 dark:border-white' : 'border-transparent'}"
            onclick={() => pickColor(c)}
            aria-label={COLOR_NAMES[c]}
          ></button>
        {/each}
      </div>
    {:else}
      <p class="pl-8 text-xs text-neutral-400 dark:text-white/30">Click a peg to pick its color.</p>
    {/if}
  {/if}

  <!-- Game over banner -->
  {#if gameOver}
    <div class="mt-4 p-4 rounded-lg border {won ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'}">
      {#if won}
        <p class="text-green-600 dark:text-green-400 font-semibold">
          🎉 You cracked it in {history.length} guess{history.length !== 1 ? 'es' : ''}!
        </p>
      {:else}
        <div class="space-y-2">
          <p class="text-red-600 dark:text-red-400 font-semibold">The code was:</p>
          <div class="flex gap-2">
            {#each secret as val}
              <Peg value={val} size="md" />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Footer -->
  <div class="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-white/10">
    {#if !gameOver}
      <span class="text-xs text-neutral-400 dark:text-white/30">{guessesLeft} guess{guessesLeft !== 1 ? 'es' : ''} remaining</span>
    {:else}
      <span></span>
    {/if}
    <button
      class="text-xs text-neutral-400 dark:text-white/40 hover:text-neutral-600 dark:hover:text-white/70 transition underline underline-offset-2"
      onclick={reset}
    >
      New game
    </button>
  </div>
</div>
