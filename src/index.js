
import { clamp, Rect, Point } from 'mathutil'

const defaultSettings = {
  zoomRange: [1, 4],
  cellSize: Point.of(10, 10)
}

const defaultCameraOptions = {
  viewport: Rect.of(0, 0, 16, 16)
}

const setInitialBounds = (bounds, viewport, def) => {
  if (bounds) {
    return bounds
  }

  return Rect.of(viewport || def)
}

const setScale = zoom => {
  return Math.pow(2, zoom - 1)
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
    viewport = null,

    // Current bounds of camera movement in world
    bounds = null,

    // Zoom settings -- disable for now as it mucks with max viewport calcs.
    // If you want to start zoomed, then setZoom after instantiation
    // zoom = 1,

    // Additional settings
    settings = {}
  } = {}) {
    this.container = container
    this.viewport = viewport || Rect.of(defaultCameraOptions.viewport)

    // Set bounds to either the supplied bounds rect or the viewport, or the default
    this.bounds = setInitialBounds(bounds, viewport, defaultCameraOptions.viewport)

    // this.zoom = zoom
    this.zoom = 1
    this.settings = Object.assign({},
      defaultSettings,
      settings
    )

    // Scale is applied at render to sprites, we calculate eagerly as don’t
    // really want an unnecessary power application during render loop
    this._scale = setScale(this.zoom)

    // With _maxViewport we're really after dimensions, this will give it to us
    // but x1, y1 will not necessarily be 0, which is probably unexpected.
    this._maxViewport = Rect.scale(this.viewport, this._scale)
  }

  static of (params = {}) {
    return new Camera(params)
  }

  /**
   * Returns the current screen bounding dimensions
   */
  getScreenBounds () {
    return Point.of(
      this.viewport.width * this._scale * this.settings.cellSize.x,
      this.viewport.height * this._scale * this.settings.cellSize.y
    )
  }

  /**
   * Set world bounds for the camera
   */
  setWorldBounds (rect) {
    if (!(rect instanceof Rect)) {
      throw new Error('Camera::setWorldBounds requires a Rect')
    }

    this.bounds = rect

    return this
  }

  /**
   * Resizes the viewport.
   * If the camera is zoomed then it unzooms, resizes, and rezooms. Some
   * funkiness _might_ occur.
   */
  resize (rect) {
    if (!(rect instanceof Rect)) {
      throw new Error('Camera::resize requires a Rect')
    }

    if (this._scale === 1) {
      this._setViewport(rect)
      this._maxViewport = Rect.of(this.viewport)
      return
    }

    const cached = this.zoom

    this.setZoom(1)

    this._setViewport(rect)
    this._maxViewport = Rect.scale(this.viewport, this._scale)

    this.setZoom(cached)

    return this
  }

  /**
   * Sets the viewport to a new Rect.
   */
  _setViewport (rect) {
    this.viewport = rect
    this._clampViewportBounds()
  }

  /**
   * Checks if a Point is visible
   */
  isVisible (x, y) {
    if (typeof y === 'undefined') {
      y = typeof x.y === 'undefined' ? x.pos.y : x.y
      x = typeof x.x === 'undefined' ? x.pos.x : x.x
    }

    return (
      x >= this.viewport.pos[0] &&
      y >= this.viewport.pos[1] &&
      x < this.viewport.pos[2] &&
      y < this.viewport.pos[3]
    )
  }

  /**
   * Zoom methods
   * @TODO due to the way culling works, zoom levels should be integers, or the
   * viewport will get in to an odd state, which should be handled by padding
   * floats and rendering with clipping (can an exterior container do an
   * overflow: hidden type of thing?). For now keep viewports ^2.
   */

  /**
   * Set the scale based on the zoom level.
   * Zoom level is a linear range, but, it scales exponentially.
   */
  _setScale (zoom) {
    zoom = zoom || this.zoom
    this._scale = setScale(zoom)
  }

  /**
   * Clamps zoom to the specified zoom range
   */
  _clampZoom () {
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
    this._clampZoom()

    this._setScale(this.zoom)

    // Calculate new viewport based on new zoom level (which is exponential)
    const desired = Rect.scale(this._maxViewport, 1 / this._scale)
    const diffX = this.viewport.width - desired.width
    const diffY = this.viewport.height - desired.height
    const newView = Rect.constrict(this.viewport, diffX * 0.5, diffY * 0.5)

    this._setViewport(newView)

    return this
  }

  /**
   * Inc current zoom by supplied amount
   * @param {integer} [amount=0] - the amount to apply to the current zoom
   */
  applyZoom (amount = 0) {
    this.setZoom(this.zoom + amount)
    return this
  }

  /**
   * Translation methods.
   * @TODO panning is currently instantaneous, add anim functions and rename
   * pan to snap and snapTo.
   */
  /**
   * @TODO This uses the world boundary, but, there can be a couple of edge
   * cases, such as when viewport is larger than the map.
   */
  _clampViewportBounds () {
    if (this.viewport.width < 0 || this.bounds.width < 0) {
      throw new Error('Camera::_clampViewportBounds viewport or bounds are negative')
    }

    /**
     * Not convinced the width and height restrictions work in all cases
     */
    if (this.viewport.width > this.bounds.width) {
      this.resize(Rect.of(
        this.bounds.pos[0], this.viewport.pos[1],
        this.bounds.pos[2], this.viewport.pos[3]
      ))
    }

    if (this.viewport.height > this.bounds.height) {
      this.resize(Rect.of(
        this.viewport.pos[0], this.bounds.pos[1],
        this.viewport.pos[2], this.bounds.pos[3]
      ))
    }

    /**
     * @TODO this can cause issue when the map is smaller than the viewport
     * that is specified, hence the above ensures that the viewport is always
     * at least as large as the world bounds. This does not solve all
     * edge cases.
     */
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
    this._clampViewportBounds()

    return this
  }

  panTo (x, y) {
    if (x instanceof Point) {
      this.panTo(x.x, x.y)
      return
    }

    this.pan(x - this.viewport.pos[0], y - this.viewport.pos[1])

    return this
  }

  /**
   * Translates a single sprite from world coords to screen/camera coords.
   */
  translateSprite (sprite, x, y) {
    if (!this.isVisible(x, y)) {
      sprite.visible = false
      return
    }

    sprite.visible = true
    sprite.position.set(
      (x - this.viewport.pos[0]) * this.settings.cellSize.x * this._scale,
      (y - this.viewport.pos[1]) * this.settings.cellSize.y * this._scale
    )
    sprite.scale.set(this._scale)

    return sprite
  }
}
