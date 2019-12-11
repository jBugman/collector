/* globals DOMParser, fetch */
const proxy = 'https://cors-anywhere.herokuapp.com/'; // TODO: use own proxy

const getURL = (name: string): string => {
  name = name.replace('\'', '').replace(' ', '_');
  return proxy + `https://poedb.tw/us/unique.php?n=${name}`;
};

const parseModBlock = (el: Element): string[] =>
  [...el.childNodes] // triplets of (span, text, br)
    .map((x, i, xs) => (i % 3 === 0) ? `${x.textContent}${xs[i + 1].textContent}` : null)
    .filter(x => !!x) as string[];

export interface PropRanges {
  implicitMods?: string[];
  explicitMods: string[];
}

export const getUniqueInfo = async (name: string): Promise<PropRanges> => {
  const url = getURL(name);
  const data = await fetch(url, { mode: 'cors' });
  return data.text().then(body => {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    const modBlocks = [...doc.getElementsByClassName('itemboxstatsgroup text-mod')];
    const ranges = modBlocks.length === 1 ? ({
      explicitMods: parseModBlock(modBlocks[0])
    }) : ({
      implicitMods: parseModBlock(modBlocks[0]),
      explicitMods: parseModBlock(modBlocks[1])
    });
    return ranges;
  });
};
