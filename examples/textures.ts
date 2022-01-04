import {BaseTexture, Texture, Rectangle, SCALE_MODES} from 'pixi.js'

import img from './tiles.png'

const base = new BaseTexture(img)
base.scaleMode = SCALE_MODES.NEAREST
export const textures = new Map<string, Texture>()
const gridSize = 10
function getTexture(x: number, y: number): Texture {
  return new Texture(
    base,
    new Rectangle(x * gridSize, y * gridSize, gridSize, gridSize)
  )
}

textures.set('blob', getTexture(0, 0))
textures.set('sprite', getTexture(1, 0))

new Array(10)
  .fill('food-')
  .map((v, i) => v + i)
  .map((name, i) => {
    textures.set(name, getTexture(i, 1))
  })

textures.set('wall', getTexture(0, 2))
textures.set('floor-1', getTexture(0, 3))
textures.set('floor-2', getTexture(1, 3))
textures.set('floor-red-1', getTexture(2, 3))
textures.set('floor-red-2', getTexture(3, 3))

export function get(name: string): Texture {
  const texture = textures.get(name)

  if (texture == null) {
    throw new Error(`unrecognised texture: ${name}`)
  }

  return texture
}
