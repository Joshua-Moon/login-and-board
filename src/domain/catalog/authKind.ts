export const AuthKind = [
  'EMAIL',
  'KAKAO',
  'NAVER',
  'GOOGLE',
  'FACEBOOK'
] as const

export function isValidAuthKind(
  input: unknown
): input is typeof AuthKind[number] {
  for (const authKind of AuthKind) {
    if (authKind === input) {
      return true
    }
  }
  return false
}
