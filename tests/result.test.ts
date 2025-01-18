import { expect, it } from 'vitest'
import Result, { Err, ErrResult, Ok, OkResult } from '../src'

it('result instance', () => {
  expect(Ok()).toBeInstanceOf(Result)
  expect(Ok()).toBeInstanceOf(OkResult)
  expect(Err()).toBeInstanceOf(Result)
  expect(Err()).toBeInstanceOf(ErrResult)
})

it('result overloads', () => {
  expect(Ok().value).toBeNull()
  expect(Ok(1).value).toBe(1)
  expect(Err().code).toBeNull()
  expect(Err('code').code).toBe('code')
  expect(Err('code', 'message').error.message).toBe('message')
  expect(Err('code', 'message', 'cause').error.cause).toBe('cause')
})

it('result isOk', () => {
  expect(Ok().isOk()).toBe(true)
  expect(Err().isOk()).toBe(false)
})

it('result isErr', () => {
  expect(Ok().isErr()).toBe(false)
  expect(Err().isErr()).toBe(true)
})

it('result expect', () => {
  expect(Ok().expect()).toBeNull()
  expect(Ok(1).expect()).toBe(1)
  expect(() => Err().expect()).toThrow('Error occurred with code \'null\'.')
  expect(() => Err().expect('message')).toThrow('message')
})

it('result unwrap', async () => {
  expect(Ok().unwrap()).toBeNull()
  expect(Ok(1).unwrap()).toBe(1)
  expect(Err().unwrap(1)).toBe(1)
  expect(Err().unwrap(() => 1)).toBe(1)
  await expect(Err().unwrap(Promise.resolve(1))).resolves.toBe(1)
  await expect(Err().unwrap(async () => 1)).resolves.toBe(1)
  expect(() => Err().unwrap()).toThrow('Error occurred with code \'null\'.')
})

it('result fix', async () => {
  expect(createResult('ok').fix(() => Ok(true)).unwrap()).toBe(1)
  expect(createResult('ok-null').fix('code', () => Ok(true)).unwrap()).toBeNull()
  expect(createResult().fix(Ok(true)).unwrap()).toBeTruthy()
  expect(createResult().fix(() => Ok(true)).unwrap()).toBeTruthy()
  expect(() => createResult().fix(Err()).unwrap()).toThrow()
  expect(() => createResult().fix(() => Err()).unwrap()).toThrow()
  expect(createResult().fix('code', Ok()).unwrap()).toBeNull()
  expect(createResult().fix('code', () => Ok()).unwrap()).toBeNull()
})

it('result okTo', () => {
  expect(Ok(1).okTo().unwrap()).toBeNull()
  expect(Ok().okTo(1).unwrap()).toBe(1)
  expect(() => Err().okTo(1).unwrap()).toThrow()
})

it('result errTo', () => {
  expect(Err().errTo('code').code).toBe('code')
  expect(() => Err().errTo('code', 'message').unwrap()).toThrow('message')
  expect(Ok().errTo().unwrap()).toBeNull()
})

export function createResult(type?: 'ok-null' | 'ok' | 'err-null' | 'err') {
  if (type === 'ok-null') {
    return Ok()
  }

  if (type === 'ok') {
    return Ok(1)
  }

  else if (type === 'err-null') {
    return Err()
  }

  return Err('code')
}
