
import { clamp, Rect, Point } from 'mathutil'

const defaultSettings = {
  zoomRange: [1, 4],
  cellSize: Point.of(10, 10)
}

/**
 * Tried to scale linearly, but, it didn’t work so well, so zooming will be
 * exponential for now which works with ^2 viewports nicely. Non ^2 viewports
 * sometimes work, depends on whether applied scaling results in the same size
 * of viewport (floats won't work for viewport currently, only ints)
 */
export class Camera {
  constructor ({
    // Container to attach to
    container = null,

    // Current viewport being rendered
    viewport = Rect.of(0, 0, 16, 16),

    // Current bounds of camera movement in world
    bounds = Rect.of(0, 0, 16, 16),

    // sprite pool to use for tiles
    pool = null,

    // Zoom settings -- disable for now as it mucks with max viewport calcs.
    // If you want to start zoomed, then setZoom after instantiation
    // zoom = 1,

    // Additional settings
    settings = {}
  } = {}) {
    this.container = container
    this.viewport = viewport
    this.bounds = bounds
    // this.zoom = zoom
    this.zoom = 1
    this.settings = {
      ...defaultSettings,
      ...settings
    }

    // Scale is applied at render to sprites, we calculate eagerly as don’t
    // really want an unnecessary power application during render loop
    this._scale = Math.pow(2, this.zoom - 1)

    // With maxViewport we're really after dimensions, this will give it to us
    // but x1, y1 will not necessarily be 0, which is probably unexpected.
    this.maxViewport = Rect.scale(this.viewport, this._scale)
  }

  static of (params = {}) {
    return new Camera(params)
  }

  /**
   * Returns the current screen bounding dimensions
   */
  getScreenBounds () {
    return Point.of(
      (this.viewport.width * this._scale) * this.settings.cellSize.x,
      (this.viewport.height * this._scale) * this.settings.cellSize.y
    )
  }

  /**
   * Resizes the viewport.
   * If the camera is zoomed then it unzooms, resizes, and rezooms. Some funkiness
   * _might_ occur.
   */
  resize (rect) {
    if (this._scale === 1) {
      this._setViewport(rect)
      this.maxViewport = Rect.of(this.viewport)
      return
    }

    const cached = this.zoom

    this.setZoom(1)

    this._setViewport(rect)
    this.maxViewport = Rect.scale(this.viewport, this._scale)

    this.setZoom(cached)
  }

  /**
   * Sets the viewport to a new Rect, and allocates more pool items if necessary.
   */
  _setViewport (rect) {
    this.viewport = rect
    this.checkViewportBounds()
  }

  /**
   * Checks if a Point is visible
   */
  isVisible (x, y) {
    if (!y) {
      x = x.x
      y = x.y
    }

    return (!(
      x < this.viewport.pos[0] ||
      y < this.viewport.pos[1] ||
      x >= this.viewport.pos[2] ||
      y >= this.viewport.pos[3]
    ))
  }

  /**
   * Set the scale based on the zoom level.
   * Zoom level is a linear range, but, it scales exponentially.
   */
  _setScale (zoom) {
    this._scale = Math.pow(2, zoom - 1)
  }

  /**
   * Zoom methods
   * @TODO due to the way culling works, zoom levels should be integers, or the
   * viewport will get in to an odd state, which should be handled by padding
   * floats and rendering with clipping (can an exterior container do an
   * overflow: hidden type of thing?). For now keep viewports ^2.
   */

  /**
   * Clamps zoom to the specified zoom range
   */
  _checkZoom () {
    const [min, max] = this.settings.zoomRange
    this.zoom = clamp(this.zoom, min, max)
  }

  /**
   * Sets the zoom level, which also sets the scale under the hood.
   * This ends up resetting the viewport also.
   */
  setZoom (zoom) {
    if (!zoom || zoom === this.zoom) {
      return
    }

    this.zoom = zoom
    this._checkZoom()

    this._setScale(this.zoom)

    // Calculate new viewport based on new zoom level (which is exponential)
    const desired = Rect.scale(this.maxViewport, 1 / this._scale)
    const diffX = this.viewport.width - desired.width
    const diffY = this.viewport.height - desired.height
    const newView = Rect.constrict(this.viewport, diffX * 0.5, diffY * 0.5)

    this._setViewport(newView)
  }

  /**
   * Inc current zoom by supplied amount
   * @param {integer} [amount=0] - the amount to apply to the current zoom
   */
  applyZoom (amount = 0) {
    this.setZoom(this.zoom + amount)
  }

  /**
   * Translation methods.
   * @TODO panning is currently instantaneous, add anim functions and rename
   * pan to snap and snapTo.
   */
  /**
   * @TODO This assumes the map fits in the viewport, which is not always correct,
   * we need to supply a max world boundary to clamp the camera to.
   */
  checkViewportBounds () {
    // @TODO this could all be more efficient
    if (this.viewport.pos[0] < 0) {
      this.viewport.translate(-this.viewport.pos[0], 0)
    }

    if (this.viewport.pos[1] < 0) {
      this.viewport.translate(0, -this.viewport.pos[1])
    }

    if (this.viewport.pos[2] > this.bounds.pos[2]) {
      this.viewport.translate(-(this.viewport.pos[2] - this.bounds.pos[2]), 0)
    }

    if (this.viewport.pos[3] > this.bounds.pos[3]) {
      this.viewport.translate(0, -(this.viewport.pos[3] - this.bounds.pos[3]))
    }
  }

  pan (x, y) {
    if (x instanceof Point) {
      this.pan(x.x, x.y)
      return
    }

    this.viewport.translate(x, y)
    this.checkViewportBounds()
  }

  panTo (x, y) {
    if (x instanceof Point) {
      this.panTo(x.x, x.y)
      return
    }

    this.viewport.translate(
      x - this.viewport.pos[0],
      y - this.viewport.pos[1]
    )
    this.checkViewportBounds()
  }

  /**
   * Translates a single sprite from world coords to screen/camera coords.
   */
  translateSprite (sprite, x, y) {
    if (this.isVisible({ x, y })) {
      sprite.visible = false
      return
    }

    sprite.visible = true
    sprite.position.set(
      (x - this.viewport.pos[0]) * this.settings.cellSize.x * this._scale,
      (y - this.viewport.pos[1]) * this.settings.cellSize.y * this._scale
    )
    sprite.scale.set(this._scale)
  }
}
