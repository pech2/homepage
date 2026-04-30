<script lang="ts">
  interface Props {
    black: number
    white: number
  }
  let { black, white }: Props = $props()
  // 4 dots in a 2×2 grid, filled black/white/empty
  const dots = $derived(
    Array.from({ length: 4 }, (_, i) => {
      if (i < black) return 'black'
      if (i < black + white) return 'white'
      return 'empty'
    })
  )
</script>

<div class="grid grid-cols-2 gap-[3px] w-8">
  {#each dots as dot}
    <div
      class="w-3 h-3 rounded-full
        {dot === 'black'
          ? 'bg-neutral-900 dark:bg-black border border-neutral-500 dark:border-neutral-600'
          : dot === 'white'
          ? 'bg-white border border-neutral-300 dark:border-neutral-600'
          : 'bg-transparent dark:bg-[#0f0f0f]'}"
    ></div>
  {/each}
</div>
