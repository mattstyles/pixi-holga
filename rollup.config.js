
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import { uglify } from 'rollup-plugin-uglify'
// import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const bubleOptions = {
  exclude: ['node_modules/**'],
  objectAssign: true
}

const umd = {
  name: 'Holga',
  file: 'dist/pixi-holga.js'
}

export default [
  // umd
  {
    input: 'src/index.js',
    output: {
      name: umd.name,
      file: umd.file,
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      buble(bubleOptions),
      uglify({
        sourcemap: true
      })
    ]
  },
  // cjs/es
  {
    input: 'src/index.js',
    external: ['mathutil'],
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      }
    ],
    plugins: [
      buble(bubleOptions)
      // terser()
    ]
  }
]
