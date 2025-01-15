import type { ArgsVariant, ErrResultCode, OkResultValue, Promisify, PromisifyUnion, Variant, VariantValue } from './types'
import { ResultError } from './error'
import { callbackResultify, resultify } from './resultify'

export class Result {
  static Ok = Ok
  static Err = Err

  static Resultify = resultify
  static CallbackResultify = callbackResultify

  isOk<This>(this: This): this is OkResult<OkResultValue<This>> {
    return this instanceof OkResult
  }

  isErr<This>(this: This): this is ErrResult<ErrResultCode<This>> {
    return this instanceof ErrResult
  }

  expect<This>(this: This): OkResultValue<This>
  expect<This>(this: This, message: string): OkResultValue<This>
  expect(...args: any[]): any {
    if (this.isOk()) {
      return this.value
    }

    else if (this.isErr()) {
      if (args.length === 1 && typeof args[0] === 'string') {
        this.error.message = args[0].replace('{code}', this.code === null ? 'null' : this.code === void 0 ? 'undefined' : this.code.toString())
      }

      throw this.error
    }

    else {
      throw new Error('\'this\' is not a valid result instance')
    }
  }

  unwrap<This>(this: This): OkResultValue<This>
  unwrap<This, DefaultValue extends Variant>(this: This, defaultValue: DefaultValue): PromisifyUnion<DefaultValue, OkResultValue<This> | VariantValue<DefaultValue>>
  unwrap(...args: any[]): any {
    if (this.isOk()) {
      return this.value
    }

    else if (this.isErr()) {
      if (args.length === 0) {
        throw this.error
      }

      else {
        if (typeof args[0] === 'function') {
          return args[0]()
        }

        return args[0]
      }
    }

    else {
      throw new Error('\'this\' is not a valid result instance')
    }
  }

  fix<This, Code extends ErrResultCode<This> = ErrResultCode<This>, Fixer extends ArgsVariant<Result, [ErrResult<Code>]> = ArgsVariant<Result, [ErrResult<Code>]>>(this: This, code: Code, fixer: Fixer): PromisifyUnion<Fixer, Exclude<This, ErrResult<Code>> | VariantValue<Fixer>>
  fix<This, Fixer extends Variant<Result> = Variant<Result>>(this: This, fixer: Fixer): Promisify<Fixer, Exclude<This, ErrResult<any>> | VariantValue<Fixer>>
  fix(...args: any[]): any {
    if (this.isOk()) {
      return this
    }

    else if (this.isErr()) {
      if (args.length === 0) {
        return this
      }

      else if (args.length === 1) {
        if (typeof args[0] === 'function') {
          return args[0]()
        }

        return args[0]
      }

      else if (args.length === 2) {
        if (args[0] === this.code) {
          if (typeof args[1] === 'function') {
            return args[1]()
          }

          return args[1]
        }

        return this
      }
    }

    else {
      throw new Error('\'this\' is not a valid result instance')
    }
  }
}

export class OkResult<Value = null> extends Result {
  value: Value

  constructor()
  constructor(value: Value)
  constructor(...args: any[]) {
    super()

    if (args.length === 0) {
      this.value = null as Value
    }

    else {
      this.value = args[0]
    }
  }

  toString() {
    if (this.value === null) {
      return 'Result Ok(null)'
    }

    if (this.value === void 0) {
      return `Result Ok(undefined)`
    }

    return `Result Ok(${(this.value).toString()})`
  }
}

export function Ok(): OkResult<null>
export function Ok<Value>(value: Value): OkResult<Value>
export function Ok(...args: any[]) {
  if (args.length === 0) {
    return new OkResult()
  }

  else {
    return new OkResult(args[0])
  }
}

export class ErrResult<Code extends string | number | null | undefined = null> extends Result {
  code: Code

  error: ResultError<Code>

  constructor()
  constructor(code: Code)
  constructor(code: Code, error: Error)
  constructor(code: Code, message: string)
  constructor(code: Code, message: string, cause: unknown)
  constructor(...args: any[]) {
    super()

    if (args.length === 0) {
      this.code = null as Code
      this.error = new ResultError(this.code, `error occurred with code '${this.code}'`)
    }

    else if (args.length === 1) {
      this.code = args[0]
      this.error = new ResultError(this.code, `error occurred with code '${this.code}'`)
    }

    else if (args.length === 2) {
      this.code = args[0]

      if (typeof args[1] === 'string') {
        this.error = new ResultError(this.code, args[1])
      }

      else if (args[1] instanceof Error) {
        this.error = new ResultError(this.code, args[1].message, { cause: args[1] })
      }

      else {
        this.error = new ResultError(this.code, `error occurred with code '${this.code}'`)
      }
    }

    else {
      this.code = args[0]
      this.error = new ResultError(this.code, args[1], { cause: args[2] })
    }
  }

  toString() {
    return `Result Err(${this.code} ${this.error.message})`
  }
}

export function Err(): ErrResult<null>
export function Err<Code extends string | number | null | undefined>(code: Code): ErrResult<Code>
export function Err<Code extends string | number | null | undefined>(code: Code, error: Error): ErrResult<Code>
export function Err<Code extends string | number | null | undefined>(code: Code, message: string): ErrResult<Code>
export function Err<Code extends string | number | null | undefined>(code: Code, message: string, cause: unknown): ErrResult<Code>
export function Err(...args: any[]) {
  if (args.length === 0) {
    return new ErrResult()
  }

  else if (args.length === 1) {
    return new ErrResult(args[0])
  }

  else if (args.length === 2) {
    return new ErrResult(args[0], args[1])
  }

  else {
    return new ErrResult(args[0], args[1], args[2])
  }
}
