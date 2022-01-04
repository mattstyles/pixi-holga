# Pixi-holga

> Pixi-powered camera

[![npm](https://img.shields.io/npm/v/pixi-holga.svg?style=flat)](https://www.npmjs.com/package/pixi-holga)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/mattstyles/pixi-holga.svg)](https://david-dm.org/mattstyles/pixi-holga)

## Getting Started

```sh
npm i -S pixi-holga
```

```sh
yarn add pixi-holga
```

The camera is designed for 2d surfaces and will allow you to project from world space to screen space.

```js
import {Camera} from 'pixi-holga'
import {Point} from 'mathutil'

const camera = Camera.of({
  position: Point.of(10, 10)
  fov: Point.of(5, 5)
})

const entity = {
  position: Point.of(8, 8)
}

camera.isPointVisible(entity.position)
// true

const coord = camera.applyProjection(entity.position)
// [3, 3]
```

## API

### Constructor

```js
// Default values
const camera = Camera.of({
  position: Point.of(10, 10),
  fov: Point.of(10, 10),
  zoom: 1,
  projection: Point.of(1, 1),
})
```

### Methods

#### applyProjection

```js
camera.applyProjection(point: Point): Point
```

Converts from world space into viewport space. This is very deliberate _not_ called `toScreenCoords` as there could be a further step (depending on what you want to do) beyond this scaling projection.

#### toWorldCoords

```js
camera.toWorldCoords(point: Point): Point
```

The inverse of a projection this function will convert from viewport coordinates back into world coordinates.

#### isPointVisible and isRectVisible

```js
camera.isPointVisible(point: Point): boolean
camera.isRectVisible(rect: Rect): boolean
```

Intersection helpers to determine if a point, or any part of a rectangle, intersect the current viewport in world space.

### Members

#### Position <Point>

Denotes the single position of the camera in world space.

#### Field of view <Point>

The field of view is used to calculate the size of the viewport in world space.

#### Zoom <number>

The zoom, or scale, is used to calculate the size of the viewport in world space.

#### Projection <Point>

The projection vector is used to convert from world space to viewport space and back again. It is a scale factor. Unlike 3d camera projection, `pixi-holga` (which is 2d) is really a means for scaling points based on some criteria (namely position, zoom, and field of view).

## Projections

Pixi-holga cameras are pretty straight forward, they maintain a rectangle in world space that is in view and allow you to project into screen space by using a unit/projection vector.

The camera does not actually know anything about the size of the screen nor which region it is rendering to, but, it can keep track of its viewport which you can use to then translate to actual screen coordinates.

For example:

```js
// Default values
const camera = Camera.of({
  position: Point.of(10, 10),
  fov: Point.of(10, 10),
  zoom: 1,
  projection: Point.of(1, 1),
})
```

These are the default values that the camera uses.

Position is in world coordinates and denotes a single point.

The field of view and zoom level dictate how far the rectangular viewport travels from the position coordinate, the fov is in world coordinates and the zoom works as a scale factor for all things in the world.

The projection vector describes how any point is projected into viewport coordinates, in this case, [1, 1] refers to x and y axis and denotes that a single world unit refers to a single pixel in the viewport.

Many things you might want to point your imaginary camera at can be placed into grids, or tilemaps. If you have [10, 10] pixel tiles in your tilemap then set the projection to [10, 10] i.e. each 1 world coordinates refers to 10 pixels of texture to render for that tile.

Between these 4 variables the camera is able to give you a position in screen coordinates.

For example, imagine the following default settings for the camera:

```js
const camera = Camera.of({
  position: Point.of(10, 10),
  fov: Point.of(10, 10),
  zoom: 2,
  projection: Point.of(10, 10),
})
```

The viewport is described by a rectangular centered on `position` with edges of size `fov / zoom`, in this case, our viewport would be [5, 5, 15, 15].

We can use the following to use the camera projection to convert from a coordinate in world space to one in viewport space:

```js
camera.applyProjection(Point.of(8, 8))
```

The projection maths is slightly more complicated but uses the viewport world position and the projection and zoom scalars to project a given value (in this case [8, 8]) into viewport (or screen) coordinates.

It takes the projection and multiplies by the zoom, and uses the resultant vector to scale the camera and the given positions and then subtract the camera position to find the translation, i.e.

```js
camera.applyProjection(Point.of(8, 8))
// (8 * 10 * 2) - ((10 - 10 / 2) * 10 * 2)
// 60
```

Note that this is the projected value, you may want to further manipulate the value based on some other criteria. For example, consider that the top-left viewport coordinate will always equate to [0, 0] in the projection. If you want your top-left drawn region to be elsewhere then you'll have to translate. The camera handles the projection, not the physical screen coordinates.

## Running tests

```sh
npm i
npm test
```

## Contributing

Pull requests are always welcome. Please run `npm test` to ensure all tests are passing and add tests for any new features or updates.

For bugs and feature requests, [please create an issue](https://github.com/mattstyles/pixi-holga/issues).

## License

MIT
