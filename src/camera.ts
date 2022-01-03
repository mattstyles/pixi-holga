import {Point, Rect} from 'mathutil'

export class Camera {
  position: Point = Point.of(10, 10)
  fov: Point = Point.of(4, 4)
  zoom: number = 1
  screen: Rect = Rect.of(0, 0, 320, 240)

  setZoom(zoom: number) {
    this.zoom = zoom
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
      p.x < bounds.pos[2] &&
      p.x > bounds.pos[0] &&
      p.y < bounds.pos[3] &&
      p.y > bounds.pos[1]
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
