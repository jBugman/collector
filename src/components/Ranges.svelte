<script lang="ts">
  import StatsWindow from "./StatsWindow.svelte";

  export let error: string | null = null;
  export let ranges: unknown;
</script>

<section>
  <StatsWindow stats={ranges} {error} />
  <div class="footer">
    <slot />
  </div>
</section>

<style>
  section {
    display: grid;
    row-gap: 5px;
    grid-template-rows: 1fr auto;
  }

  .footer {
    display: grid;
    column-gap: 5px;
    grid-auto-flow: column;
  }
</style>
