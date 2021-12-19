// export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'

export const Role = ['MEMBER', 'STAFF', 'MANAGER'] as const

export function isValidRole(input: unknown): input is typeof Role[number] {
  for (const role of Role) {
    if (role === input) {
      return true
    }
  }
  return false
}
