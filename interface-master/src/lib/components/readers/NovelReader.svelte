<script lang='ts'>
  import DOMPurify from 'dompurify'

  export let html: string
  export let onNextChapter: () => void
  export let onPrevChapter: () => void

  let fontSize = 16
  let nightMode = false

  $: sanitized = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
</script>

<div class='flex flex-col h-full overflow-y-auto {nightMode ? 'bg-zinc-900 text-zinc-100' : 'bg-background text-foreground'}' style:font-size='{fontSize}px'>
  <!-- Reader controls -->
  <div class='sticky top-0 z-10 flex items-center gap-2 px-4 py-2 {nightMode ? 'bg-zinc-800' : 'bg-muted'} border-b border-border'>
    <button class='text-xs px-2 py-1 rounded hover:bg-accent' on:click={() => { fontSize = Math.max(12, fontSize - 1) }}>A-</button>
    <span class='text-xs'>{fontSize}px</span>
    <button class='text-xs px-2 py-1 rounded hover:bg-accent' on:click={() => { fontSize = Math.min(28, fontSize + 1) }}>A+</button>
    <div class='flex-1' />
    <button class='text-xs px-2 py-1 rounded hover:bg-accent' on:click={() => { nightMode = !nightMode }}>
      {nightMode ? 'Light' : 'Dark'}
    </button>
  </div>

  <!-- Chapter content -->
  <div class='max-w-2xl mx-auto px-6 py-8 prose prose-sm {nightMode ? 'prose-invert' : ''}'>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via DOMPurify -->
    {@html sanitized}
  </div>

  <!-- Chapter navigation -->
  <div class='flex justify-between gap-4 px-6 py-6 max-w-2xl mx-auto w-full'>
    <button class='px-4 py-2 text-sm rounded bg-muted hover:bg-accent' on:click={onPrevChapter}>
      Previous
    </button>
    <button class='px-4 py-2 text-sm rounded bg-accent hover:bg-accent/80 font-bold' on:click={onNextChapter}>
      Next
    </button>
  </div>
</div>
