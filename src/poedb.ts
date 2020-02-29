import { PropRanges } from './types';
import { poedbURL } from './Source.re';

const parseModBlock = (el: Element): string[] =>
  [...el.childNodes] // triplets of (span, text, br)
    .reduce((xs: Node[][], x: Node) => {
      // Start new line on a <br>
      if (x.nodeName === 'BR') {
        return [...xs, []];
      }
      // Skip meta info
      const className = x.nodeName === 'SPAN' && (x as Element).className;
      if (className === 'item_description' || className === 'mod_grey') {
        return xs;
      }
      // Append useful data
      const ys = xs.pop() || [];
      return [...xs, [...ys, x]];
    }, [])
    .filter(x => x.length > 0)
    .map((xs: Node[]) =>
      xs.map((x: Node) => x.textContent).join(''));

export const getUniqueInfo = async (name: string): Promise<PropRanges> => {
  const url = poedbURL(name);
  const data = await fetch(url, { mode: 'cors' });
  return data.text().then(body => {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    const itemBlocks = doc.getElementsByClassName('itembox-gem')[0];
    const modBlocks = [...itemBlocks.getElementsByClassName('itemboxstatsgroup text-mod')];
    const ranges = modBlocks.length === 1 ? ({
      explicitMods: parseModBlock(modBlocks[0])
    }) : ({
      implicitMods: parseModBlock(modBlocks[0]),
      explicitMods: parseModBlock(modBlocks[1])
    });
    return ranges;
  });
};
