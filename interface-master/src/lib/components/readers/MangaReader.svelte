<script lang='ts'>
  export let pages: string[]
  export let readingDirection: 'rtl' | 'ltr' | 'vertical' = 'rtl'
  export let onNextChapter: () => void
  export let onPrevChapter: () => void

  let mode: 'page' | 'vertical' = readingDirection === 'vertical' ? 'vertical' : 'page'
  let currentPage = 0
  let container: HTMLElement

  $: displayPages = readingDirection === 'rtl' && mode === 'page' ? [...pages].reverse() : pages

  function nextPage () {
    if (currentPage < displayPages.length - 1) {
      currentPage++
    } else {
      onNextChapter()
    }
  }

  function prevPage () {
    if (currentPage > 0) {
      currentPage--
    } else {
      onPrevChapter()
    }
  }

  function handleKey (e: KeyboardEvent) {
    if (mode !== 'page') return
    // ponytail: rtl reads right-to-left, so ArrowRight = prev, ArrowLeft = next
    if (readingDirection === 'rtl') {
      if (e.key === 'ArrowLeft') nextPage()
      if (e.key === 'ArrowRight') prevPage()
    } else {
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') prevPage()
    }
  }
</script>

<svelte:window on:keydown={handleKey} />

<div class='flex flex-col h-full'>
  <!-- Reader controls -->
  <div class='flex items-center gap-2 px-4 py-2 bg-muted border-b border-border shrink-0'>
    <button class='text-xs px-2 py-1 rounded hover:bg-accent' on:click={() => mode = mode === 'page' ? 'vertical' : 'page'}>
      {mode === 'page' ? 'Scroll' : 'Pages'}
    </button>
    <div class='flex-1' />
    {#if mode === 'page'}
      <span class='text-xs text-muted-foreground'>{currentPage + 1} / {displayPages.length}</span>
    {/if}
  </div>

  <!-- Reader content -->
  {#if mode === 'vertical'}
    <div class='flex-1 overflow-y-auto' bind:this={container}>
      {#each pages as page, i (i)}
        <img src={page} alt='Page {i + 1}' class='w-full block' loading='lazy' decoding='async' />
      {/each}
      <!-- Chapter navigation at bottom -->
      <div class='flex justify-between gap-4 px-6 py-6'>
        <button class='px-4 py-2 text-sm rounded bg-muted hover:bg-accent' on:click={onPrevChapter}>
          Previous
        </button>
        <button class='px-4 py-2 text-sm rounded bg-accent hover:bg-accent/80 font-bold' on:click={onNextChapter}>
          Next
        </button>
      </div>
    </div>
  {:else}
    <div class='flex-1 flex items-center justify-center relative overflow-hidden bg-black select-none'>
      {#if displayPages.length > 0}
        <img src={displayPages[currentPage]} alt='Page {currentPage + 1}' class='max-h-full max-w-full object-contain' />
      {/if}

      <!-- Click zones for page navigation -->
      <button class='absolute inset-y-0 left-0 w-1/3 cursor-west' on:click={readingDirection === 'rtl' ? nextPage : prevPage} aria-label='Previous page' />
      <button class='absolute inset-y-0 right-0 w-1/3 cursor-east' on:click={readingDirection === 'rtl' ? prevPage : nextPage} aria-label='Next page' />

      <!-- Page navigation buttons -->
      <button class='absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white' on:click={prevPage} aria-label='Previous page'>
        ←
      </button>
      <button class='absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white' on:click={nextPage} aria-label='Next page'>
        →
      </button>
    </div>
  {/if}
</div>