
import { clamp } from 'mathutil'

export const pre = prefix => subject => `${prefix}${subject}`

export const foo = value => clamp(value, 1, 10)
