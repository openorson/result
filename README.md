# @orsonkit/result

[![npm](https://img.shields.io/npm/v/@orsonkit/result)](https://npmjs.com/package/@orsonkit/result)

Functional processing function return results, eliminating try-catch in the code. This library is inspired by rust result, but not exactly the same as rust result. I improved it to make it more suitable for JavasSript/TypeScript environment.

## Install

```bash
npm i @orsonkit/result
```

## Usage

### Ok

`Ok` is a factory function that returns an `OkResult` instance, indicating a ok result.

```typescript
import { Ok } from '@orsonkit/result'

function plus(a: number, b: number) {
  return Ok(a + b)
}

const value = plus(1, 2).unwrap()
console.log(value) // 3
```

Parameters:

* `value` : `Result` data value, default value is `null`.

Overloads:

```typescript
function Ok(): OkResult<null>
function Ok<Value>(value: Value): OkResult<Value>
```

### Err

`Err` is a factory function that returns an `ErrResult` instance, indicating an error result.

```typescript
import { Err, Ok } from '@orsonkit/result'

function plus(a: unknown, b: unknown) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    return Err('TypeError')
  }
  return Ok(a + b)
}

try {
  const value = plus(1, '2').expect('cannot plus')
}
catch (error) {
  // ResultError: cannot plus
  // at...
  // code: TypeError
  console.error(error)
}
```

Parameters:

* `code` : Error code, default value is `null`.
* `message` : Error message. The default value is a message with code description.
* `cause` : Error reason, default value is `undefined`.

Overloads:

```typescript
function Err(): ErrResult<null>
function Err<Code extends string | number | null | undefined>(code: Code): ErrResult<Code>
function Err<Code extends string | number | null | undefined>(code: Code, error: Error): ErrResult<Code>
function Err<Code extends string | number | null | undefined>(code: Code, message: string): ErrResult<Code>
function Err<Code extends string | number | null | undefined>(code: Code, message: string, cause: unknown): ErrResult<Code>
```

### Result

`OkResult` and `ErrResult` extend from `Result`, indicating an result type.

#### `isOk`

`Result` is `OkResult`?

Overloads:

```typescript
function isOk(): this is OkResult
```

Examples:

```typescript
import { Ok } from '@orsonkit/result'

const result = Ok()
result.isOk() // true
result.isErr() // false
```

#### `isOk`

`Result` is `ErrResult`?

Overloads:

```typescript
function isErr(): this is ErrResult
```

Examples:

```typescript
import { Err } from '@orsonkit/result'

const result = Err()
result.isOk() // false
result.isErr() // true
```

#### `expect`

* If this is an `OKResult`, this value is returned.
* If this is an `ErrResult`, throw a `ResultError` error.

Parameters:

* `message` : error message.

Overloads:

```typescript
function expect()
function expect(message: string)
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

Ok().expect() // null
Ok(1).expect() // 1

Err().expect() // throw error with default message
Err().expect('Oops!') // throw error with specified message
```

#### `unwrap`

* If this is an `OKResult`, this value is returned.
* If this is an `ErrResult`.
  * If default value is specified, default value is returned.
  * If default value is not specified, throw a `ResultError` error.

Parameters:

* `defaultValue` : default value.

Overloads:

```typescript
function unwrap()
function unwrap(defaultValue: any)
function unwrap(defaultValue: Promise<any>)
function unwrap(defaultValue: () => any)
function unwrap(defaultValue: () => Promise<any>)
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

Ok().unwrap() // null
Ok(1).unwrap() // 1
Ok(1).unwrap(2) // 1

Err().unwrap() // throw error with default message
Err().unwrap(1) // 1
Err().unwrap(Promise.resolve(1)) // Promise<1>
Err().unwrap(() => 1) // 1
Err().unwrap(async () => 1) // Promise<1>
```

#### `fix`

* If this is an `OKResult`, this value is returned.
* If this is an `ErrResult`.
  * Code is not specified, the fixer call result is returned.
  * Code is specified, the fixer is called and the call result is returned only when the `ErrResult` code is equal to the specified code.

Parameters:

* `code` : the error code to be fixed.
* `fixer` : error fixer.

Overloads:

```typescript
function repair(code: string | number | null | undefined, fixer: Result)
function repair(code: string | number | null | undefined, fixer: Promise<Result>)
function repair(code: string | number | null | undefined, fixer: () => Result)
function repair(code: string | number | null | undefined, fixer: () => Promise<Result>)
function repair(fixer: Result)
function repair(fixer: Promise<Result>)
function repair(fixer: () => Result)
function repair(fixer: () => Promise<Result>)
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

function plus(a: unknown, b: unknown) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    return Err('TypeError')
  }
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return Err('ValueError')
  }
  return Ok(a + b)
}

plus(1, 2).fix('TypeError', Ok(true)).unwrap() // 3
plus(1, '2').fix('TypeError', Ok(true)).unwrap() // true
plus(1, '2').fix('ValueError', Ok(true)).unwrap() // throw error with code 'TypeError'

plus(1, '2').fix('TypeError', Ok(true)) // OkResult<true>
plus(1, '2').fix('TypeError', Promise.resolve(Ok(true))) // Promise<OkResult<true>>
plus(1, '2').fix('TypeError', () => Ok(true)) // OkResult<true>
plus(1, '2').fix('TypeError', async () => Ok(true)) // Promise<OkResult<true>>

plus('1', Number.NaN).fix('TypeError', Ok(true)).fix('ValueError', Ok(true)) // OkResult<true>
plus('1', Number.NaN).fix(Ok(true)) // OkResult<true>
```

### resultify

* Convert the return value of the function to the result.

Parameters:

* `fn` : function
* `code` : `ErrResult` code
* `message` : `ErrResult` message
* `args` : function args

Overloads:

```typescript
function resultify(fn: (...args: Args) => any, ...args: Args)
function resultify(fn: (...args: Args) => Promise<any>, ...args: Args)
function resultify(code: string | number | null | undefined, fn: (...args: Args) => any, ...args: Args)
function resultify(code: string | number | null | undefined, fn: (...args: Args) => Promise<any>, ...args: Args)
function resultify(code: string | number | null | undefined, message: string, fn: (...args: Args) => any, ...args: Args)
function resultify(code: string | number | null | undefined, message: string, fn: (...args: Args) => Promise<any>, ...args: Args)
```

Examples:

```typescript
import { resultify } from '@orsonkit/result'

function plus(a: unknown, b: unknown) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('type error')
  }
  return a + b
}

resultify(plus, 1, 2) // OkResult(3)
resultify(plus, 1, '2') // ErrResult(null)

resultify('TypeError', plus, 1, '2') // ErrResult('TypeError')
resultify('TypeError', 'cannot plus', plus, 1, '2') // ErrResult('TypeError')
```

### callbackResultify

* Convert the return value of the callback function to the result.

Parameters:

* `fn` : callback function
* `options` :
  * `code` : `ErrResult` code
  * `message`: `ErrResult` message
  * `resolve`: property name of the success callback function, default value is "success"
  * `reject`: property name of the fail callback function, default value is "fail"
* `args` : callback function args

Overloads:

```typescript
function callbackResultify(fn: (options: Options, ...args: Args) => any, options: Omit<Options, 'success' | 'fail'>, ...args: Args)
function callbackResultify(
  options: {
    code?: string | number | null | undefined
    message?: string
    resolve?: string
    reject?: string
  },
  fn: (options: Options, ...args: Args) => any,
  options: Omit<Options, Resolve | Reject>,
  ...args: Args
)
```

Examples:

```typescript
import { callbackResultify } from '@orsonkit/result'

interface RequestOptions {
  success: (response: Response) => void
  fail: (error: Error) => void
}

function request(options: RequestOptions) {
  // do request...
}

const result = await callbackResultify(request) // OkResult | ErrResult

if (result.isOk()) {
  result // OkResult([response: Response])
}
else {
  result // ErrResult(code: null, message: default message, cause: Error)
}
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [openorson](https://github.com/openorson)
