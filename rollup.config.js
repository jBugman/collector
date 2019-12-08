import typescript from 'rollup-plugin-typescript2';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';

const OUTPUT = 'output';

export default {
  input: 'src/index.ts',

  output: {
    dir: OUTPUT,
    format: 'iife',
    sourcemap: true,
  },

  plugins: [
    html(),
    typescript({
      objectHashIgnoreUnknownHack: true,
    }),
    serve({
      contentBase: OUTPUT,
      port: 3000,
    }),
  ],
};
