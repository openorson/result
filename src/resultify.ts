import type { CallbackFnArgs, CallbackFnResolveValue, FnArgs, FnReturnValue } from './types'
import { Err, type ErrResult, Ok, type OkResult } from './result'

export function resultify<Fn extends (...args: any[]) => Promise<any>>(fn: Fn, ...args: FnArgs<Fn>): Promise<OkResult<FnReturnValue<Fn>> | ErrResult<null>>
export function resultify<Fn extends (...args: any[]) => any>(fn: Fn, ...args: FnArgs<Fn>): OkResult<FnReturnValue<Fn>> | ErrResult<null>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => Promise<any>>(code: Code, fn: Fn, ...args: FnArgs<Fn>): Promise<OkResult<FnReturnValue<Fn>> | ErrResult<Code>>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => any>(code: Code, fn: Fn, ...args: FnArgs<Fn>): OkResult<FnReturnValue<Fn>> | ErrResult<Code>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => Promise<any>>(code: Code, message: string, fn: Fn, ...args: FnArgs<Fn>): Promise<OkResult<FnReturnValue<Fn>> | ErrResult<Code>>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => any>(code: Code, message: string, fn: Fn, ...args: FnArgs<Fn>): OkResult<FnReturnValue<Fn>> | ErrResult<Code>
export function resultify(...args: any[]) {
  const fnIndex = typeof args[0] === 'function' ? 0 : typeof args[1] === 'function' ? 1 : typeof args[2] === 'function' ? 2 : -1

  if (fnIndex === -1) {
    throw new TypeError('invalid arguments')
  }

  const fn = args[fnIndex]
  const code = fnIndex === 0 ? null : args[0]
  const message = fnIndex === 2 ? args[1] : null
  const params = args.slice(fnIndex + 1)

  if (code !== null && code !== void 0 && typeof code !== 'string' && typeof code !== 'number') {
    throw new TypeError('invalid code')
  }

  if (message !== null && message !== void 0 && typeof message !== 'string') {
    throw new TypeError('invalid message')
  }

  try {
    const value = fn(...params)

    if (value instanceof Promise) {
      return value.then(value => Ok(value)).catch(error => Err(code, message || `error occurred while calling '${fn.name || 'anonymous'}' function`, error))
    }

    else {
      return Ok(value)
    }
  }
  catch (error) {
    return Err(code, message || `error occurred while calling '${fn.name || 'anonymous'}' function`, error)
  }
}

export interface CallbackResultifyOptions<Code extends string | number | null | undefined, Resolve extends string, Reject extends string> {
  code?: Code
  message?: string
  resolve?: Resolve
  reject?: Reject
}

export function callbackResultify<Code extends string | number | null | undefined = null, Fn extends (...args: any[]) => any = (...args: any[]) => any>(fn: Fn, ...args: CallbackFnArgs<FnArgs<Fn>, 'success', 'fail'>): Promise<OkResult<CallbackFnResolveValue<Fn, 'success'>> | ErrResult<Code>>
export function callbackResultify<Code extends string | number | null | undefined = null, Resolve extends string = 'success', Reject extends string = 'fail', Fn extends (...args: any[]) => any = (...args: any[]) => any>(options: CallbackResultifyOptions<Code, Resolve, Reject>, fn: Fn, ...args: CallbackFnArgs<FnArgs<Fn>, Resolve, Reject>): Promise<OkResult<CallbackFnResolveValue<Fn, Resolve>> | ErrResult<Code>>
export function callbackResultify(...args: any[]): any {
  const fnIndex = typeof args[0] === 'function' ? 0 : typeof args[1] === 'function' ? 1 : -1

  if (fnIndex === -1) {
    throw new TypeError('invalid arguments')
  }

  const fn = args[fnIndex]
  const options = fnIndex === 1 ? args[0] : {}

  if (typeof options !== 'object') {
    throw new TypeError('invalid options')
  }

  const code = options.code ?? null
  const message = options.message ?? null
  const resolve = options.resolve ?? 'success'
  const reject = options.reject ?? 'fail'
  const params = args.slice(fnIndex + 1)

  if (code !== null && code !== void 0 && typeof code !== 'string' && typeof code !== 'number') {
    throw new TypeError('invalid code')
  }

  if (message !== null && message !== void 0 && typeof message !== 'string') {
    throw new TypeError('invalid message')
  }

  if (resolve !== null && resolve !== void 0 && typeof resolve !== 'string') {
    throw new TypeError('invalid resolve')
  }

  if (reject !== null && reject !== void 0 && typeof reject !== 'string') {
    throw new TypeError('invalid reject')
  }

  return new Promise((_resolve) => {
    try {
      fn({
        ...params,
        [resolve]: (...value: unknown[]) => _resolve(Ok(value)),
        [reject]: (error: unknown) => _resolve(Err(code, message || `error occurred while calling '${fn.name || 'anonymous'}' function`, error)),
      })
    }
    catch (error) {
      _resolve(Err(code, message || `error occurred while calling '${fn.name || 'anonymous'}' function`, error))
    }
  })
}
