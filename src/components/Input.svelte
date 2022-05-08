<script lang="ts">
  export let text = "";
</script>

<textarea placeholder="Paste stats here" bind:value={text} />

<style>
  textarea {
    background: #0c0b0b;
    border-color: #141414;
    padding: 6px;
    color: inherit;
    outline: none;
    border: 1px solid #141414;
    white-space: pre-wrap;
  }
</style>
