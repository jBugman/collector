<script>
  import { createEventDispatcher } from "svelte";
  import Button from "~/components/Button";
  import StatsWindow from "~/components/StatsWindow";

  const dispatch = createEventDispatcher();

  export let ranges;
  export let disabled;
  export let buttonLabel;
</script>

<style>
  section {
    display: grid;
    row-gap: 5px;
    grid-template-rows: 1fr auto;
  }
</style>

<section>
  <StatsWindow stats={ranges} />
  <Button on:click={() => dispatch('buttonClick')} {disabled}>
    {buttonLabel}
  </Button>
</section>
