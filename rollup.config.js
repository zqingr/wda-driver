// rollup.config.js
import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

let plugins = [
  typescript(),
  resolve(),
  commonjs()
]

export default {
  plugins: plugins,
  input: 'src/main.ts',
	external: [ 'path', 'fs', 'url', 'request-promise' ],
  moduleName: 'wda',
  output: {
    file: 'dist/wda.js',
    format: 'cjs',
    sourcemap: true
  }
}