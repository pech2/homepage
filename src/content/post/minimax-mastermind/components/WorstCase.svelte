<script lang="ts">
  import {
    partition,
    worstCase,
    ALL_CODES,
    COLOR_CLASSES,
    COLOR_NAMES,
  } from '../lib/mastermind'
  import type { Code } from '../lib/mastermind'
  import Peg from './Peg.svelte'

  // A handful of interesting comparison guesses
  const PRESETS: Code[] = [
    [1, 1, 1, 1],
    [1, 1, 1, 2],
    [1, 1, 2, 2],
    [1, 1, 2, 3],
    [1, 2, 3, 4],
    [1, 2, 3, 5],
  ]

  let guess = $state<Code>([1, 1, 2, 2])
  let editingIdx = $state<number>(-1)

  let groups = $derived(() => {
    const parts = partition(guess, ALL_CODES)
    return [...parts.entries()]
      .map(([key, codes]) => ({ key, count: codes.length }))
      .sort((a, b) => b.count - a.count)
  })

  let wc = $derived(worstCase(guess, ALL_CODES))

  function setColor(idx: number, c: number) {
    const next = [...guess] as Code
    next[idx] = c
    guess = next
    editingIdx = -1
  }

  function setPreset(p: Code) {
    guess = [...p] as Code
    editingIdx = -1
  }
</script>

<div class="space-y-5">
  <p class="text-sm text-neutral-500 dark:text-white/60">
    For any guess, the <span class="text-neutral-900 dark:text-white">worst case</span> is the response that
    leaves the most codes still possible — the biggest group. We want to
    <em>minimise</em> that number.
  </p>

  <!-- Presets -->
  <div class="flex flex-wrap gap-2">
    {#each PRESETS as p}
      <button
        class="flex gap-1 items-center px-2 py-1 rounded border transition
          {p.join('') === guess.join('')
            ? 'border-neutral-400 dark:border-white/40 bg-neutral-100 dark:bg-white/5'
            : 'border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30'}"
        onclick={() => setPreset(p)}
      >
        {#each p as val}
          <div class="w-3 h-3 rounded-full {COLOR_CLASSES[val]}"></div>
        {/each}
      </button>
    {/each}
  </div>

  <!-- Guess picker -->
  <div class="flex items-center gap-3">
    <span class="text-xs text-neutral-400 dark:text-white/40">Custom:</span>
    <div class="flex gap-2">
      {#each guess as val, i}
        <Peg
          value={val}
          size="md"
          onclick={() => { editingIdx = editingIdx === i ? -1 : i }}
          selected={editingIdx === i}
        />
      {/each}
    </div>
    {#if editingIdx !== -1}
      <div class="flex gap-1">
        {#each [1, 2, 3, 4, 5, 6] as c}
          <button
            class="w-7 h-7 rounded-full {COLOR_CLASSES[c]} hover:scale-110 transition-transform border-2
              {guess[editingIdx] === c ? 'border-neutral-900 dark:border-white' : 'border-transparent'}"
            onclick={() => setColor(editingIdx, c)}
            aria-label={COLOR_NAMES[c]}
          ></button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Groups with worst-case highlighted -->
  <div class="space-y-2">
    {#each groups() as grp, i}
      {@const isWorst = grp.count === wc && i === 0}
      <div
        class="flex items-center gap-3 rounded border px-3 py-2 transition-colors
          {isWorst
            ? 'border-amber-500/50 bg-amber-500/10'
            : 'border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5'}"
      >
        <span class="font-mono text-xs w-12 {isWorst ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-600 dark:text-white/70'}">{grp.key}</span>
        <div
          class="h-2 rounded-full {isWorst ? 'bg-amber-400/60' : 'bg-neutral-300 dark:bg-white/20'}"
          style="width: {Math.max(4, (grp.count / 1296) * 200)}px"
        ></div>
        <span class="text-xs ml-auto {isWorst ? 'text-amber-600 dark:text-amber-300 font-semibold' : 'text-neutral-500 dark:text-white/50'}">{grp.count}</span>
        {#if isWorst}
          <span class="text-xs text-amber-600 dark:text-amber-400">← worst case</span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="flex items-center gap-3 p-3 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
    <span class="text-sm text-neutral-500 dark:text-white/60">Worst case for this guess:</span>
    <span class="text-xl font-bold {wc <= 256 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}">{wc}</span>
    <span class="text-sm text-neutral-400 dark:text-white/40">codes remain</span>
  </div>
</div>
