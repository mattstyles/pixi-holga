import {Point, Rect} from 'mathutil'

export class Camera {
  private position: Point = Point.of(10, 10)
  private fov: Point = Point.of(4, 4)
  private zoom: number = 1
  private projection: Point = Point.of(1, 1)
  private bounds: Rect = Rect.of(6, 6, 14, 14)

  /**
   * Applies the projection to the point
   */
  applyProjection(point: Point): Point {
    return Point.of(
      point.x * this.projection.x * this.scale.x -
        this.bounds.pos[0] * this.projection.x,
      point.y * this.projection.y * this.scale.y -
        this.bounds.pos[1] * this.projection.y
    )
  }

  setProjection(projection: Point) {
    this.projection = projection
  }

  setFov(fov: Point) {
    this.fov = fov
    this.bounds = this.getViewBounds()
  }

  /**
   * Sets the camera position
   */
  setPosition(pos: Point) {
    this.position = pos
    this.bounds = this.getViewBounds()
  }
  get x() {
    return this.position.x
  }
  get y() {
    return this.position.y
  }
  set x(newX: number) {
    this.position.x = newX
    this.bounds = this.getViewBounds()
  }
  set y(newY: number) {
    this.position.y = newY
    this.bounds = this.getViewBounds()
  }

  /**
   * Set the camwera zoom level
   */
  setZoom(zoom: number) {
    this.zoom = zoom
    this.bounds = this.getViewBounds()
  }

  // Use a getter for now as I don't think this will want to end up being an
  // alias for zoom
  get scale() {
    return Point.of(this.zoom, this.zoom)
  }

  /**
   * The current viewport in world coords
   */
  getViewBounds(): Rect {
    return Rect.of(
      this.position.x - this.fov.x * this.zoom,
      this.position.y - this.fov.y * this.zoom,
      this.position.x + this.fov.x * this.zoom,
      this.position.y + this.fov.y * this.zoom
    )
  }

  /**
   * True if the point is within the current viewport
   */
  isPointVisible(p: Point): boolean {
    const bounds = this.getViewBounds()

    return (
      p.x <= bounds.pos[2] &&
      p.x >= bounds.pos[0] &&
      p.y <= bounds.pos[3] &&
      p.y >= bounds.pos[1]
    )
  }

  /**
   * True if any part of the supplied rect is within the viewport
   */
  isRectVisible(r: Rect): boolean {
    const bounds = this.getViewBounds()

    // Vertical
    if (r.pos[3] < bounds.pos[1] || r.pos[1] > bounds.pos[3]) {
      return false
    }

    // Horizontal
    if (r.pos[2] < bounds.pos[0] || r.pos[0] > bounds.pos[2]) {
      return false
    }

    return true
  }
}
