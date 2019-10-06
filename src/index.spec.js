
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

tape('Camera::of default setting overrides', t => {
  t.plan(4)

  const c1 = Camera.of({
    viewport: Rect.of(0, 0, 2, 2)
  })
  t.deepEqual(c1.viewport.pos, [0, 0, 2, 2], 'viewport assigned correctly')
  t.ok(c1.container === null, 'other props are assigned correctly')

  const c2 = Camera.of({
    bounds: Rect.of(0, 0, 12, 12)
  })
  t.deepEqual(c2.bounds.pos, [0, 0, 12, 12], 'bounds are correctly')
  t.deepEqual(c2.viewport.pos, [0, 0, 16, 16], 'default viewport is assigned correctly')
})

tape('Camera:of initial world bounds', t => {
  t.plan(7)

  const c1 = Camera.of()
  t.notOk(
    c1.bounds === c1.viewport,
    'Default viewport and bounds are separate objects'
  )

  const c2 = Camera.of({
    viewport: Rect.of(0, 0, 4, 4)
  })
  t.deepEqual(c2.viewport.pos, [0, 0, 4, 4], 'viewport is assigned correctly')
  t.deepEqual(c2.bounds.pos, [0, 0, 4, 4], 'bounds match initial viewport')

  const c3 = Camera.of({
    bounds: Rect.of(0, 0, 24, 24)
  })
  t.deepEqual(c3.viewport.pos, [0, 0, 16, 16], 'viewport is assigned correctly')
  t.deepEqual(c3.bounds.pos, [0, 0, 24, 24], 'bounds match initial viewport')

  const c4 = Camera.of({
    viewport: Rect.of(0, 0, 5, 5),
    bounds: Rect.of(0, 0, 20, 20)
  })
  t.deepEqual(c4.viewport.pos, [0, 0, 5, 5], 'viewport is assigned correctly')
  t.deepEqual(c4.bounds.pos, [0, 0, 20, 20], 'bounds are assigned correctly')
})
