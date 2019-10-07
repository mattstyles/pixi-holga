
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

tape('Camera::setWorldBounds', t => {
  t.plan(2)

  const rect = Rect.of(0, 0, 30, 30)
  const cam = Camera.of()
  cam.setWorldBounds(rect)

  t.deepEqual(cam.bounds, rect, 'rect is applied as camera world boundary')

  t.throws(() => {
    cam.setWorldBounds()
  }, 'supplying anything other than a rect throws an error')
})

tape('Camera::resize', t => {
  t.plan(5)

  const c1 = Camera.of({
    viewport: Rect.of(0, 0, 8, 8),
    bounds: Rect.of(0, 0, 64, 64)
  })
  c1.resize(Rect.of(2, 4, 12, 24))
  t.deepEqual(
    c1.viewport.pos, [2, 4, 12, 24],
    'resize sets the viewport correctly at zoom 1'
  )
  t.deepEqual(
    c1._maxViewport.pos, [2, 4, 12, 24],
    'resize sets the max viewport correctly at zoom 1'
  )

  t.throws(() => {
    c1.resize('foo')
  }, 'resize accepts only a Rect')

  const c2 = Camera.of({
    viewport: Rect.of(0, 0, 8, 8),
    bounds: Rect.of(0, 0, 64, 64)
  })
  c2.setZoom(2)
  c2.resize(Rect.of(0, 0, 16, 16))
  t.deepEqual(
    c2.viewport.pos, [4, 4, 12, 12],
    'resize sets the viewport correctly whilst zoomed'
  )
  t.deepEqual(
    c2._maxViewport.pos, [0, 0, 16, 16],
    'resize sets the max viewport correctly whilst zoomed'
  )
})

tape('Camera::isVisible', t => {
  t.plan(10)

  const cam = Camera.of({
    viewport: Rect.of(0, 0, 16, 16)
  })

  t.ok(cam.isVisible(2, 8), 'Supplying x and y args works')
  t.ok(cam.isVisible(Point.of(1, 14)), 'Supplying as a Point works')
  t.ok(cam.isVisible({ x: 12, y: 3 }), 'Supplying as an object works')
  t.ok(cam.isVisible(0, 0), 'The leading edge is visible')
  t.ok(cam.isVisible(15, 15), 'The rear edge is visible')

  t.notOk(cam.isVisible(16, 16), 'The viewport max bounds are not visible')
  t.notOk(cam.isVisible(-2, -2), 'Negative coords can be supplied')
  t.notOk(cam.isVisible(24, 52), 'Outside returns false')
  t.notOk(cam.isVisible(12, 77), 'y outside returns false')
  t.notOk(cam.isVisible(-17, 4), 'x outside returns false')
})

tape('Camera::_setScale', t => {
  t.plan(2)

  const c = Camera.of()
  c.setZoom(2)
  c._setScale()
  t.equal(c._scale, 2, '_setScale should use this.zoom when zoom is not supplied')

  c._setScale(3)
  t.equal(c._scale, 4, '_setScale exponentially rises based on the zoom level')
})

tape('Camera::_clampZoom', t => {
  t.plan(6)

  const c1 = Camera.of()
  c1.setZoom(8)
  t.equal(c1.zoom, 4, 'Zoom is clamped to default max zoom')
  c1.setZoom(-2)
  t.equal(c1.zoom, 1, 'Zoom is clamped to default min zoom')
  c1.setZoom(2)
  t.equal(c1.zoom, 2, 'Zoom is changed when in the clamp range')

  const c2 = Camera.of({
    settings: {
      zoomRange: [2, 6]
    }
  })
  c2.setZoom(8)
  t.equal(c2.zoom, 6, 'Zoom is clamped to supplied max zoom')
  c2.setZoom(1)
  t.equal(c2.zoom, 2, 'Zoom is clamped to supplied min zoom')
  c2.setZoom(3)
  t.equal(c2.zoom, 3, 'Zoom is changed when in the supplied clamp range')
})

tape('Camera::setZoom', t => {
  t.plan(4)

  const c1 = Camera.of({
    viewport: Rect.of(0, 0, 16, 16)
  })
  c1.setZoom(2)
  t.deepEqual(c1.viewport.pos, [4, 4, 12, 12], 'zooms in correctly')
  c1.setZoom(1)
  t.deepEqual(c1.viewport.pos, [0, 0, 16, 16], 'zooms out correctly')

  const c2 = Camera.of({
    viewport: Rect.of(4, 0, 12, 8)
  })
  c2.setZoom(2)
  t.deepEqual(c2.viewport.pos, [6, 2, 10, 6], 'zooms in when translated')

  const c3 = Camera.of({
    viewport: Rect.of(0, 0, 32, 16)
  })
  c3.setZoom(2)
  t.deepEqual(c3.viewport.pos, [8, 4, 24, 12], 'zooms in with a rectangular viewport')
})

tape('Camera::applyZoom', t => {
  t.plan(5)

  const c = Camera.of()

  c.applyZoom(1)
  t.equal(c.zoom, 2, 'Zooms in')
  c.applyZoom(-1)
  t.equal(c.zoom, 1, 'Zooms out')
  c.applyZoom(3)
  t.equal(c.zoom, 4, 'Zooms in a lot')
  c.applyZoom(3)
  t.equal(c.zoom, 4, 'Zoom is clamped to max')
  c.applyZoom(-10)
  t.equal(c.zoom, 1, 'Zoom is clamped to min')
})

tape('Camera::pan', t => {
  t.plan(8)

  const c = Camera.of({
    viewport: Rect.of(0, 0, 8, 8),
    bounds: Rect.of(0, 0, 128, 128)
  })

  c.pan(4, 0)
  t.deepEqual(c.viewport.pos, [4, 0, 12, 8], 'positive x ok')
  c.pan(160, 0)
  t.deepEqual(c.viewport.pos, [120, 0, 128, 8], 'clamped to world bounds positive x')
  c.pan(-2, 0)
  t.deepEqual(c.viewport.pos, [118, 0, 126, 8], 'negative x ok')
  c.pan(-160, 0)
  t.deepEqual(c.viewport.pos, [0, 0, 8, 8], 'clamped to world bounds negative x')

  c.pan(0, 6)
  t.deepEqual(c.viewport.pos, [0, 6, 8, 14], 'positive y ok')
  c.pan(0, 180)
  t.deepEqual(c.viewport.pos, [0, 120, 8, 128], 'clamped to world bounds positive y')
  c.pan(0, -10)
  t.deepEqual(c.viewport.pos, [0, 110, 8, 118], 'negative y ok')
  c.pan(0, -160)
  t.deepEqual(c.viewport.pos, [0, 0, 8, 8], 'clamped to world bounds negative y')
})

tape('Camera::panTo', t => {
  t.plan(5)

  const c = Camera.of({
    viewport: Rect.of(0, 0, 8, 8),
    bounds: Rect.of(0, 0, 128, 128)
  })

  c.panTo(44, 15)
  t.deepEqual(c.viewport.pos, [44, 15, 52, 23], 'Pans to a location ok')
  c.panTo(-10, 24)
  t.deepEqual(c.viewport.pos, [0, 24, 8, 32], 'Clamped to minimum x')
  c.panTo(180, 0)
  t.deepEqual(c.viewport.pos, [120, 0, 128, 8], 'Clamped to maximum x')
  c.panTo(0, -200)
  t.deepEqual(c.viewport.pos, [0, 0, 8, 8], 'Clamped to minimum x')
  c.panTo(16, 180)
  t.deepEqual(c.viewport.pos, [16, 120, 24, 128], 'Clamped to maximum x')
})

tape('Camera::translateSprite', t => {
  t.plan(4)

  const c = Camera.of({
    viewport: Rect.of(16, 16, 32, 32),
    bounds: Rect.of(0, 0, 64, 64)
  })

  class Sprite {
    constructor (pos, scale, visible) {
      this.pos = pos
      this.scale = scale
      this.visible = visible

      this.position = {
        set: (x, y) => {
          this.pos = [x, y]
        }
      }

      this.scale = {
        set: (s) => {
          this.scale = s
        }
      }
    }
  }

  const s1 = new Sprite([0, 4], 2, false)
  c.translateSprite(s1, 16, 16)
  t.deepEqual(s1.pos, [0, 0], 'translates to screen coords')
  t.equal(s1.scale, 1, 'sets the scale for the sprite')
  t.equal(s1.visible, true, 'sets the sprite as visible')

  const s2 = new Sprite([12, 12], 1, true)
  c.translateSprite(s2, 128, 2)
  t.equal(s2.visible, false, 'sets the sprite as not visible if outside viewport')
})

tape('Camera::toScreenCoords', t => {
  t.plan(4)

  const c = Camera.of({
    viewport: Rect.of(0, 0, 8, 8),
    settings: {
      cellSize: Point.of(10, 10)
    }
  })

  t.deepEqual(c.toScreenCoords(0, 0).pos, [0, 0], 'origin is mapped correctly')
  t.deepEqual(c.toScreenCoords(2, 2).pos, [20, 20], 'same x and same y works')
  t.deepEqual(c.toScreenCoords(7, 4).pos, [70, 40], 'different x and y works')
  t.deepEqual(
    c.toScreenCoords(12, 12).pos, [120, 120],
    'non visible locations will still be mapped'
  )
})

tape('Camera::toWorldCoords', t => {
  t.plan(4)

  const c = Camera.of({
    viewport: Rect.of(0, 0, 8, 8),
    settings: {
      cellSize: Point.of(10, 10)
    }
  })

  t.deepEqual(c.toWorldCoords(0, 0).pos, [0, 0], 'origin is mapped correctly')
  t.deepEqual(c.toWorldCoords(30, 30).pos, [3, 3], 'same x and same y works')
  t.deepEqual(c.toWorldCoords(45, 72).pos, [4, 7], 'world coords are rounded down')
  t.deepEqual(
    c.toWorldCoords(120, 110).pos, [12, 11],
    'non visible locations will still be mapped'
  )
})
