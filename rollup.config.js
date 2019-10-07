
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

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
    external: [
      ...Object.keys(pkg.dependencies)
    ],
    output: {
      name: umd.name,
      file: umd.file,
      format: 'umd',
      sourcemap: true,
      globals: {
        mathutil: 'Mathutil',
        eventemitter3: 'EventEmitter3'
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      buble(bubleOptions),
      terser({
        sourcemap: true
      }),
      filesize()
    ]
  },
  // cjs/es
  {
    input: 'src/index.js',
    external: [
      ...Object.keys(pkg.dependencies)
    ],
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
      buble(bubleOptions),
      filesize()
    ]
  }
]
