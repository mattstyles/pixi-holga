import type {Texture, Sprite} from 'pixi.js'

import {Container} from 'pixi.js'
import {SpritePool} from 'pixi-spritepool'
import {Point, Rect, clamp} from 'mathutil'
import {get} from './textures'

enum TileType {
  Floor,
  Wall,
  Carrot,
  Banana,
}
type Tile = TileType

export class TileMap {
  tiles: Tile[]
  dimensions: Point
  sprites: SpritePool
  container: Container

  constructor(dimensions: Point) {
    this.container = new Container()
    this.dimensions = dimensions
    this.tiles = generateTileMap(dimensions)
    this.sprites = new SpritePool({length: 1e5, container: this.container})
  }

  get(x: number, y: number) {
    let xx = Math.floor(x)
    let yy = Math.floor(y)
    return this.tiles[xx + yy * this.dimensions.x]
  }

  renderArea(dimensions: Rect, cb: (sprite: Sprite, location: Point) => void) {
    // Reset sprites, we could be much smarter here but its an example
    this.sprites.each((sprite) => {
      sprite.visible = false
    })

    const startX = clamp(0, this.dimensions.x, Math.floor(dimensions.pos[0]))
    const endX = clamp(0, this.dimensions.x, Math.ceil(dimensions.pos[2]))
    const startY = clamp(0, this.dimensions.y, Math.floor(dimensions.pos[1]))
    const endY = clamp(0, this.dimensions.y, Math.ceil(dimensions.pos[3]))

    let tile = null
    let sprite = null
    let count = 0
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        tile = this.get(x, y)
        sprite = this.sprites.get(count)
        sprite.visible = true
        sprite.texture = this.getTextureMapping(tile)
        cb(sprite, Point.of(x, y))
        count += 1
      }
    }
  }

  getTextureMapping(tile: Tile): Texture {
    switch (tile) {
      case TileType.Wall:
        return get('wall')
      case TileType.Floor:
        return get('floor-1')
      case TileType.Carrot:
        return get('food-0')
      case TileType.Banana:
        return get('food-1')
    }
  }
}

function generateTileMap(dimensions: Point): Tile[] {
  const data = []
  for (let y = 0; y < dimensions.y; y++) {
    for (let x = 0; x < dimensions.x; x++) {
      if (x % 10 === 0 && y % 10 === 0) {
        data.push(TileType.Banana)
        continue
      }

      if (x % 5 === 0 && y % 5 === 0) {
        data.push(TileType.Carrot)
        continue
      }

      if (
        y === 0 ||
        x === 0 ||
        y === dimensions.y - 1 ||
        x === dimensions.x - 1
      ) {
        data.push(TileType.Wall)
        continue
      }

      data.push(Math.random() > 0.75 ? TileType.Wall : TileType.Floor)
    }
  }

  return data
}
