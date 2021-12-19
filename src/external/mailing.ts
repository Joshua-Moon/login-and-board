import nodemailer from 'nodemailer'
import ejs from 'ejs'
import { htmlToText } from 'html-to-text'
import juice from 'juice'
import { authRegisterMailing, authPasswordMailing } from './mailing-asset'

import { mailing_config } from '../config'
import { Fail, fail } from '../core'
import { TypeORMError } from 'typeorm'

const transporter = nodemailer.createTransport({
  host: mailing_config.EMAIL_HOST,
  port: 587,
  auth: {
    user: mailing_config.EMAIL_HOST_USER,
    pass: mailing_config.EMAIL_HOST_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

function generateRandom(min: number, max: number): number {
  const ranNum: number = Math.floor(Math.random() * (max - min + 1)) + min
  return ranNum
}

export async function sendMail(
  email: string,
  token?: string
): Promise<string | Fail> {
  let subject = ''
  let template = ''
  let authCode = ''

  if (!token) {
    subject = '회원가입을 위한 인증번호를 입력해주세요.'
    template = authRegisterMailing
    authCode = String(generateRandom(111111, 999999))
  } else {
    subject = '비밀번호 재설정 안내입니다.'
    template = authPasswordMailing
    authCode = token
  }

  const templateVars = {
    emailAddress: email,
    authCode: authCode
  }
  const html = ejs.render(template, templateVars) // html에 동적 값 입력
  const text = htmlToText(html)
  const htmlWithStylesInlined = juice(html) // 스타일 태그 자동으로 inlining

  const mailOptions = {
    from: mailing_config.EMAIL_HOST_USER,
    to: email,
    subject: subject,
    html: htmlWithStylesInlined,
    text: text
  }
  try {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        return err.message
      }
      transporter.close()
    })
    return authCode
  } catch (e) {
    let err = e
    if (err instanceof TypeORMError) {
      err = `${err.name}: ${err.message}`
    }
    return fail(err as string, 503)
  }
}
