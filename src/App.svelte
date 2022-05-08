<script lang="ts">
  import type { RawItem, Scores, ItemScores } from "./types";
  import Button from "./components/Button.svelte";
  import Input from "./components/Input.svelte";
  import Ranges from "./components/Ranges.svelte";
  import StatsWindow from "./components/StatsWindow.svelte";
  import { parseCopypastaNullable } from "./items";
  import { getPoedbInfo } from "./poedb";
  import { getWikiInfo, filterBadMods } from "./Source.res";
  import {
    loadPropRanges,
    loadUniqueScore,
    savePropRanges,
    saveUniqueScore,
  } from "./DB.res";
  import { compareItemStatsNullable } from "./Item.res";

  let text = "";

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
      : null;

  $: error = comparison === null ? "This is a legacy item" : null;

  $: scores = !comparison
    ? null
    : ({
        ...comparison,
        savedScore: score === null ? undefined : score,
      } as Scores);

  const onLoadPoedbClick = async () => {
    const { name } = stats as RawItem;
    rawPropRanges = filterBadMods(await getPoedbInfo(name));
    savePropRanges(name, rawPropRanges);
  };

  const onLoadWikiClick = async () => {
    const { name } = stats as RawItem;
    rawPropRanges = filterBadMods(await getWikiInfo(name));
    savePropRanges(name, rawPropRanges);
  };

  const onSaveClick = () => {
    const { name } = stats as RawItem;
    const { score } = comparison as ItemScores;
    saveUniqueScore(name, score);
  };
</script>

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
