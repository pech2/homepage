<script lang="ts">
  import { onMount } from 'svelte'

  const NAV_ITEMS = [
    { id: 'rules',      label: 'The Rules' },
    { id: 'section-1', label: '01 · Code Breaker' },
    { id: 'section-2', label: '02 · Good Guesses' },
    { id: 'section-3', label: '03 · Code Maker' },
    { id: 'section-4', label: '04 · Search Space' },
    { id: 'section-5', label: '05 · Partitions' },
    { id: 'section-6', label: '06 · Worst Case' },
    { id: 'section-7', label: '07 · Minimax' },
  ]

  let activeId = $state('rules')

  onMount(() => {
    const observers: IntersectionObserver[] = []
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) activeId = item.id },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  })
</script>

<nav class="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3" aria-label="Page sections">
  {#each NAV_ITEMS as item}
    <a href="#{item.id}" class="group flex items-center gap-2 justify-end" aria-label={item.label}>
      <span class="text-xs text-transparent group-hover:text-neutral-500 dark:group-hover:text-white/50 transition-all duration-200 whitespace-nowrap
        {activeId === item.id ? 'text-neutral-600 dark:text-white/70' : ''}">
        {item.label}
      </span>
      <div class="rounded-full transition-all duration-200
        {activeId === item.id
          ? 'w-3 h-3 bg-neutral-900 dark:bg-white'
          : 'w-2 h-2 bg-neutral-400 dark:bg-white/25 group-hover:bg-neutral-600 dark:group-hover:bg-white/50'}">
      </div>
    </a>
  {/each}
</nav>
