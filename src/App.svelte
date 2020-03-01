<script>
  import Input from "./components/Input";
  import Ranges from "./components/Ranges";
  import StatsWindow from "./components/StatsWindow";
  import { parseCopypastaNullable } from "./items";
  import { getUniqueInfo } from "./poedb";
  import {
    loadPropRanges,
    loadUniqueScore,
    savePropRanges,
    saveUniqueScore
  } from "./db";
  import { compareItemStatsNullable } from "./Item.re";

  let text;
  let stats;
  let propRanges;
  let comparison;

  $: if (text) {
    stats = parseCopypastaNullable(text);
  } else {
    stats = null;
    propRanges = null;
    comparison = null;
  }

  $: if (stats) {
    propRanges = loadPropRanges(stats.name);
    comparison = null;
  } else {
    propRanges = null;
    comparison = null;
  }

  $: if (stats && propRanges) {
    const score = loadUniqueScore(stats.name);
    const cmp = compareItemStatsNullable(
      stats.explicitMods,
      propRanges.explicitMods
    );
    if (cmp === null) {
      alert("This is a legacy item");
    } else {
      comparison = {
        ...cmp,
        ...{ savedScore: score === null ? undefined : score }
      };
    }
  }

  const onLoadClick = async () => {
    if (stats) {
      const { name } = stats;
      propRanges = await getUniqueInfo(name);
      savePropRanges(name, propRanges);
    }
  };

  const onSaveClick = () => {
    if (!stats || !comparison) return;

    const { name } = stats;
    const { score } = comparison;
    saveUniqueScore(name, score);
  };
</script>

<style>
  main {
    align-self: center;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    column-gap: 10px;
    min-width: 700px;
    width: 100%;
    height: 475px;
    padding: 0 40px;
  }
</style>

<main>
  <Input bind:text />
  <StatsWindow {stats} />
  <Ranges
    ranges={propRanges}
    buttonLabel="Load from PoeDB"
    disabled={!stats}
    on:buttonClick={onLoadClick} />
  <Ranges
    ranges={comparison}
    buttonLabel="Save as collected"
    disabled={!comparison}
    on:buttonClick={onSaveClick} />
</main>
