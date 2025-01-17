import { expect, it } from 'vitest'
import { callbackResultify, resultify } from '../src'

it('resultify', () => {
  expect(resultify(plus, 1, 2).unwrap()).toBe(3)
  expect(() => resultify(plus, 1, '2').unwrap()).toThrow(`error occurred while calling 'plus' function`)
  expect(() => resultify('code', plus, 1, '2').unwrap()).toThrow(`error occurred while calling 'plus' function`)
})

it('callbackResultify', async () => {
  await expect((async () => (await callbackResultify(callbackPlus, { a: 1, b: 1 })).unwrap())()).resolves.toStrictEqual([2])
})

function plus(a: unknown, b: unknown) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('invalid arguments')
  }
  return a + b
}

function callbackPlus(options: { a: number, b: number, success: (sum: number) => void, fail: (error: Error) => void }) {
  try {
    options.success(options.a + options.b)
  }
  catch (error) {
    options.fail(error as Error)
  }
}
