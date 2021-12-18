export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

export function guardSomeObject(input: unknown): input is object {
  if (typeof input !== 'object') {
    return false
  }

  if (input === null) {
    return false
  }
  return true
}
