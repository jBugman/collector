open Jest;
open Expect;

type item = Item.rawItem;

[@bs.module "../src/items"]
external parse: string => option(item) = "parseCopypasta";

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

    expect(parse(text)) |> toEqual(Some(correct));
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

    expect(parse(text)) |> toEqual(Some(correct));
  });
});
