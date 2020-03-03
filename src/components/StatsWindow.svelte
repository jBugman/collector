<script>
  export let stats;
  export let error = null;

  $: text = stats ? JSON.stringify(stats, undefined, 2) : "";
</script>

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

<div>{error || text}</div>
