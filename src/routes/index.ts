import { boardRouter } from './board'
import { accountRouter } from './account'
export default () => {
  return {
    boardRouter,
    accountRouter
  }
}
