export type Output<T> = {
  [key: number]: T
}

export type Outputs<T> = {
  [key: number]: T[]
  count: number
}

export type OutputId = {
  id: string
}

export type OutputMessage = {
  message: string
}

export type OutputToken = {
  accessToken: string
  refreshToken: string
}
