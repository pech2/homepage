<script lang="ts">
  import {
    score,
    randomCode,
    codesEqual,
    filterCodes,
    minimaxGuess,
    responseKey,
    COLOR_CLASSES,
    COLOR_NAMES,
    ALL_CODES,
  } from '../lib/mastermind'
  import type { Code, Response } from '../lib/mastermind'
  import Peg from './Peg.svelte'
  import FeedbackDots from './FeedbackDots.svelte'

  interface Step {
    guess: Code
    response: Response
    remaining: number // codes still consistent after this guess
  }

  type Phase = 'setup' | 'playing' | 'done'

  let secret = $state<Code>([1, 2, 3, 4])
  let selectedPeg = $state<number>(-1)
  let phase = $state<Phase>('setup')
  let steps = $state<Step[]>([])
  let remaining = $state<Code[]>([...ALL_CODES])

  // Highlighted code indices (eliminated = dimmed)
  let eliminatedSet = $state<Set<string>>(new Set())

  function codeKey(c: Code) { return c.join('') }

  function reset() {
    secret = [1, 2, 3, 4]
    selectedPeg = -1
    phase = 'setup'
    steps = []
    remaining = [...ALL_CODES]
    eliminatedSet = new Set()
  }

  function selectPeg(i: number) {
    if (phase !== 'setup') return
    selectedPeg = selectedPeg === i ? -1 : i
  }

  function pickColor(c: number) {
    if (selectedPeg === -1 || phase !== 'setup') return
    const next = [...secret] as Code
    next[selectedPeg] = c
    secret = next
    const nextEmpty = next.findIndex((v, idx) => idx > selectedPeg && v === 0)
    selectedPeg = nextEmpty !== -1 ? nextEmpty : -1
  }

  function startGame() {
    phase = 'playing'
    remaining = [...ALL_CODES]
    eliminatedSet = new Set()
  }

  function nextStep() {
    if (phase !== 'playing') return
    const guess = minimaxGuess(remaining)
    const resp = score(guess, secret)

    // Update remaining codes
    const newRemaining = filterCodes(remaining, guess, resp)

    // Track eliminated codes
    const newEliminated = new Set(eliminatedSet)
    for (const c of ALL_CODES) {
      if (!newRemaining.some((r) => codesEqual(r, c))) {
        newEliminated.add(codeKey(c))
      }
    }
    eliminatedSet = newEliminated

    steps = [...steps, { guess, response: resp, remaining: newRemaining.length }]
    remaining = newRemaining

    if (resp.black === 4) {
      phase = 'done'
    }
  }

  let isReady = $derived(!secret.some((v) => v === 0))
</script>

<div class="space-y-6">
  <!-- Setup: pick secret code -->
  {#if phase === 'setup'}
    <div class="space-y-4">
      <p class="text-sm text-neutral-500 dark:text-white/60">
        Set a secret code. The AI will try to crack it using the minimax strategy.
      </p>
      <div class="flex items-center gap-4">
        <div class="flex gap-2">
          {#each secret as val, i}
            <Peg
              value={val}
              size="lg"
              onclick={() => selectPeg(i)}
              selected={selectedPeg === i}
            />
          {/each}
        </div>
        <button
          class="text-xs text-neutral-400 dark:text-white/40 hover:text-neutral-500 dark:hover:text-white/60 transition underline underline-offset-2"
          onclick={() => { secret = randomCode(); selectedPeg = -1 }}
        >
          Random
        </button>
      </div>

      {#if selectedPeg !== -1}
        <div class="flex gap-2 items-center">
          <span class="text-xs text-neutral-400 dark:text-white/30">Peg {selectedPeg + 1}:</span>
          {#each [1, 2, 3, 4, 5, 6] as c}
            <button
              class="w-8 h-8 rounded-full {COLOR_CLASSES[c]} hover:scale-110 transition-transform border-2
                {secret[selectedPeg] === c ? 'border-neutral-900 dark:border-white' : 'border-transparent'}"
              onclick={() => pickColor(c)}
              aria-label={COLOR_NAMES[c]}
            ></button>
          {/each}
        </div>
      {/if}

      <button
        class="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-neutral-700 dark:hover:bg-white/90 transition disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={!isReady}
        onclick={startGame}
      >
        Let the AI play →
      </button>
    </div>
  {/if}

  <!-- Playing / Done: show steps -->
  {#if phase === 'playing' || phase === 'done'}
    <div class="space-y-3">
      <!-- Guess history -->
      {#each steps as step, i}
        <div class="flex items-center gap-4">
          <span class="text-xs text-neutral-400 dark:text-white/30 w-4 text-right">{i + 1}</span>
          <div class="flex gap-2">
            {#each step.guess as val}
              <Peg value={val} size="md" />
            {/each}
          </div>
          <FeedbackDots black={step.response.black} white={step.response.white} />
          <span class="text-xs text-neutral-400 dark:text-white/40">
            {step.response.black}B {step.response.white}W
          </span>
          {#if step.response.black < 4}
            <span class="text-xs text-neutral-400 dark:text-white/30">→ {step.remaining} left</span>
          {/if}
        </div>
      {/each}

      <!-- Next step button -->
      {#if phase === 'playing'}
        <button
          class="mt-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-white/20 text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/50 transition text-sm"
          onclick={nextStep}
        >
          {steps.length === 0 ? 'Make first guess →' : 'Next guess →'}
        </button>
      {/if}

      <!-- Done -->
      {#if phase === 'done'}
        <div class="p-4 rounded-lg border border-green-500/40 bg-green-500/10 space-y-2">
          <p class="text-green-600 dark:text-green-400 font-semibold">
            Cracked in {steps.length} guess{steps.length !== 1 ? 'es' : ''}!
          </p>
          <p class="text-xs text-neutral-500 dark:text-white/50">
            The minimax algorithm guarantees a solution in at most 5 guesses, for any secret code.
          </p>
        </div>
      {/if}
    </div>

    <!-- Mini dot-grid showing eliminated codes -->
    <div>
      <p class="text-xs text-neutral-400 dark:text-white/30 mb-2">
        {eliminatedSet.size === 0
          ? 'All 1,296 codes possible'
          : `${ALL_CODES.length - eliminatedSet.size} of 1,296 codes still possible`}
      </p>
      <div class="flex flex-wrap gap-[2px]" style="width: 288px">
        {#each ALL_CODES as code}
          {@const key = codeKey(code)}
          <div
            class="w-[6px] h-[6px] rounded-full transition-opacity duration-300
              {eliminatedSet.has(key) ? 'opacity-10' : 'opacity-80'}
              {COLOR_CLASSES[code[0]]}"
          ></div>
        {/each}
      </div>
    </div>

    <button
      class="text-xs text-neutral-400 dark:text-white/40 hover:text-neutral-600 dark:hover:text-white/70 transition underline underline-offset-2"
      onclick={reset}
    >
      Try a different code
    </button>
  {/if}
</div>
