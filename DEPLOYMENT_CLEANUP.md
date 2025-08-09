# 🧹 프로젝트 정리 및 배포 최적화 가이드

## ❌ 제거할 파일들

### 중복/불필요한 설정 파일
```bash
# Docker 관련 - Railway 사용하므로 불필요
rm docker-compose.dev.yml
rm docker-compose.override.yml  
rm docker-compose.prod.yml
rm docker-compose.railway.yml
rm -rf docker/

# Heroku 관련 - 사용하지 않음
rm backend/Procfile
rm bff/Procfile  
rm HEROKU_DEPLOYMENT.md

# 중복 환경파일
rm .env  # 로컬 개발용만 남기고
rm .env.railway  # Railway 대시보드에서 직접 설정

# 테스트/데모 파일들
rm -rf frontend/public/admin/  # 실제 사용하지 않는 정적 HTML들
rm -rf docs/  # 개발 문서는 README.md로 통합
```

## ✅ 핵심 설정 파일 정리

### 1. Frontend (Vercel)
- `frontend/package.json` ✅
- `frontend/nixpacks.toml` ❌ (Vercel은 자동감지)  
- `frontend/vercel.json` ✅

### 2. Backend (Railway)  
- `backend/build.gradle.kts` ✅
- `backend/nixpacks.toml` ✅ 
- `backend/system.properties` ✅

### 3. BFF (Railway)
- `bff/build.gradle.kts` ✅
- `bff/nixpacks.toml` ✅
- `bff/system.properties` ✅

## 🔧 Railway 배포 수정사항

### 1. nixpacks.toml 단순화
```toml
[phases.setup]
nixPkgs = ["openjdk17"]

[phases.build]
cmds = ["./gradlew clean bootJar --no-daemon"]

[phases.start] 
cmd = "java -jar build/libs/app.jar"
```

### 2. 환경변수 설정 (Railway 대시보드에서)
```bash
# Backend 서비스
DATABASE_URL=${{MySQL.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=production-secret-32-characters-min
PORT=8080

# BFF 서비스  
BACKEND_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
JWT_SECRET=production-secret-32-characters-min
PORT=8080
```

### 3. Frontend 환경변수 (Vercel)
```bash
REACT_APP_API_BASE_URL=https://backend-production-url
REACT_APP_BFF_BASE_URL=https://bff-production-url
```

## 🚀 배포 순서
1. 불필요한 파일 제거
2. nixpacks.toml 단순화  
3. Railway에서 환경변수 설정
4. 서비스별 순차 배포: MySQL → Redis → Backend → BFF
5. Vercel Frontend 환경변수 업데이트

## 🔐 보안 체크리스트
- [ ] Railway 환경변수에서 강력한 JWT_SECRET 설정
- [ ] SMTP 계정 정보 환경변수로 이동
- [ ] AWS S3 키 환경변수 설정  
- [ ] CORS 도메인 프로덕션 URL로 제한

## 📊 최종 배포 구조
```
Vercel Frontend → Railway BFF → Railway Backend → Railway MySQL/Redis
```