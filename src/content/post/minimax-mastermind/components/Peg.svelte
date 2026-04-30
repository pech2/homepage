<script lang="ts">
  import { COLOR_CLASSES } from '../lib/mastermind'
  interface Props {
    value: number // 0 = empty slot
    size?: 'sm' | 'md' | 'lg'
    onclick?: () => void
    selected?: boolean
  }
  let { value, size = 'md', onclick, selected = false }: Props = $props()

  const SIZE_MAP = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-10 h-10' }
  let sizeClass = $derived(SIZE_MAP[size])
</script>

<button
  class="{sizeClass} rounded-full border-2 transition-all duration-150 focus:outline-none
    {value === 0
      ? 'bg-neutral-200 border-neutral-300 dark:bg-white/10 dark:border-white/20'
      : COLOR_CLASSES[value] + ' border-transparent'}
    {onclick ? 'cursor-pointer hover:scale-110 hover:border-neutral-500 dark:hover:border-white/60' : 'cursor-default'}
    {selected ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-1 ring-offset-white dark:ring-offset-black' : ''}"
  disabled={!onclick}
  {onclick}
  aria-label={value === 0 ? 'empty' : `color ${value}`}
></button>
