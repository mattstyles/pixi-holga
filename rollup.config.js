
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'

import pkg from './package.json'

const bubleOptions = {
  exclude: ['node_modules/**'],
  objectAssign: true
}

export default [
  {
    input: 'src/index.js',
    output: {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(),
      buble(bubleOptions)
    ]
  },
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
    ]
  }
]
