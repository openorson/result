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

const value = plus(1, 1).unwrap()
console.log(value) // 2
```

Parameters:

* `value` : `Result` value, default value is `null`.

Overloads:

```typescript
function Ok(): OkResult<null>
function Ok<Value>(value: Value): OkResult<Value>
```

### Err

`Err` is a factory function that returns an `ErrResult` instance, indicating an error result.

```typescript
import { Err, Ok } from '@orsonkit/result'

async function request(url: string) {
  const response = await fetch(url)

  if (response.ok) {
    return Ok(response)
  }

  return Err(response.status)
}

try {
  const response = (await request('https://example.com/api')).expect('request failed')
}
catch (error) {
  // ResultError: request failed
  // at...
  // code: response.status
  console.error(error)
}
```

Parameters:

* `code` : Error code, default value is `null`.
* `message` : Error message. The default value is a message with code description.
* `cause` : Error cause, default value is `undefined`.

Overloads:

```typescript
function Err(): ErrResult<null>
function Err<Code extends string | number | null | undefined>(code: Code): ErrResult<Code>
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
import { Err, Ok } from '@orsonkit/result'

Ok().isOk() // true
Err().isOk() // false
```

#### `isErr`

`Result` is `ErrResult`?

Overloads:

```typescript
function isErr(): this is ErrResult
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

Err().isErr() // true
Ok().isErr() // false
```

#### `expect`

* If this is an `OKResult`, this value is returned.
* If this is an `ErrResult`, throw a `ResultError` error.

Parameters:

* `message` : Error message.

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

* `defaultValue` : Default value.

Overloads:

```typescript
function unwrap()
function unwrap(defaultValue: any)
function unwrap(defaultValue: () => any)
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

#### `okTo`

* Convert `OkResult` to new `OkResult`.

Parameters:

* `value` : New value.

Overloads:

```typescript
function okTo()
function okTo(value: Value)
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

const ok = Ok(new Date()) // OkResult(Date)
const newOk = ok.okTo(ok.value.getTime()) // OkResult(number)
```

#### `errTo`

* Convert `ErrResult` to new `ErrResult`.

Parameters:

* `code` : New error code.
* `message` : New error message.

Overloads:

```typescript
function errTo()
function errTo(code: Code)
function errTo(code: Code, message: string)
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

const err = Err('UnknownError', 'error message') // ErrResult(code: 'UnknownError', message: 'error message')
err.errTo('TypeError', 'type error message') // ErrResult(code: 'TypeError', 'type error message', cause: err)
```

#### `fix`

* If this is an `OKResult`, this value is returned.
* If this is an `ErrResult`.
  * Code is not specified, the fixer call result is returned.
  * Code is specified, the fixer is called and the call result is returned only when the `ErrResult` code is equal to the specified code.

Parameters:

* `code` : Error code to be fixed.
* `fixer` : Error fixer.

Overloads:

```typescript
function fix(fixer: Result)
function fix(fixer: Promise<Result>)
function fix(fixer: () => Result)
function fix(fixer: () => Promise<Result>)
function fix(code: string | number | null | undefined, fixer: Result)
function fix(code: string | number | null | undefined, fixer: Promise<Result>)
function fix(code: string | number | null | undefined, fixer: () => Result)
function fix(code: string | number | null | undefined, fixer: () => Promise<Result>)
```

Examples:

```typescript
import { Err, Ok } from '@orsonkit/result'

function getAppElement() {
  const element = document.querySelector('#app')

  if (element) {
    return Ok(element)
  }

  return Err('AppElementNotFound')
}

const result = getAppElement()
const okResult = result.fix('AppElementNotFound', () => {
  const element = document.createElement('div')
  element.id = 'app'
  document.body.appendChild(element)
  return Ok(element)
})
const app = okResult.value // app element
```

### resultify

* Convert the return value of the function to the result.

Parameters:

* `fn` : Function.
* `code` : `ErrResult` code.
* `message` : `ErrResult` message.
* `args` : Function args.

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

async function request(url: string) {
  const response = await fetch(url)

  if (response.ok) {
    return response
  }

  throw new Error('request failed')
}

const result = await resultify(request, 'https://example.com/api')

if (result.isOk()) {
  result // OkResult(response)
}
else {
  result // ErrResult(code: null, message: 'request failed', cause: Error)
}
```

### callbackResultify

* Convert the return value of the callback function to the result.

Parameters:

* `fn` : Callback function.
* `options` :
  * `code` : `ErrResult` code.
  * `message`: `ErrResult` message.
  * `resolve`: Property name of the success callback function, default value is "success".
  * `reject`: Property name of the fail callback function, default value is "fail".
* `args` : Callback function args.

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

function request(options: {
  url: string
  success: (response: Response) => void
  fail: (error: Error) => void
}) {
  fetch(options.url).then(options.success).catch(options.fail)
}

const result = await callbackResultify({
  code: 'RequestFailedError',
  message: 'request failed',
  resolve: 'success',
  reject: 'fail',
}, request, { url: 'https://example.com/api' })

if (result.isOk()) {
  result // OkResult([response: Response])
}
else {
  result // ErrResult(code: 'RequestFailedError', message: 'request failed', cause: Error)
}
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [openorson](https://github.com/openorson)
