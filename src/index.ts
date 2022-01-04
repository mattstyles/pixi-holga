import {Point, Rect} from 'mathutil'

type CtorProps = {
  position?: Point
  fov?: Point
  projection?: Point
  zoom?: number
}

/**
 * Camera class.
 *
 * As an efficiency we always track the frustrum (versus lazily computing it when needed) which means we need to respond to changes of parameters which affect the frustrum size, hence we use getters and setters for all internal properties. The frustrum is 2d for this camera, i.e. the 2 planes are the same plane.
 */
export class Camera {
  private _position: Point
  private _fov: Point
  private _zoom: number
  private _projection: Point
  private _frustrum: Rect

  static of(props: CtorProps | null = {}) {
    return new Camera(props)
  }

  constructor({
    position = Point.of(10, 10),
    fov = Point.of(10, 10),
    zoom = 1,
    projection = Point.of(1, 1),
  }: CtorProps | null = {}) {
    this._position = position
    this._fov = fov
    this._zoom = zoom
    this._projection = projection

    this._frustrum = this.getViewBounds()
  }

  /**
   * Frustrum getter. No setter, frustrum is calculated from other properties.
   */
  get frustrum() {
    return this._frustrum
  }

  /**
   * Sets the projection for this camera
   */
  set projection(projection: Point) {
    this._projection = projection
  }

  get projection(): Point {
    return this._projection
  }

  /**
   * Sets the field of view
   */
  set fov(fov: Point) {
    this._fov = fov
    this._frustrum = this.getViewBounds()
  }

  get fov(): Point {
    return this._fov
  }

  /**
   * Sets the camera position
   */
  set position(pos: Point) {
    this._position = pos
    this._frustrum = this.getViewBounds()
  }
  get x() {
    return this._position.x
  }
  get y() {
    return this._position.y
  }
  set x(newX: number) {
    this._position.x = newX
    this._frustrum = this.getViewBounds()
  }
  set y(newY: number) {
    this._position.y = newY
    this._frustrum = this.getViewBounds()
  }

  /**
   * Set the camwera zoom level
   */
  setZoom(zoom: number) {
    this._zoom = zoom
    this._frustrum = this.getViewBounds()
  }

  get zoom() {
    return this._zoom
  }

  get scale() {
    return Point.of(this._zoom, this._zoom)
  }

  /**
   * The current viewport in world coords
   */
  getViewBounds(): Rect {
    return Rect.of(
      this.x - this.fov.x / this.zoom,
      this.y - this.fov.y / this.zoom,
      this.x + this.fov.x / this.zoom,
      this.y + this.fov.y / this.zoom
    )
  }

  /**
   * True if the point is within the current viewport
   */
  isPointVisible(p: Point): boolean {
    return (
      p.x <= this.frustrum.pos[2] &&
      p.x >= this.frustrum.pos[0] &&
      p.y <= this.frustrum.pos[3] &&
      p.y >= this.frustrum.pos[1]
    )
  }

  /**
   * True if any part of the supplied rect is within the viewport
   */
  isRectVisible(r: Rect): boolean {
    // Vertical
    if (r.pos[3] < this.frustrum.pos[1] || r.pos[1] > this.frustrum.pos[3]) {
      return false
    }

    // Horizontal
    if (r.pos[2] < this.frustrum.pos[0] || r.pos[0] > this.frustrum.pos[2]) {
      return false
    }

    return true
  }

  /**
   * Applies the projection to a point
   */
  applyProjection(point: Point): Point {
    const px = this.projection.x * this.zoom
    const py = this.projection.y * this.zoom
    return Point.of(
      point.x * px - this._frustrum.pos[0] * px,
      point.y * py - this._frustrum.pos[1] * py
    )
  }

  /**
   * Reverses the projection to provide world coords from the supplied Point
   */
  toWorldCoords(point: Point): Point {
    const px = this.projection.x * this.zoom
    const py = this.projection.y * this.zoom
    return Point.of(
      Math.floor(point.x / px + this._frustrum.pos[0]),
      Math.floor(point.y / py + this._frustrum.pos[1])
    )
  }
}
