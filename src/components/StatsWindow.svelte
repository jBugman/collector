<script>
  export let stats;
  export let error = null;

  let text = "";

  $: if (stats) {
    const { implicitMods, explicitMods } = stats;
    text = JSON.stringify({ implicitMods, explicitMods }, undefined, 2);
  } else {
    text = "";
  }
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
