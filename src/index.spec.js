
import tape from 'tape'

import { pre } from './'

tape('root::pre', t => {
  t.plan(1)

  t.equal(pre('A')('B'), 'AB', 'It prefixes')
})
