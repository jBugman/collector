<style>
  button {
    background: linear-gradient(180deg, #1f0c04 0%, #bd351e 100%);
    border: 1.5px solid #64472c;
    color: #dfb162;
    border-radius: 5px;
    font-size: 14px;
  }
  button:hover {
    color: #f6c66a;
  }
</style>

<button on:click>
  <slot />
</button>
