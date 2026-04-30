<script lang="ts">
  import {
    partition,
    ALL_CODES,
    COLOR_CLASSES,
    COLOR_NAMES,
  } from '../lib/mastermind'
  import type { Code } from '../lib/mastermind'
  import Peg from './Peg.svelte'

  let guess = $state<Code>([1, 1, 2, 2])
  let editingIdx = $state<number>(-1)

  let groups = $derived(() => {
    const parts = partition(guess, ALL_CODES)
    return [...parts.entries()]
      .map(([key, codes]) => ({ key, count: codes.length }))
      .sort((a, b) => b.count - a.count)
  })

  function setColor(idx: number, c: number) {
    const next = [...guess] as Code
    next[idx] = c
    guess = next
    editingIdx = -1
  }

  // Group colors work in both light and dark (semi-transparent colored backgrounds)
  const GROUP_COLORS = [
    'bg-red-500/20 border-red-500/30',
    'bg-orange-500/20 border-orange-500/30',
    'bg-yellow-500/20 border-yellow-500/30',
    'bg-green-500/20 border-green-500/30',
    'bg-blue-500/20 border-blue-500/30',
    'bg-purple-500/20 border-purple-500/30',
    'bg-pink-500/20 border-pink-500/30',
    'bg-teal-500/20 border-teal-500/30',
    'bg-cyan-500/20 border-cyan-500/30',
    'bg-indigo-500/20 border-indigo-500/30',
    'bg-neutral-200 border-neutral-300 dark:bg-white/10 dark:border-white/20',
    'bg-neutral-100 border-neutral-200 dark:bg-white/5 dark:border-white/10',
    'bg-neutral-100 border-neutral-200 dark:bg-white/5 dark:border-white/10',
    'bg-neutral-100 border-neutral-200 dark:bg-white/5 dark:border-white/10',
  ]
</script>

<div class="space-y-5">
  <p class="text-sm text-neutral-500 dark:text-white/60">
    Pick any guess below. Every one of the 1,296 codes will be placed into a group based
    on what feedback that guess would produce against it. More, smaller groups = better guess.
  </p>

  <!-- Guess picker -->
  <div class="flex items-center gap-3">
    <span class="text-xs text-neutral-400 dark:text-white/40">Guess:</span>
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
      <div class="flex gap-1 ml-2">
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

  <!-- Groups -->
  <div class="space-y-2">
    {#each groups() as grp, i}
      <div class="flex items-center gap-3 rounded border {GROUP_COLORS[i] ?? 'bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10'} px-3 py-2">
        <span class="font-mono text-xs text-neutral-600 dark:text-white/70 w-12">{grp.key}</span>
        <div
          class="h-2 rounded-full bg-neutral-300 dark:bg-white/30"
          style="width: {Math.max(4, (grp.count / 1296) * 200)}px"
        ></div>
        <span class="text-xs text-neutral-500 dark:text-white/50 ml-auto">{grp.count} codes</span>
      </div>
    {/each}
  </div>

  <p class="text-xs text-neutral-400 dark:text-white/30">
    {groups().length} distinct responses for this guess.
    The largest group has {groups()[0]?.count ?? 0} codes.
  </p>
</div>
