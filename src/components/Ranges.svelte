<script>
  import Button from "./Button.svelte";
  import StatsWindow from "./StatsWindow.svelte";

  export let error = null;
  export let ranges;
</script>

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

<section>
  <StatsWindow stats={ranges} {error} />
  <div class="footer">
    <slot />
  </div>
</section>
