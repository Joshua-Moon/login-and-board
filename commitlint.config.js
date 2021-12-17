// Angular Commit Message 기반 한글 버전
// https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines

module.exports = {
  parserPreset: {
    parserOpts: { headerPattern: /^([^\(\):]*)(?:\((.*)\))?!?: (.*)$/ }
  },
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        '버그',
        '빌드',
        '잡일',
        '배포',
        '문서',
        '기능',
        '수정',
        '성능',
        '리팩토링',
        '복원',
        '스타일',
        '테스트'
      ]
    ]
  }
}
