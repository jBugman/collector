<script>
  import Button from "./components/Button";
  import Input from "./components/Input";
  import Ranges from "./components/Ranges";
  import StatsWindow from "./components/StatsWindow";
  import { parseCopypastaNullable } from "./items";
  import { getPoedbInfo } from "./poedb";
  import { getWikiInfo, filterBadMods } from "./Source.re";
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
  let error;

  $: if (text) {
    stats = parseCopypastaNullable(text);
  } else {
    error = null;
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
      error = "This is a legacy item";
      comparison = null;
    } else {
      error = null;
      comparison = {
        ...cmp,
        ...{ savedScore: score === null ? undefined : score }
      };
    }
  }

  const onLoadPoedbClick = async () => {
    if (stats) {
      const { name } = stats;
      propRanges = filterBadMods(await getPoedbInfo(name));
      savePropRanges(name, propRanges);
    }
  };

  const onLoadWikiClick = async () => {
    if (stats) {
      const { name } = stats;
      propRanges = filterBadMods(await getWikiInfo(name));
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
  <Ranges ranges={propRanges}>
    <Button on:click={onLoadPoedbClick} disabled={!stats}>
      Load from PoeDB
    </Button>
    <Button on:click={onLoadWikiClick} disabled={!stats}>Load from Wiki</Button>
  </Ranges>
  <Ranges {error} ranges={comparison}>
    <Button on:click={onSaveClick} disabled={!comparison}>
      Save as collected
    </Button>
  </Ranges>
</main>
