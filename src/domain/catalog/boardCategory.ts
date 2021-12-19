export const BoardCategory = ['BUY', 'SELL', 'SHARE'] as const

export function isValidBoardCategory(
  input: unknown
): input is typeof BoardCategory[number] {
  for (const boardCategory of BoardCategory) {
    if (boardCategory === input) {
      return true
    }
  }
  return false
}
