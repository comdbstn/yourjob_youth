# 🚀 Heroku 배포 가이드

## 사전 준비
1. Heroku 계정 생성: https://heroku.com/
2. Heroku CLI 설치 완료 ✅
3. Heroku 로그인: `heroku login`

## 배포 단계

### 1. Backend 서비스 배포

```bash
cd backend

# Heroku 앱 생성
heroku create yourjob-backend

# PostgreSQL 데이터베이스 추가 (무료)
heroku addons:create heroku-postgresql:hobby-dev

# Redis 추가 (무료)
heroku addons:create heroku-redis:hobby-dev

# 환경변수 설정
heroku config:set JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USERNAME=jys13230@gmail.com
heroku config:set SMTP_PASSWORD=bo020623
heroku config:set AWS_REGION=ap-northeast-2
heroku config:set APP_ENV=production
heroku config:set APP_DEBUG=false
heroku config:set SPRING_PROFILES_ACTIVE=production

# 배포
git subtree push --prefix=backend heroku main
```

### 2. BFF 서비스 배포

```bash
cd ../bff

# Heroku 앱 생성
heroku create yourjob-bff

# 환경변수 설정 (Backend URL은 나중에 업데이트)
heroku config:set JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
heroku config:set BACKEND_URL=https://yourjob-backend.herokuapp.com
heroku config:set APP_ENV=production
heroku config:set APP_DEBUG=false
heroku config:set SPRING_PROFILES_ACTIVE=production

# 배포
git subtree push --prefix=bff heroku main
```

### 3. Frontend 서비스 배포 (Vercel 권장)

```bash
cd ../frontend

# Vercel CLI 설치
npm install -g vercel

# Vercel 배포
vercel --prod

# 환경변수 설정 (Vercel Dashboard에서)
# REACT_APP_API_BASE_URL=https://yourjob-backend.herokuapp.com
# REACT_APP_BFF_BASE_URL=https://yourjob-bff.herokuapp.com
```

## 환경변수 설정 가이드

### Backend 필수 환경변수
```bash
# 데이터베이스 (Heroku가 자동 설정)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production

# 이메일 설정
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS S3 (선택사항)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket

# Toss 결제 (선택사항)
TOSS_CLIENT_KEY=your-client-key
TOSS_SECRET_KEY=your-secret-key
```

### BFF 환경변수
```bash
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
BACKEND_URL=https://yourjob-backend.herokuapp.com
```

### Frontend 환경변수
```bash
REACT_APP_API_BASE_URL=https://yourjob-backend.herokuapp.com
REACT_APP_BFF_BASE_URL=https://yourjob-bff.herokuapp.com
```

## 데이터베이스 초기화

```bash
# Backend 앱에서 데이터베이스 초기화 스크립트 실행
heroku pg:psql --app yourjob-backend < docker/mysql/initdb.d/01_init_schema.sql
```

## 로그 확인

```bash
heroku logs --tail --app yourjob-backend
heroku logs --tail --app yourjob-bff
```

## 스케일링

```bash
# 무료 dyno 사용 (기본)
heroku ps:scale web=1 --app yourjob-backend

# 유료 dyno로 업그레이드 (필요시)
heroku ps:type hobby --app yourjob-backend
```

## 도메인 설정

```bash
# 커스텀 도메인 추가 (유료 dyno 필요)
heroku domains:add api.yourdomain.com --app yourjob-backend
heroku domains:add bff.yourdomain.com --app yourjob-bff
```

## 모니터링

- Heroku Dashboard: https://dashboard.heroku.com/
- 애플리케이션 로그 실시간 확인
- 성능 메트릭스 모니터링
- 자동 스케일링 설정

## 비용 최적화

1. **무료 리소스 활용**
   - Hobby-dev PostgreSQL (무료)
   - Hobby-dev Redis (무료)
   - 550 dyno hours/월 무료

2. **Sleep 모드**
   - 30분 비활성 후 자동 sleep
   - 첫 요청 시 cold start (약 10-30초)

3. **유료 옵션**
   - Hobby dyno: $7/월 (sleep 없음)
   - Standard-1x: $25/월 (고성능)

## 장점

- ✅ Java/Spring Boot 완벽 지원
- ✅ PostgreSQL, Redis 내장 지원
- ✅ 자동 HTTPS
- ✅ Git 기반 자동 배포
- ✅ 로그 모니터링 내장
- ✅ 스케일링 간편

## 주의사항

- 환경변수의 실제 값들을 보안에 맞게 설정해주세요
- PostgreSQL을 사용하므로 MySQL 쿼리 호환성 확인 필요
- 무료 dyno는 sleep 모드가 있어서 첫 접속이 느릴 수 있음