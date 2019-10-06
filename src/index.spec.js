
import tape from 'tape'
import { Rect, Point } from 'mathutil'

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

tape('Camera::of initial world bounds', t => {
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

tape('Camera::getScreenBounds', t => {
  t.plan(6)

  // Screen bounds are viewport [width, height] x scale x cellsize

  const c1 = Camera.of()
  const e1 = (16 * 1 * 10)
  t.deepEqual(
    c1.getScreenBounds().pos, [e1, e1],
    'Bounds for default values calculated correctly'
  )

  const c2 = Camera.of({
    viewport: Rect.of(0, 0, 24, 24)
  })
  const e2 = (24 * 1 * 10)
  t.deepEqual(
    c2.getScreenBounds().pos, [e2, e2],
    'screen bounds for square viewport correct'
  )

  const c3 = Camera.of({
    viewport: Rect.of(0, 0, 48, 32)
  })
  const e3 = Point.of(
    48 * 1 * 10,
    32 * 1 * 10
  )
  t.deepEqual(
    c3.getScreenBounds().pos, [e3.x, e3.y],
    'Bounds for non-square viewport correct'
  )

  const c4 = Camera.of({
    viewport: Rect.of(10, 10, 24, 24)
  })
  const e4 = (14 * 1 * 10)
  t.deepEqual(
    c4.getScreenBounds().pos, [e4, e4],
    'screen bounds correct when viewport is translated'
  )

  // the zoom multiplication is irrelevant as our expected values always
  // assume max viewport size
  const c5 = Camera.of({
    viewport: Rect.of(0, 0, 24, 24)
  })
  c5.setZoom(2)
  const e5 = (24 * 10)
  t.deepEqual(
    c5.getScreenBounds().pos, [e5, e5],
    'screen bounds correct when camera is zoomed'
  )

  const c6 = Camera.of({
    viewport: Rect.of(0, 0, 24, 24),
    settings: {
      cellSize: Point.of(16, 16)
    }
  })
  const e6 = (24 * 1 * 16)
  t.deepEqual(
    c6.getScreenBounds().pos, [e6, e6],
    'screen bounds correct when cell size changes'
  )
})
