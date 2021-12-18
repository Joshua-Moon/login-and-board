## Setting

```bash
# docker build
./scripts/dev/docker-compose-build

# docker compose 사용
./scripts/dev/docker-compose-up

# docker 컨테이너 접속
docker attach <컨테이너 id>

# 의존성 설치 (설치가 안되어있는 경우에만)
pnpm install

# git hook init
pnpm husky install

# API 서버 실행
pnpm dev:watch
```

## Test(임시)

```bash
NODE_ENV=dev TARGET_LANG=ts ./node_modules/.bin/ts-node <테스트 파일 경로>
```
