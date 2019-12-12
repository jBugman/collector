/* globals DOMParser, fetch */
import { PropRanges } from './types';

const proxy = 'https://cors-anywhere.herokuapp.com/'; // TODO: use own proxy

const getURL = (name: string): string => {
  name = name.replace('\'', '').replace(' ', '_');
  return proxy + `https://poedb.tw/us/unique.php?n=${name}`;
};

const parseModBlock = (el: Element): string[] =>
  [...el.childNodes] // triplets of (span, text, br)
    .reduce((xs: Node[][], x: Node) => {
      if (x.nodeName === 'BR') {
        return [...xs, []];
      } else
      if (x.nodeName === 'SPAN' && (x as Element).className === 'item_description') {
        return xs;
      } else {
        const ys = xs.pop() || [];
        return [...xs, [...ys, x]];
      }
    }, [])
    .filter(x => x.length > 0)
    .map((xs: Node[]) =>
      xs.map((x: Node) => x.textContent).join(''));

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
