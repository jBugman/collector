import babel from 'rollup-plugin-babel';
import html from 'rollup-plugin-bundle-html';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import env from 'rollup-plugin-inject-process-env';

const OUTPUT = 'output';
const EXTENSIONS = ['.ts', '.tsx'];
const PRODUCTION = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.tsx',

  output: {
    dir: OUTPUT,
    format: 'iife',
    sourcemap: true
  },

  plugins: [
    resolve({
      extensions: EXTENSIONS
    }),
    eslint(),
    babel({
      extensions: EXTENSIONS
    }),
    env({
      NODE_ENV: PRODUCTION ? 'production' : 'development'
    }),
    html({
      template: 'src/index.html',
      dest: OUTPUT
    }),
    serve({
      contentBase: OUTPUT,
      port: 3000
    })
  ]
};
