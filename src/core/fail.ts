export interface Fail {
  kind: 'fail'
  message: string
  status?: number
}

export function isFail(input: any): input is Fail {
  if (input.kind === 'fail') {
    return true
  }
  return false
}

export function fail(message: string, status?: number): Fail {
  return {
    kind: 'fail',
    message,
    status
  }
}
