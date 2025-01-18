import { ResultError } from './error'

export type OkResultValue<T> = T extends OkResult<infer U> ? U : never
export type ErrResultCode<T> = T extends ErrResult<infer U> ? U : never

export class Result {
  static Ok = Ok
  static Err = Err

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
      throw new Error('Failed to execute \'expect\', \'this\' is not a valid result instance.')
    }
  }

  unwrap<This>(this: This): OkResultValue<This>
  unwrap<This, DefaultValue extends () => any>(this: This, defaultValue: DefaultValue): OkResultValue<This> | ReturnType<DefaultValue>
  unwrap<This, DefaultValue>(this: This, defaultValue: DefaultValue): OkResultValue<This> | DefaultValue
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
      throw new Error('Failed to execute \'unwrap\', \'this\' is not a valid result instance.')
    }
  }

  fix<This, Code extends ErrResultCode<This>, Fixer extends (result: Extract<This, ErrResult<Code>>) => Promise<Result>>(this: This, code: Code, fixer: Fixer): Exclude<This, ErrResult<Code>> | ReturnType<Fixer>
  fix<This, Code extends ErrResultCode<This>, Fixer extends (result: Extract<This, ErrResult<Code>>) => Result>(this: This, code: Code, fixer: Fixer): Exclude<This, ErrResult<Code>> | ReturnType<Fixer>
  fix<This, Code extends ErrResultCode<This>, Fixer extends Promise<Result>>(this: This, code: Code, fixer: Fixer): Exclude<This, ErrResult<Code>> | Fixer
  fix<This, Code extends ErrResultCode<This>, Fixer extends Result>(this: This, code: Code, fixer: Fixer): Exclude<This, ErrResult<Code>> | Fixer
  fix<This, Fixer extends (result: This) => Promise<Result>>(this: This, fixer: Fixer): Exclude<This, ErrResult<any>> | ReturnType<Fixer>
  fix<This, Fixer extends (result: This) => Result>(this: This, fixer: Fixer): Exclude<This, ErrResult<any>> | ReturnType<Fixer>
  fix<This, Fixer extends Promise<Result>>(this: This, fixer: Fixer): Exclude<This, ErrResult<any>> | Fixer
  fix<This, Fixer extends Result>(this: This, fixer: Fixer): Exclude<This, ErrResult<any>> | Fixer
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
          return args[0](this)
        }

        return args[0]
      }

      else if (args.length === 2) {
        if (args[0] === this.code) {
          if (typeof args[1] === 'function') {
            return args[1](this)
          }

          return args[1]
        }

        return this
      }
    }

    else {
      throw new Error('Failed to execute \'fix\', \'this\' is not a valid result instance.')
    }
  }

  okTo<This>(this: This): Exclude<This, OkResult<any>> | OkResult<null>
  okTo<This, Value>(this: This, value: Value): Exclude<This, OkResult<any>> | OkResult<Value>
  okTo(...args: any[]): any {
    if (this.isErr()) {
      return this
    }

    else if (this.isOk()) {
      if (args.length === 0) {
        return Ok()
      }

      else {
        return Ok(args[0])
      }
    }

    else {
      throw new Error('Failed to execute \'okTo\', \'this\' is not a valid result instance.')
    }
  }

  errTo<This>(this: This): Exclude<This, ErrResult<any>> | ErrResult<null>
  errTo<This, Code extends string | number | null | undefined>(this: This, code: Code): Exclude<This, ErrResult<any>> | ErrResult<Code>
  errTo<This, Code extends string | number | null | undefined>(this: This, code: Code, message: string): Exclude<This, ErrResult<any>> | ErrResult<Code>
  errTo(...args: any[]): any {
    if (this.isOk()) {
      return this
    }

    else if (this.isErr()) {
      if (args.length === 0) {
        const err = Err()
        err.error.cause = this.error
        return err
      }

      else if (args.length === 1) {
        const err = Err(args[0])
        err.error.cause = this.error
        return err
      }

      else if (args.length === 2) {
        const err = Err(args[0], args[1])
        err.error.cause = this.error
        return err
      }
    }

    else {
      throw new Error('Failed to execute \'errTo\', \'this\' is not a valid result instance.')
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
export function Ok(...args: []) {
  return new OkResult(...args)
}

export class ErrResult<Code extends string | number | null | undefined = null> extends Result {
  code: Code

  error: ResultError<Code>

  constructor()
  constructor(code: Code)
  constructor(code: Code, message: string)
  constructor(code: Code, message: string, cause: unknown)
  constructor(...args: any[]) {
    super()

    if (args.length === 0) {
      this.code = null as Code
      this.error = new ResultError(this.code, `Error occurred with code '${this.code}'.`)
    }

    else if (args.length === 1) {
      this.code = args[0]
      this.error = new ResultError(this.code, `Error occurred with code '${this.code}'.`)
    }

    else if (args.length === 2) {
      this.code = args[0]
      this.error = new ResultError(this.code, args[1])
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
export function Err<Code extends string | number | null | undefined>(code: Code, message: string): ErrResult<Code>
export function Err<Code extends string | number | null | undefined>(code: Code, message: string, cause: unknown): ErrResult<Code>
export function Err(...args: []) {
  return new ErrResult(...args)
}
