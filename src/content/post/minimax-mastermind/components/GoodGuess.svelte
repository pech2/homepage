<script lang="ts">
  import { worstCase, partition, ALL_CODES, COLOR_CLASSES } from '../lib/mastermind'
  import type { Code } from '../lib/mastermind'
  import Peg from './Peg.svelte'

  // Two candidates to compare
  const CANDIDATE_A: Code = [1, 1, 1, 1]
  const CANDIDATE_B: Code = [1, 1, 2, 2]

  const wcA = worstCase(CANDIDATE_A, ALL_CODES)
  const wcB = worstCase(CANDIDATE_B, ALL_CODES)

  // Partition sizes for each
  const partsA = partition(CANDIDATE_A, ALL_CODES)
  const partsB = partition(CANDIDATE_B, ALL_CODES)

  function sortedGroups(map: Map<string, unknown[]>) {
    return [...map.entries()]
      .map(([key, codes]) => ({ key, count: (codes as unknown[]).length }))
      .sort((a, b) => b.count - a.count)
  }

  const groupsA = sortedGroups(partsA)
  const groupsB = sortedGroups(partsB)

  let chosen = $state<'A' | 'B' | null>(null)
  let revealed = $state(false)

  function choose(pick: 'A' | 'B') {
    chosen = pick
    revealed = true
  }
</script>

<div class="space-y-6">
  <p class="text-neutral-500 dark:text-white/60 text-sm">
    Imagine it's your first guess and all 1,296 codes are still possible. Which of these two guesses would you choose?
  </p>

  <!-- Two candidate buttons -->
  <div class="grid grid-cols-2 gap-4">
    {#each (['A', 'B'] as const) as label}
      {@const code = label === 'A' ? CANDIDATE_A : CANDIDATE_B}
      <button
        class="flex flex-col items-center gap-3 p-4 rounded-lg border transition-all
          {!revealed ? 'border-neutral-300 dark:border-white/20 hover:border-neutral-400 dark:hover:border-white/50 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer' : 'cursor-default'}
          {revealed && chosen === label ? 'border-neutral-400 dark:border-white/40 bg-neutral-100 dark:bg-white/5' : ''}
          {revealed && chosen !== label ? 'opacity-50' : ''}"
        onclick={() => !revealed && choose(label)}
        disabled={revealed}
      >
        <span class="text-xs text-neutral-400 dark:text-white/40 uppercase tracking-widest">Option {label}</span>
        <span class="inline-flex flex-row gap-2">
          {#each code as val}
            <Peg value={val} size="md" />
          {/each}
        </span>
      </button>
    {/each}
  </div>

  <!-- Reveal -->
  {#if revealed}
    <div class="space-y-4 pt-2">
      <p class="text-sm text-neutral-500 dark:text-white/60">
        Here's how each guess splits all 1,296 codes into groups based on possible responses:
      </p>

      <div class="grid grid-cols-2 gap-6">
        <!-- Option A -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="flex gap-1">
              {#each CANDIDATE_A as val}
                <div class="w-4 h-4 rounded-full {COLOR_CLASSES[val]}"></div>
              {/each}
            </div>
            <span class="text-xs text-neutral-500 dark:text-white/50">Option A</span>
          </div>
          <div class="space-y-1">
            {#each groupsA as g}
              <div class="flex items-center gap-2">
                <div
                  class="h-2 rounded-full bg-neutral-300 dark:bg-white/30 transition-all"
                  style="width: {(g.count / 1296) * 180}px"
                ></div>
                <span class="text-xs text-neutral-500 dark:text-white/50 whitespace-nowrap">{g.key} → {g.count}</span>
              </div>
            {/each}
          </div>
          <p class="mt-2 text-sm">
            Worst case: <span class="text-red-500 dark:text-red-400 font-semibold">{wcA} codes</span>
          </p>
        </div>

        <!-- Option B -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="flex gap-1">
              {#each CANDIDATE_B as val}
                <div class="w-4 h-4 rounded-full {COLOR_CLASSES[val]}"></div>
              {/each}
            </div>
            <span class="text-xs text-neutral-500 dark:text-white/50">Option B</span>
          </div>
          <div class="space-y-1">
            {#each groupsB as g}
              <div class="flex items-center gap-2">
                <div
                  class="h-2 rounded-full bg-neutral-300 dark:bg-white/30 transition-all"
                  style="width: {(g.count / 1296) * 180}px"
                ></div>
                <span class="text-xs text-neutral-500 dark:text-white/50 whitespace-nowrap">{g.key} → {g.count}</span>
              </div>
            {/each}
          </div>
          <p class="mt-2 text-sm">
            Worst case: <span class="text-green-600 dark:text-green-400 font-semibold">{wcB} codes</span>
          </p>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm text-neutral-500 dark:text-white/70 space-y-2">
        <div class="flex gap-1">
          {#each CANDIDATE_A as val}
            <div class="w-4 h-4 rounded-full {COLOR_CLASSES[val]}"></div>
          {/each}
        </div>
        <p>
          gives one huge group of {wcA} codes (any response other than 0B0W tells you almost nothing new).
        </p>
        <div class="flex gap-1">
          {#each CANDIDATE_B as val}
            <div class="w-4 h-4 rounded-full {COLOR_CLASSES[val]}"></div>
          {/each}
        </div>
        <p>
          spreads codes more evenly — its worst case is only {wcB}, meaning you'll always have fewer possibilities left.
        </p>
        <p class="text-neutral-400 dark:text-white/50 text-xs pt-1">
          A great guess minimises the largest group — even in the worst case.
        </p>
      </div>
    </div>
  {:else}
    <p class="text-xs text-neutral-400 dark:text-white/30 text-center">Choose one to see the analysis.</p>
  {/if}
</div>
