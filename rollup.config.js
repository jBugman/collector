import bucklescript from 'rollup-plugin-bucklescript';
import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import clear from 'rollup-plugin-clear';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy-assets';

const DEV = process.env.NODE_ENV === 'dev';
const TEST = process.env.NODE_ENV === 'test';
const OUTPUT = 'dist';

export default [
  ...!TEST ? [
    {
      input: 'src/Index.re',
      output: {
        file: `${OUTPUT}/app.js`,
        format: 'iife',
        sourcemap: true,
      },
      plugins: [
        clear({
          targets: [OUTPUT],
        }),
        resolve(),
        bucklescript(),
        svelte(),
        typescript({
          sourceMap: true,
        }),
        ...DEV ? [
          serve({
            contentBase: OUTPUT,
            port: 3000,
          }),
        ] : [
          terser(),
        ],
        copy({
          assets: [
            'src/index.html',
            'src/global.css'
          ],
        })
      ],
    },
  ] : [
    {
      input: 'tests/items_test.re',
      output: {
        file: `${OUTPUT}/items.test.js`,
        format: 'cjs',
      },
      plugins: [
        clear({
          targets: [OUTPUT],
        }),
        resolve(),
        bucklescript(),
        typescript({
          sourceMap: false,
        }),
      ],
    },
  ],
];
