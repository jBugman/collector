<script lang="ts">
  export let stats: unknown;
  export let error: string | null = null;

  $: text = stats ? JSON.stringify(stats, undefined, 2) : "";
</script>

<div>{error || text}</div>

<style>
  div {
    background: #0c0b0b;
    border-color: #141414;
    padding: 6px;
    color: inherit;
    outline: none;
    border: 1px solid #141414;
    white-space: pre-wrap;
  }
</style>
