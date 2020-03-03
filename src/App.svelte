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
    propRanges = filterBadMods(await getPoedbInfo(name));
    savePropRanges(name, propRanges);
  };

  const onLoadWikiClick = async () => {
    const { name } = stats;
    propRanges = filterBadMods(await getWikiInfo(name));
    savePropRanges(name, propRanges);
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
    <Button on:click={onLoadPoedbClick} disabled={!stats}>
      Load from PoeDB
    </Button>
    <Button on:click={onLoadWikiClick} disabled={!stats}>Load from Wiki</Button>
  </Ranges>
  <Ranges {error} ranges={scores}>
    <Button on:click={onSaveClick} disabled={!comparison}>
      Save as collected
    </Button>
  </Ranges>
</main>
