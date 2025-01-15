export class ResultError<Code> extends Error {
  static is<Code>(error: unknown): error is ResultError<Code> {
    return error instanceof ResultError
  }

  code: Code

  constructor(code: Code, ...args: ConstructorParameters<typeof Error>) {
    super(...args)

    this.name = 'ResultError'
    this.code = code
  }
}
