import { localLogin, kakao, naver, facebook, google } from './passport'

export const passportConfig = {
  config: (): void => {
    localLogin()
    kakao()
    naver()
    facebook()
    google()
  }
}
