import { describe, expect, it } from 'vitest'

import { snippetParts } from './snippet'

describe('snippetParts', () => {
  it('separa lo resaltado del resto', () => {
    expect(
      snippetParts('una <mark>dinámica</mark> de <mark>perdón</mark>'),
    ).toEqual([
      { text: 'una ', marked: false },
      { text: 'dinámica', marked: true },
      { text: ' de ', marked: false },
      { text: 'perdón', marked: true },
    ])
  })

  it('el HTML del documento se queda como texto', () => {
    expect(snippetParts('<script>alert(1)</script> <mark>x</mark>')).toEqual([
      { text: '<script>alert(1)</script> ', marked: false },
      { text: 'x', marked: true },
    ])
  })
})
