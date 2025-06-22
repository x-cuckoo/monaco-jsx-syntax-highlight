import { analysis } from '../src/worker/analysis'
import { JsxToken } from '../src/worker/define'

test('fragment', () => {
  const result = analysis('test.tsx', '<></>')
  expect(result.length).toBe(4)

  // start <
  expect([result[0].start.row, result[0].start.column]).toEqual([1, 1])
  // start >
  expect([result[1].start.row, result[1].start.column]).toEqual([1, 2])

  // end </
  expect([
    [result[2].start.row, result[2].start.column],
    [result[2].end.row, result[2].end.column]
  ]).toEqual([
    [1, 3],
    [1, 4]
  ])
  // end >
  expect([result[3].start.row, result[3].start.column]).toEqual([1, 5])
})

test('self close element', () => {
  const result = analysis('test.tsx', '<div/>')
  // <
  expect([result[0].start.row, result[0].start.column]).toEqual([1, 1])
  // />
  expect([
    [result[1].start.row, result[1].start.column],
    [result[1].end.row, result[1].end.column]
  ]).toEqual([
    [1, 5],
    [1, 6]
  ])
  // div
  expect([
    [result[2].start.row, result[2].start.column],
    [result[2].end.row, result[2].end.column]
  ]).toEqual([
    [1, 2],
    [1, 4]
  ])
  expect(result[2].tokens.includes(JsxToken.tagName)).toEqual(true)
})

test('open element', () => {
  const result = analysis('test.tsx', '<div></div>')

  // start <
  expect([result[0].start.row, result[0].start.column]).toEqual([1, 1])
  // start >
  expect([result[1].start.row, result[1].start.column]).toEqual([1, 5])

  // end </
  expect([
    [result[2].start.row, result[2].start.column],
    [result[2].end.row, result[2].end.column]
  ]).toEqual([
    [1, 6],
    [1, 7]
  ])
  // end >
  expect([result[3].start.row, result[3].start.column]).toEqual([1, 11])

  // start div
  expect([
    [result[4].start.row, result[4].start.column],
    [result[4].end.row, result[4].end.column]
  ]).toEqual([
    [1, 2],
    [1, 4]
  ])
  expect(result[4].tokens.includes(JsxToken.tagName)).toEqual(true)
  // end div
  expect([
    [result[5].start.row, result[5].start.column],
    [result[5].end.row, result[5].end.column]
  ]).toEqual([
    [1, 8],
    [1, 10]
  ])
  expect(result[5].tokens.includes(JsxToken.tagName)).toEqual(true)
})

test('order', () => {
  expect(analysis('test.tsx', '<div><div/></div>').map((item) => item.tokens)).toEqual([
    // open start <
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open start >
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open end </
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open end >
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open start div
    [JsxToken.tagName, JsxToken.orderTokenPrefix + '-1'],
    // open end div
    [JsxToken.tagName, JsxToken.orderTokenPrefix + '-1'],
    // close < order 2
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-2'],
    // close /> order 2
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-2'],
    // close div order 2
    [JsxToken.tagName, JsxToken.orderTokenPrefix + '-2']
  ])

  // test for jsxTagCycle
  expect(analysis('test.tsx', '<div><div/></div>', { jsxTagCycle: 1 }).map((item) => item.tokens)).toEqual([
    // open start <
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open start >
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open end </
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open end >
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // open start div
    [JsxToken.tagName, JsxToken.orderTokenPrefix + '-1'],
    // open end div
    [JsxToken.tagName, JsxToken.orderTokenPrefix + '-1'],
    // close < order 1
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // close /> order 1
    [JsxToken.angleBracket, JsxToken.orderTokenPrefix + '-1'],
    // close div order 1
    [JsxToken.tagName, JsxToken.orderTokenPrefix + '-1']
  ])
})
