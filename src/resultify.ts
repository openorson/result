import { Err, type ErrResult, Ok, type OkResult } from './result'

export function resultify<Fn extends (...args: any[]) => Promise<any>>(fn: Fn, ...args: Parameters<Fn>): Promise<OkResult<Awaited<ReturnType<Fn>>> | ErrResult<null>>
export function resultify<Fn extends (...args: any[]) => any>(fn: Fn, ...args: Parameters<Fn>): OkResult<ReturnType<Fn>> | ErrResult<null>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => Promise<any>>(code: Code, fn: Fn, ...args: Parameters<Fn>): Promise<OkResult<Awaited<ReturnType<Fn>>> | ErrResult<Code>>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => any>(code: Code, fn: Fn, ...args: Parameters<Fn>): OkResult<ReturnType<Fn>> | ErrResult<Code>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => Promise<any>>(code: Code, message: string, fn: Fn, ...args: Parameters<Fn>): Promise<OkResult<Awaited<ReturnType<Fn>>> | ErrResult<Code>>
export function resultify<Code extends string | number | null | undefined, Fn extends (...args: any[]) => any>(code: Code, message: string, fn: Fn, ...args: Parameters<Fn>): OkResult<ReturnType<Fn>> | ErrResult<Code>
export function resultify(...args: any[]): any {
  const fnIndex = typeof args[0] === 'function' ? 0 : typeof args[1] === 'function' ? 1 : typeof args[2] === 'function' ? 2 : -1

  if (fnIndex === -1) {
    throw new TypeError('Failed to execute \'resultify\', provided function is not found.')
  }

  const fn = args[fnIndex]
  const code = fnIndex === 0 ? null : args[0]
  const message = fnIndex === 2 ? args[1] : null
  const params = args.slice(fnIndex + 1)

  try {
    const value = fn(...params)

    if (value instanceof Promise) {
      return value
        .then(value => Ok(value))
        .catch(error => Err(
          code,
          message || (error instanceof Error ? error.message : `Error occurred while calling '${fn.name || 'anonymous'}' function.`),
          error,
        ))
    }

    else {
      return Ok(value)
    }
  }
  catch (error) {
    return Err(
      code,
      message || (error instanceof Error ? error.message : `Error occurred while calling '${fn.name || 'anonymous'}' function.`),
      error,
    )
  }
}

export interface CallbackResultifyOptions<Code extends string | number | null | undefined, Resolve extends string, Reject extends string> {
  code?: Code
  message?: string
  resolve?: Resolve
  reject?: Reject
}

type Args<T, U extends string, V extends string> = T extends [infer A0, ...infer R] ? [Omit<A0, U | V>, ...R] : never
type ResolveData<T, U extends string> = T extends (...args: [infer A]) => any ? A extends { [K in U]: (...args: infer V) => any } ? V : never : never

export function callbackResultify<Fn extends (...args: any[]) => any>(fn: Fn, ...args: Args<Parameters<Fn>, 'success', 'fail'>): Promise<OkResult<ResolveData<Fn, 'success'>> | ErrResult<null>>
export function callbackResultify<Code extends string | number | null | undefined = null, Resolve extends string = 'success', Reject extends string = 'fail', Fn extends (...args: any[]) => any = (...args: any[]) => any>(options: CallbackResultifyOptions<Code, Resolve, Reject>, fn: Fn, ...args: Args<Parameters<Fn>, Resolve, Reject>): Promise<OkResult<ResolveData<Fn, Resolve>> | ErrResult<Code>>
export function callbackResultify(...args: any[]): any {
  const fnIndex = typeof args[0] === 'function' ? 0 : typeof args[1] === 'function' ? 1 : -1

  if (fnIndex === -1) {
    throw new TypeError('Failed to execute \'callbackResultify\', provided function is not found.')
  }

  const fn = args[fnIndex]
  const options = fnIndex === 1 ? args[0] : {}

  if (typeof options !== 'object') {
    throw new TypeError('Failed to execute \'callbackResultify\', provided function first argument is not an object.')
  }

  const code = options.code ?? null
  const message = options.message ?? null
  const resolve = options.resolve ?? 'success'
  const reject = options.reject ?? 'fail'
  const [fnOptions, ...fnArgs] = args.slice(fnIndex + 1)

  return new Promise((_resolve) => {
    try {
      fn({
        ...fnOptions,
        [resolve]: (...value: unknown[]) => _resolve(Ok(value)),
        [reject]: (error: unknown) => _resolve(Err(
          code,
          message || (error instanceof Error ? error.message : `Error occurred while calling '${fn.name || 'anonymous'}' function.`),
          error,
        )),
      }, ...fnArgs)
    }
    catch (error) {
      _resolve(Err(
        code,
        message || (error instanceof Error ? error.message : `Error occurred while calling '${fn.name || 'anonymous'}' function.`),
        error,
      ))
    }
  })
}
