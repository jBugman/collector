open Jest;
open Expect;

type item = Item.rawItem;

[@bs.module "../src/items"]
external parse: string => Js.Nullable.t(item) = "parseCopypastaNullable";

describe("Parse", () => {
  test("Frozen Trail", () => {
    let text =
      {js|
Rarity: Unique
Frozen Trail
Cobalt Jewel
--------
Limited to: 2
Radius: Medium
--------
Item Level: 82
--------
10% increased Projectile Damage
With at least 40 Intelligence in Radius, Frostbolt fires 2 additional Projectiles
With at least 40 Intelligence in Radius, Frostbolt Projectiles gain 40% increased Projectile Speed per second
--------
The Maraketh knew that a mountain path
free of vegetation was cut by regular avalanches,
and so the advancing Eternals were unwittingly drawn into a deathtrap.
--------
Place into an allocated Jewel Socket on the Passive Skill Tree. Right click to remove from the Socket.
    |js}
      |> Js.String.trim;

    let correct: item = {
      name: "Frozen Trail",
      rarity: "Unique",
      itemClass: "Jewel",
      typeLine: "Cobalt Jewel",
      ilvl: 82,
      implicitMods: [||],
      explicitMods: [|
        "10% increased Projectile Damage",
        "With at least 40 Intelligence in Radius, Frostbolt fires 2 additional Projectiles",
        "With at least 40 Intelligence in Radius, Frostbolt Projectiles gain 40% increased Projectile Speed per second",
      |],
    };
    let correct = Js.Nullable.return(correct);

    expect(parse(text)) |> toEqual(correct);
  });

  test("Lifesprig", () => {
    let text =
      {js|
Rarity: Unique
Lifesprig
Driftwood Wand
--------
Wand
Physical Damage: 5-9
Critical Strike Chance: 7.00%
Attacks per Second: 1.40
--------
Sockets: B-B B
--------
Item Level: 80
--------
10% increased Spell Damage (implicit)
--------
+1 to Level of Socketed Spell Gems
21% increased Spell Damage
6% increased Cast Speed
+15 to maximum Life
+20 to maximum Mana
Regenerate 8 Life over 1 second when you Cast a Spell
--------
From the smallest seeds
To the tallest redwoods,
Life endures in Wraeclast.
    |js}
      |> Js.String.trim;

    let correct: item = {
      name: "Lifesprig",
      rarity: "Unique",
      itemClass: "Weapon",
      typeLine: "Driftwood Wand",
      ilvl: 80,
      implicitMods: [|"10% increased Spell Damage"|],
      explicitMods: [|
        "+1 to Level of Socketed Spell Gems",
        "21% increased Spell Damage",
        "6% increased Cast Speed",
        "+15 to maximum Life",
        "+20 to maximum Mana",
        "Regenerate 8 Life over 1 second when you Cast a Spell",
      |],
    };
    let correct = Js.Nullable.return(correct);

    expect(parse(text)) |> toEqual(correct);
  });
});

describe("Generalize mod", () => {
  module Dict = Js.Dict;
  open Item;

  test("Simple mod", () => {
    let text = "21% increased Spell Damage";
    let correct: itemMod = (
      "X% increased Spell Damage",
      Dict.fromList([("X", 21.0)]),
    );
    expect(generalizeMod(text)) |> toEqual(correct);
  });

  test("Two-value mod", () => {
    let text = "Adds 1 to 41 Lightning Damage";
    let correct: itemMod = (
      "Adds X to Y Lightning Damage",
      Dict.fromList([("X", 1.0), ("Y", 41.0)]),
    );
    expect(generalizeMod(text)) |> toEqual(correct);
  });

  test("Float mod", () => {
    let text = "1.47% of Physical Attack Damage Leeched as Life";
    let correct: itemMod = (
      "X% of Physical Attack Damage Leeched as Life",
      Dict.fromList([("X", 1.47)]),
    );
    expect(generalizeMod(text)) |> toEqual(correct);
  });
});

describe("Generalize mod range", () => {
  module Dict = Js.Dict;
  open Item;
  test("Simple mod", () => {
    let text = {js|(10–20)% increased Elemental Damage|js};
    let correct: modRange = (
      "X% increased Elemental Damage",
      Dict.fromList([("X", (10.0, 20.0))]),
    );
    expect(generalizeModRange(text)) |> toEqual(correct);
  });

  test("Double-range mod", () => {
    let text = {js|Adds (2–5) to (7–10) Physical Damage to Attacks|js};
    let correct: modRange = (
      "Adds X to Y Physical Damage to Attacks",
      Dict.fromList([("X", (2.0, 5.0)), ("Y", (7.0, 10.0))]),
    );
    expect(generalizeModRange(text)) |> toEqual(correct);
  });
});

describe("Scale mod", () => {
  module Dict = Js.Dict;

  test("Single var", () => {
    let mods = Dict.fromList([("X", 15.0)]);
    let ranges = Dict.fromList([("X", (10.0, 20.0))]);
    let correct = Some(0.5);
    expect(Item.scaleMod(mods, ranges)) |> toEqual(correct);
  });

  test("Two vars", () => {
    let mods = Dict.fromList([("X", 15.0), ("Y", 2.0)]);
    let ranges = Dict.fromList([("Y", (2.0, 3.0)), ("X", (10.0, 20.0))]);
    let correct = Some(0.25);
    expect(Item.scaleMod(mods, ranges)) |> toEqual(correct);
  });

  test("Out of bounds low", () => {
    let mods = Dict.fromList([("X", 5.0)]);
    let ranges = Dict.fromList([("X", (10.0, 20.0))]);
    let correct = None;
    expect(Item.scaleMod(mods, ranges)) |> toEqual(correct);
  });

  test("Out of bounds high", () => {
    let mods = Dict.fromList([("X", 50.0)]);
    let ranges = Dict.fromList([("X", (10.0, 20.0))]);
    let correct = None;
    expect(Item.scaleMod(mods, ranges)) |> toEqual(correct);
  });
});

describe("Compare mods", () => {
  module Dict = Js.Dict;

  test("Different mods legacy", () => {
    let mods = [|"+15 to maximum Life", "+20 to maximum Mana"|];
    let ranges = [|
      {js|+(15–20) to maximum Life|js},
      {js|(5–8)% increased Cast Speed|js},
    |];
    let correct = Item.Legacy;
    expect(Item.compareItemStats(mods, ranges)) |> toEqual(correct);
  });

  test("Different values legacy", () => {
    let mods = [|"+15 to maximum Life", "+20 to maximum Mana"|];
    let ranges = [|
      {js|+(15–20) to maximum Life|js},
      {js|+(100–200) to maximum Mana|js},
    |];
    let correct = Item.Legacy;
    expect(Item.compareItemStats(mods, ranges)) |> toEqual(correct);
  });

  test("Regular item", () => {
    let mods = [|"+15 to maximum Life", "+20 to maximum Mana"|];
    let ranges = [|
      {js|+(15–20) to maximum Life|js},
      {js|+(15–20) to maximum Mana|js},
    |];
    let correct =
      Item.Scores({
        mods:
          Dict.fromList([
            ("X to maximum Life", 0.),
            ("X to maximum Mana", 1.),
          ]),
        score: 0.5,
      });
    expect(Item.compareItemStats(mods, ranges)) |> toEqual(correct);
  });
});
