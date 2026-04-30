<script lang="ts">
  import { worstCase, ALL_CODES, COLOR_CLASSES } from '../lib/mastermind'
  import type { Code } from '../lib/mastermind'

  // Precomputed worst-case sizes for a selection of first guesses
  // (computing all 1296 live would be slow on page load)
  const CANDIDATES: { code: Code; label: string }[] = [
    { code: [1, 1, 1, 1], label: '1111' },
    { code: [1, 1, 1, 2], label: '1112' },
    { code: [1, 1, 2, 2], label: '1122' },
    { code: [1, 1, 2, 3], label: '1123' },
    { code: [1, 1, 2, 3], label: '1123' },
    { code: [1, 2, 3, 4], label: '1234' },
    { code: [1, 1, 3, 4], label: '1134' },
    { code: [1, 2, 2, 3], label: '1223' },
    { code: [1, 2, 3, 5], label: '1235' },
    { code: [1, 2, 3, 6], label: '1236' },
    { code: [1, 2, 4, 5], label: '1245' },
    { code: [1, 2, 3, 4], label: '1234' },
  ]

  // Deduplicate by label
  const unique = [...new Map(CANDIDATES.map(c => [c.label, c])).values()]

  // Compute worst cases — this runs once at component init
  const rows = unique.map(({ code, label }) => ({
    code,
    label,
    wc: worstCase(code, ALL_CODES),
  })).sort((a, b) => a.wc - b.wc)

  const minWC = rows[0].wc

  let highlightedRow = $state<string | null>(null)
</script>

<div class="space-y-6">
  <p class="text-sm text-neutral-500 dark:text-white/60">
    The minimax algorithm picks the guess with the <strong class="text-neutral-900 dark:text-white">smallest worst-case</strong> partition.
    Here are a selection of first guesses and their worst-case sizes. The best ones are highlighted.
  </p>

  <!-- Table -->
  <div class="rounded-lg border border-neutral-200 dark:border-white/10 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5">
          <th class="px-4 py-2 text-left text-xs text-neutral-400 dark:text-white/40 font-normal">Guess</th>
          <th class="px-4 py-2 text-left text-xs text-neutral-400 dark:text-white/40 font-normal">Worst-case group size</th>
          <th class="px-4 py-2 text-left text-xs text-neutral-400 dark:text-white/40 font-normal"></th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          {@const isMin = row.wc === minWC}
          <tr
            class="border-b border-neutral-100 dark:border-white/5 transition-colors cursor-default
              {isMin ? 'bg-green-500/10' : 'hover:bg-neutral-100 dark:hover:bg-white/5'}"
            onmouseenter={() => { highlightedRow = row.label }}
            onmouseleave={() => { highlightedRow = null }}
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex gap-[3px]">
                  {#each row.code as val}
                    <div class="w-4 h-4 rounded-full {COLOR_CLASSES[val]}"></div>
                  {/each}
                </div>
                <span class="font-mono text-neutral-600 dark:text-white/70 text-xs">{row.label}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="h-2 rounded-full transition-all {isMin ? 'bg-green-400/60' : 'bg-neutral-300 dark:bg-white/20'}"
                  style="width: {(row.wc / 1296) * 180}px"
                ></div>
                <span class="{isMin ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-neutral-500 dark:text-white/50'}">{row.wc}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-xs">
              {#if isMin}
                <span class="text-green-600 dark:text-green-400">✓ optimal</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Why 1122 -->
  <div class="p-4 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-3 text-sm text-neutral-500 dark:text-white/70">
    <p>
      Several first guesses tie at a worst-case of <span class="text-neutral-900 dark:text-white font-semibold">{minWC} codes</span>.
      <span class="text-neutral-900 dark:text-white font-semibold">1122</span> is the conventional choice — it was the one
      Donald Knuth used in his 1977 paper, and it's lexicographically small among the optimal openers.
    </p>
    <p>
      Applying this principle at <em>every step</em> — always guessing to minimise the worst-case
      remaining codes — guarantees solving any Mastermind game in
      <span class="text-neutral-900 dark:text-white font-semibold">5 guesses or fewer</span>.
    </p>
    <p class="text-neutral-400 dark:text-white/40 text-xs">
      This is the core of Knuth's algorithm. The full decision tree has 1,296 leaves and never
      goes deeper than 5 levels.
    </p>
  </div>
</div>
