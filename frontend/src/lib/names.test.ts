import { expect, it } from 'vitest'

import { parseNames } from './names'

it('un nombre por línea, sin vacíos, espacios de más ni repetidos', () => {
  expect(
    parseNames('Ana Gil\r\n\n   Luis   Mora  \nana gil\nÁlvaro Sanz\n'),
  ).toEqual(['Ana Gil', 'Luis Mora', 'Álvaro Sanz'])
})
