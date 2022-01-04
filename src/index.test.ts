import {Point} from 'mathutil'

import {Camera} from './'

test('Camera should default to zoom level of 1', () => {
  const defaultZoomLevel = 1
  expect(Camera.of().zoom).toEqual(defaultZoomLevel)
  expect(Camera.of({fov: Point.of(5, 5)}).zoom).toEqual(defaultZoomLevel)
})
