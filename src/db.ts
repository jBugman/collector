import { saveAs } from 'file-saver';

import { trimPrefix } from './Utils.re';
import { props_key as PROPS_KEY, score_key as SCORE_KEY } from './DB.re';

interface DBDump {
  scores: Record<string, number>;
  props: Record<string, object>;
}

const dumpDB = () => {
  const entries = Object.entries(window.localStorage);
  const result: DBDump = {
    scores: {},
    props: {},
  };
  entries.forEach(([k, v]) => {
    if (k.startsWith(PROPS_KEY)) {
      const name = trimPrefix(PROPS_KEY, k);
      result.props[name] = JSON.parse(v);
    } else if (k.startsWith(SCORE_KEY)) {
      const name = trimPrefix(SCORE_KEY, k);
      result.scores[name] = parseFloat(v);
    }
  });
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, 'database.json');
};

declare global {
  interface Window {
    saveCollectorDB: () => void;
  }
}

window.saveCollectorDB = dumpDB;
