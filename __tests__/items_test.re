open Jest;
open Expect;

type item = Item.rawItem;

[@bs.module "../src/items"]
external parse: string => option(item) = "parseCopypasta";

describe("Parse", () => {
  test("toBe", () => {
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

    let correct: item = {name: "Frozen Trail", rarity: "Unique", ilvl: 82};

    expect(parse(text)) |> toBe(Some(correct));
  })
});
