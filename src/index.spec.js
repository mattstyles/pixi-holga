
import tape from 'tape'
import { Rect } from 'mathutil'

import { Camera } from './'

tape('Camera::of', t => {
  t.plan(2)

  const camera = Camera.of()

  t.equal(camera.zoom, 1, 'Initial zoom level is clamped at 1')
  t.equal(camera._scale, 1, 'Initial scale should also be clamped at 1')
})

tape('Camera::of maximum viewport is calculated at instantiation', t => {
  t.plan(1)

  const camera = Camera.of({
    viewport: Rect.of(0, 0, 10, 10)
  })

  t.deepEqual(
    camera._maxViewport.pos, [0, 0, 10, 10],
    'maximum viewport is correctly calculated'
  )
})
