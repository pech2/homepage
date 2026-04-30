<script lang="ts">
  import { ALL_CODES, COLOR_CLASSES } from '../lib/mastermind'
</script>

<div class="space-y-4">
  <p class="text-sm text-neutral-500 dark:text-white/60">
    Each dot below represents one possible secret code. There are exactly
    <span class="text-neutral-900 dark:text-white font-semibold">6 × 6 × 6 × 6 = 1,296</span> of them — one for each
    way to arrange 4 pegs with 6 colors (repetition allowed). The color of
    each dot shows the first peg of that code.
  </p>

  <!-- 36 × 36 dot grid -->
  <div class="flex flex-wrap gap-[2px]" style="width: 304px" aria-label="All 1296 possible codes">
    {#each ALL_CODES as code}
      <div
        class="w-[7px] h-[7px] rounded-full {COLOR_CLASSES[code[0]]} opacity-70"
        title="{code.join('')}"
      ></div>
    {/each}
  </div>

  <p class="text-xs text-neutral-400 dark:text-white/30">
    Every single one of these is a valid guess — and a valid secret. The AI has to narrow them
    down to exactly 1 to win.
  </p>
</div>
