import Stats from 'stats.js'
import {Application, Sprite, Text, TextStyle, Graphics} from 'pixi.js'
import {Point} from 'mathutil'

import {Camera} from '../lib'
import {TileMap} from './tiles'
import {get} from './textures'

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

const textStyle = new TextStyle({
  fontSize: 16,
  fill: 0xf4f5fc,
})
const debugText = new Text('', textStyle)
debugText.position.set(2, 5)
app.stage.addChild(debugText)

const camera = new Camera()
camera.position = Point.of(64, 40)
camera.fov = Point.of(64, 40)
camera.projection = Point.of(10, 10)
const cameraOffset = Point.of(100, 20)

class Char {
  // World coords
  pos: Point
  size: Point
  sprite: Sprite

  constructor(pos: Point) {
    this.pos = pos
    this.size = Point.of(10, 10)

    this.sprite = new Sprite(get('blob'))
    // this.sprite.anchor.set(0.5, 0.5)
  }
}

const tiles = new TileMap(Point.of(140, 100))
app.stage.addChild(tiles.container)

const entities: Char[] = []
entities.push(new Char(Point.of(1, 1)))
entities.push(new Char(Point.of(2, 1)))

entities.forEach((ent) => {
  app.stage.addChild(ent.sprite)
})

const frame = new Graphics()
app.stage.addChild(frame)

frame.lineStyle(10, 0x293042, 1, 0.5)
frame.drawRect(
  0 + cameraOffset.x - camera.projection.x * 0.5,
  0 + cameraOffset.y - camera.projection.y * 0.5,
  camera.fov.x * 2 * camera.projection.x + (0 + camera.projection.x),
  camera.fov.y * 2 * camera.projection.y +
    (cameraOffset.y - camera.projection.y)
)

// Render pipeline
function render() {
  stats.begin()

  setDebugString()

  const vb = camera.getViewBounds()
  tiles.renderArea(vb, (sprite, location) => {
    let pos = camera.applyProjection(location)
    sprite.position.set(pos.x + cameraOffset.x, pos.y + cameraOffset.y)
    sprite.scale.set(camera.scale.x, camera.scale.y)
  })

  entities.forEach((ent) => {
    if (!camera.isPointVisible(ent.pos)) {
      ent.sprite.visible = false
      return
    } else {
      ent.sprite.visible = true
    }

    // Get projection if visible and apply translate to place on screen
    const position = camera.applyProjection(ent.pos)
    ent.sprite.position.set(
      position.x + cameraOffset.x,
      position.y + cameraOffset.y
    )

    // Set size of sprite based on camera scale
    ent.sprite.scale.set(camera.scale.x, camera.scale.y)
  })

  stats.end()
}

app.ticker.add(render)

const translateVelocity = 0.25
const zoomVelocity = 0.1
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    camera.y -= translateVelocity
  }

  if (event.key === 'ArrowDown') {
    camera.y += translateVelocity
  }

  if (event.key === 'ArrowLeft') {
    camera.x -= translateVelocity
  }

  if (event.key === 'ArrowRight') {
    camera.x += translateVelocity
  }
  if (event.key === '=') {
    const zoom = camera.zoom * (1 - zoomVelocity)
    // camera.setZoom(parseFloat(zoom.toFixed(1)))
    camera.setZoom(zoom)
  }

  if (event.key === '-') {
    const zoom = camera.zoom * (1 + zoomVelocity)
    // camera.setZoom(parseFloat(zoom.toFixed(1)))
    camera.setZoom(zoom)
  }
})

function setDebugString() {
  const vb = camera.getViewBounds()
  const vw = vb.pos[2] - vb.pos[0]
  const vh = vb.pos[3] - vb.pos[1]
  const text = [
    `[${vb.pos[0]}, ${vb.pos[1]}, ${vb.pos[2]}, ${vb.pos[3]}]`,
    `w: ${vw}`,
    `h: ${vh}`,
    `pw: ${vw * camera.projection.x * camera.scale.x}`,
    `ph: ${vh * camera.projection.y * camera.scale.y}`,
    `zoom: [${camera.scale.x}, ${camera.scale.y}]`,
  ]

  debugText.text = text.join('\n')
}

document.addEventListener('mousedown', (event) => {
  const point = Point.of(
    event.offsetX - cameraOffset.x,
    event.offsetY - cameraOffset.y
  )
  console.log(point.pos)
  console.log(camera.toWorldCoords(point).pos)
})

window.camera = camera
