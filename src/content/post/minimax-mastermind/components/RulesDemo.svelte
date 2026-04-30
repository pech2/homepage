<script lang="ts">
  import { score, COLOR_CLASSES, COLOR_NAMES } from '../lib/mastermind'
  import type { Code } from '../lib/mastermind'
  import Peg from './Peg.svelte'
  import FeedbackDots from './FeedbackDots.svelte'

  // Default example: guess 1122, secret 1234
  let guess = $state<Code>([1, 1, 2, 2])
  let secret = $state<Code>([1, 2, 3, 4])

  let feedback = $derived(score(guess, secret))

  // Which row the user is editing: 'guess' | 'secret' | null
  let editing = $state<'guess' | 'secret' | null>(null)
  let editingIndex = $state<number>(-1)

  function startEdit(row: 'guess' | 'secret', idx: number) {
    editing = row
    editingIndex = idx
  }

  function pickColor(c: number) {
    if (editing === 'guess') {
      const next = [...guess] as Code
      next[editingIndex] = c
      guess = next
    } else if (editing === 'secret') {
      const next = [...secret] as Code
      next[editingIndex] = c
      secret = next
    }
    editing = null
    editingIndex = -1
  }
</script>

<div class="space-y-6">
  <!-- Guess row -->
  <div>
    <p class="text-xs text-neutral-400 dark:text-white/40 uppercase tracking-widest mb-2">Your Guess</p>
    <div class="flex items-center gap-4">
      <div class="flex gap-2">
        {#each guess as val, i}
          <Peg
            value={val}
            size="lg"
            onclick={() => startEdit('guess', i)}
            selected={editing === 'guess' && editingIndex === i}
          />
        {/each}
      </div>
    </div>
  </div>

  <!-- Secret row -->
  <div>
    <p class="text-xs text-neutral-400 dark:text-white/40 uppercase tracking-widest mb-2">Secret Code</p>
    <div class="flex items-center gap-4">
      <div class="flex gap-2">
        {#each secret as val, i}
          <Peg
            value={val}
            size="lg"
            onclick={() => startEdit('secret', i)}
            selected={editing === 'secret' && editingIndex === i}
          />
        {/each}
      </div>
    </div>
  </div>

  <!-- Color picker (shown when editing) -->
  {#if editing !== null}
    <div class="flex flex-col gap-2">
      <p class="text-xs text-neutral-400 dark:text-white/40 uppercase tracking-widest">
        Pick a color for peg {editingIndex + 1}
      </p>
      <div class="flex gap-2">
        {#each [1, 2, 3, 4, 5, 6] as c}
          <button
            class="w-10 h-10 rounded-full {COLOR_CLASSES[c]} hover:scale-110 transition-transform border-2 border-transparent hover:border-neutral-500 dark:hover:border-white/60"
            onclick={() => pickColor(c)}
            aria-label={COLOR_NAMES[c]}
          ></button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Result -->
  <div class="flex items-center gap-4 pt-2 border-t border-neutral-200 dark:border-white/10">
    <FeedbackDots black={feedback.black} white={feedback.white} />
    <div class="text-sm text-neutral-600 dark:text-white/70">
      <span class="text-neutral-900 dark:text-white font-semibold">{feedback.black}</span> black peg{feedback.black !== 1 ? 's' : ''}
      &nbsp;·&nbsp;
      <span class="text-neutral-900 dark:text-white font-semibold">{feedback.white}</span> white peg{feedback.white !== 1 ? 's' : ''}
    </div>
  </div>

  <div class="text-xs text-neutral-400 dark:text-white/40 space-y-1">
    <p><span class="text-neutral-900 dark:text-white">Black peg</span> = right color, right position.</p>
    <p><span class="text-neutral-600 dark:text-white/70">White peg</span> = right color, wrong position.</p>
    <p class="pt-1 text-neutral-400 dark:text-white/30">Click any peg above to change it.</p>
  </div>
</div>
