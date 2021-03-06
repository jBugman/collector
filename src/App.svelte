<script>
  import Button from "./components/Button.svelte";
  import Input from "./components/Input.svelte";
  import Ranges from "./components/Ranges.svelte";
  import StatsWindow from "./components/StatsWindow.svelte";
  import { parseCopypastaNullable } from "./items.ts";
  import { getPoedbInfo } from "./poedb.ts";
  import { getWikiInfo, filterBadMods } from "./Source.re";
  import {
    loadPropRanges,
    loadUniqueScore,
    savePropRanges,
    saveUniqueScore
  } from "./DB.re";
  import { compareItemStatsNullable } from "./Item.re";

  let text;

  $: stats = text ? parseCopypastaNullable(text) : null;

  $: displayedStats = stats
    ? { implicit: stats.implicitMods, explicit: stats.explicitMods }
    : null;

  $: score = stats ? loadUniqueScore(stats.name) : 0;

  $: rawPropRanges = stats ? loadPropRanges(stats.name) : null;
  $: propRanges = rawPropRanges ? filterBadMods(rawPropRanges) : null;

  $: comparison =
    !!stats && !!propRanges
      ? compareItemStatsNullable(stats.explicitMods, propRanges.explicitMods)
      : undefined;

  $: error = comparison === null ? "This is a legacy item" : null;

  $: scores = !comparison
    ? null
    : {
        ...comparison,
        savedScore: score === null ? undefined : score
      };

  const onLoadPoedbClick = async () => {
    const { name } = stats;
    rawPropRanges = filterBadMods(await getPoedbInfo(name));
    savePropRanges(name, rawPropRanges);
  };

  const onLoadWikiClick = async () => {
    const { name } = stats;
    rawPropRanges = filterBadMods(await getWikiInfo(name));
    savePropRanges(name, rawPropRanges);
  };

  const onSaveClick = () => {
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
  <StatsWindow stats={displayedStats} />
  <Ranges ranges={propRanges}>
    <Button on:click={onLoadWikiClick} disabled={!stats}>Load from Wiki</Button>
    <Button on:click={onLoadPoedbClick} disabled={!stats}>
      Load from PoeDB
    </Button>
  </Ranges>
  <Ranges {error} ranges={scores}>
    <Button on:click={onSaveClick} disabled={!comparison}>
      Save as collected
    </Button>
  </Ranges>
</main>
