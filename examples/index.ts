import Stats from 'stats.js'
import {Application, Texture, Sprite} from 'pixi.js'
import {Point} from 'mathutil'

import {Camera} from '../lib/camera'
import bunnyTexture from './bunny.png'

const stats = new Stats()
stats.showPanel(0)
stats.dom.style.right = '0px'
stats.dom.style.left = 'auto'
document.body.appendChild(stats.dom)

const canvas: HTMLCanvasElement = document.querySelector('.js-canvas')
const dpr = window.devicePixelRatio || 1
const app = new Application({
  resolution: dpr,
  backgroundColor: 0x293042,
  antialias: true,
  autoDensity: true,
  resizeTo: window,
  view: canvas,
})

const texture = Texture.from(bunnyTexture)
const camera = new Camera()
camera.setFov(Point.of(10, 10))
camera.setProjection(Point.of(25, 32))
const projection = Point.of(25, 32)

class Char {
  // World coords
  pos: Point
  size: Point
  sprite: Sprite

  constructor(pos: Point) {
    this.pos = pos
    this.size = Point.of(25, 32)

    this.sprite = new Sprite(texture)
    // this.sprite.anchor.set(0.5, 0.5)
    this.sprite.position.set(
      this.pos.x * projection.x,
      this.pos.y * projection.y
    )
  }
}

const entities: Char[] = []
entities.push(new Char(Point.of(0, 0)))
entities.push(new Char(Point.of(1, 0)))

entities.forEach((ent) => {
  app.stage.addChild(ent.sprite)
})

// Render pipeline
function render() {
  stats.begin()

  const vb = camera.getViewBounds()
  entities.forEach((ent) => {
    if (!camera.isPointVisible(ent.pos)) {
      ent.sprite.visible = false
      return
    } else {
      ent.sprite.visible = true
    }

    // World transform + camera scale
    // ent.sprite.position.set(
    //   ent.pos.x * projection.x * camera.scale.x - vb.pos[0] * projection.x,
    //   ent.pos.y * projection.y * camera.scale.y - vb.pos[1] * projection.y
    // )
    const position = camera.applyProjection(ent.pos)
    ent.sprite.position.set(position.x, position.y)

    ent.sprite.scale.set(camera.scale.x, camera.scale.y)
  })

  stats.end()
}

app.ticker.add(render)

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    camera.y -= 1
  }

  if (event.key === 'ArrowDown') {
    camera.y += 1
  }

  if (event.key === 'ArrowLeft') {
    camera.x -= 1
  }

  if (event.key === 'ArrowRight') {
    camera.x += 1
  }
  if (event.key === '=') {
    camera.setZoom(camera.zoom * 0.9)
  }

  if (event.key === '-') {
    camera.setZoom(camera.zoom * 1.1)
  }
})

window.camera = camera
