# Railway 배포 가이드

## 사전 준비

### 1. Railway 계정 및 프로젝트 설정
- Railway 계정 생성: https://railway.app/
- 새 프로젝트 생성
- GitHub 리포지토리 연결

### 2. 데이터베이스 설정
Railway에서 MySQL과 Redis 추가:
1. 프로젝트 대시보드 → Add Service → Database → MySQL
2. 프로젝트 대시보드 → Add Service → Database → Redis

### 3. 환경변수 설정
각 서비스의 Environment Variables에 다음 값들을 설정하세요:

#### 공통 환경변수
```
APP_ENV=production
APP_DEBUG=false
BUILD_TARGET=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
SESSION_SECRET=your-session-secret-production
```

#### Backend 서비스
```
# Railway가 자동으로 제공
DATABASE_URL=mysql://...
MYSQL_URL=mysql://...
DATABASE_HOST=...
DATABASE_PORT=3306
DATABASE_NAME=...
DATABASE_USER=...
DATABASE_PASSWORD=...

# Redis (Railway가 자동으로 제공)
REDIS_URL=redis://...
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...

# 직접 설정 필요
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket

TOSS_CLIENT_KEY=your-client-key
TOSS_SECRET_KEY=your-secret-key

CORS_ORIGINS=https://yourjob-frontend.up.railway.app
```

#### BFF 서비스
```
BACKEND_URL=https://yourjob-backend.up.railway.app
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
```

#### Frontend 서비스
```
REACT_APP_API_BASE_URL=https://yourjob-backend.up.railway.app
REACT_APP_BFF_BASE_URL=https://yourjob-bff.up.railway.app

# Firebase (선택사항)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 배포 단계

### 1. 서비스 추가 및 설정

1. **Backend 서비스**
   - Add Service → GitHub Repo → backend 폴더 선택
   - Root Directory: `/backend`
   - Build Command: `gradle clean build`
   - Start Command: 자동 감지됨

2. **BFF 서비스**
   - Add Service → GitHub Repo → bff 폴더 선택
   - Root Directory: `/bff`
   - Build Command: `gradle clean build`
   - Start Command: 자동 감지됨

3. **Frontend 서비스**
   - Add Service → GitHub Repo → frontend 폴더 선택
   - Root Directory: `/frontend`
   - Build Command: `npm run build`
   - Start Command: 자동 감지됨

### 2. 배포 순서
1. 데이터베이스 서비스 먼저 배포 (MySQL, Redis)
2. Backend 서비스 배포
3. BFF 서비스 배포
4. Frontend 서비스 배포

### 3. 도메인 설정
- 각 서비스의 Settings → Networking에서 커스텀 도메인 설정 가능
- Let's Encrypt SSL 인증서 자동 적용

## 트러블슈팅

### 일반적인 문제들

1. **빌드 실패**
   - Dockerfile에서 gradle-wrapper.jar 파일이 있는지 확인
   - 메모리 부족 시 Railway 플랜 업그레이드 고려

2. **데이터베이스 연결 오류**
   - 환경변수가 정확히 설정되었는지 확인
   - DATABASE_URL 형식이 올바른지 확인

3. **CORS 오류**
   - Backend에서 CORS_ORIGINS 환경변수에 Frontend URL 추가
   - Spring Security 설정 확인

4. **건강 상태 확인 실패**
   - 각 서비스의 health check 엔드포인트 확인
   - PORT 환경변수 설정 확인

### 로그 확인
```bash
# Railway CLI 설치 후
railway logs --service backend
railway logs --service bff  
railway logs --service frontend
```

## 보안 설정

1. **환경변수 보안**
   - 모든 민감한 정보는 환경변수로 설정
   - .env 파일은 Git에 커밋하지 않음

2. **HTTPS 강제**
   - Railway는 기본적으로 HTTPS 제공
   - HTTP → HTTPS 리디렉션 자동 적용

3. **데이터베이스 보안**
   - Railway의 private networking 사용
   - 외부 접근 차단

## 모니터링

1. **Railway 대시보드**
   - CPU, 메모리, 네트워크 사용량 모니터링
   - 로그 실시간 확인

2. **애플리케이션 모니터링**
   - Spring Boot Actuator 엔드포인트 활용
   - 커스텀 health check 구현

## 비용 최적화

1. **리소스 최적화**
   - 사용하지 않는 서비스 제거
   - 적절한 인스턴스 크기 선택

2. **Sleep 모드**
   - Hobby 플랜에서는 비활성 시 자동 sleep
   - 첫 요청 시 cold start 발생 가능

## 추가 설정

### SSL 인증서
- Railway에서 자동으로 Let's Encrypt 인증서 제공
- 커스텀 인증서 업로드 가능

### 환경별 배포
- 개발/스테이징/프로덕션 환경 분리
- GitHub 브랜치별 자동 배포 설정

### 백업
- Railway는 자동 백업 제공
- 중요한 데이터는 별도 백업 전략 수립

## 지원 및 문서
- Railway 공식 문서: https://docs.railway.app/
- Discord 커뮤니티: https://discord.gg/railway
- GitHub Issues: https://github.com/railwayapp/railway/issues