export const authRegisterMailing = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mail Template SignUp</title>
  <style>
    .container {
      width: 100%;
      max-width: 42rem;
    }
    .main {
      padding: 1rem;
    }
    .subtitle {
      font-size: 1.25rem;
      line-height: 1.75rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
      color: #111827;
      }
      .description {
        font-size: 1rem;
        color: #374151;
      }
      .content {
        margin-bottom: 1.5rem;
        padding: 1.5rem 1rem;
        border-top: 1px solid #D1D5DB;
        border-bottom: 1px solid #D1D5DB;
      }
      .email {
        margin-bottom: 1rem;
      }
      .label  {
        display: inline-block;
        width: 5rem;
        color: #6B7280;
      }
      .data {
        font-weight: 600;
        color: #111827;
      }
      .footer {
        font-size: 12px;
        padding: 1.5rem 1rem;
        border-top: 1px solid #E5E7EB;
        background-color: #F9FAFB;
        color: #6B7280;
      }
      .link {
        color: #3B82F6;
        text-decoration: underline;
      }
  </style>
</head>


<body>
  <div class="container">
  <img src="https://s3.ap-northeast-2.amazonaws.com/example.net/image-asset/mail_header_auth_mail.png" alt="회원가입" width="100%">

    <div class="main">
        <h3 class="subtitle" class="description">안녕하세요. 등록해 주셔서 감사합니다!</h3>
        <p class="description">회원가입을 위한 인증번호 입니다.</p>
        <p class="description">아래 인증번호를 확인하여 이메일 주소 인증을 완료해주세요.</p>
        <br />
        <div> 
          <div class="content">
            <div class="email"> 
              <span class="label">이메일</span>
              <a href="#" class="data"><%= emailAddress %></a>
            </div>
            <div> 
              <span class="label">인증번호</span>
              <span class="data"><%= authCode %></span>
            </div>
          </div>
    </div>
  </div>
  <div class="footer">
    본 메일은 발신전용 입니다.
    <br />
    계정 관련하여 궁금한 점이 있으시면 
    <a href="https://example.net/faq" class="link">FAQ</a>
    를 확인해보세요.
    <br />
    Copyright ⓒ 2021 Example. All Rights Reserved.
  </div>
</body>
</html>
`
export const authPasswordMailing = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mail Template ChangePassword</title>
  <style>
    .container {
      width: 100%;
      max-width: 42rem;
    }
    .main {
      padding: 1rem;
    }
    .subtitle {
      font-size: 1.25rem;
      line-height: 1.75rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
      color: #111827;
      }
      .description {
        font-size: 1rem;
        color: #374151;
      }
      .content {
        margin-bottom: 1.5rem;
        padding: 2rem 0;
      }
      .label  {
        display: inline-block;
        width: 5rem;
        color: #6B7280;
      }
      .data {
        font-weight: 600;
        color: #111827;
      }
      .footer {
        font-size: 12px;
        padding: 1.5rem 1rem;
        border-top: 1px solid #E5E7EB;
        background-color: #F9FAFB;
        color: #6B7280;
      }
      .link {
        color: #3B82F6;
        text-decoration: underline;
      }
      .buttonStyle {
        background-color: #43AEBE;
        color: white;
        padding: 16px 16px;
        border: 1px solid transparent;
        border-radius: 4px;
        text-decoration: none;
      }
  </style>
</head>

<body>
  <div class="container">
  <img src="https://s3.ap-northeast-2.amazonaws.com/example.net/image-asset/mail_header_reset_password.png" alt="비밀번호변경" width="100%">
    <div class="main">
        <h3 class="subtitle">비밀번호 변경을 위한 인증메일 입니다.</h3>
        <p class="description">비밀번호를 변경하시려면 아래 링크를 클릭하세요.</p>
        <p class="description">비밀번호 변경 링크는 이메일 발송 시점으로부터 5분동안 유효합니다.</p>
        <br />
        <div> 
          <div class="content">
            <a href="https://example.net/account/changePassword/?email=<%= emailAddress %>&authCode=<%= authCode %>" class="buttonStyle">비밀번호 변경하기</a>
          </div>
    </div>
  </div>
  <div class="footer">
    본 메일은 발신전용 입니다.
    <br />
    계정 관련하여 궁금한 점이 있으시면 
    <a href="https://example.net/faq" class="link">FAQ</a>
    를 확인해보세요.
    <br />
    Copyright ⓒ 2021 Example. All Rights Reserved.
  </div>
</body>
</html>`
