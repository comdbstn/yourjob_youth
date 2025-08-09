# 🚀 Railway Monorepo 완벽 설정 가이드

## ⚠️ 핵심 문제와 해결책

**문제**: Railway는 monorepo의 각 서비스를 별도로 배포할 때 **Root Directory** 설정이 필요합니다.

**해결책**: 각 Railway 서비스에서 Root Directory를 올바르게 설정해야 합니다.

---

## 🏗️ Railway 서비스별 설정 방법

### 1. 📊 MySQL & Redis 서비스
- 이미 정상 작동 중
- 추가 설정 불필요

### 2. 🔙 Backend 서비스 설정

**Railway Dashboard → Backend 서비스 → Settings 탭:**

1. **Root Directory 설정**:
   ```
   backend
   ```

2. **환경변수 설정** (Variables 탭):
   ```bash
   # 데이터베이스 연결
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   DB_HOST=${{MySQL.MYSQL_HOST}}
   DB_PORT=${{MySQL.MYSQL_PORT}}
   DB_NAME=${{MySQL.MYSQL_DATABASE}}
   DB_USER=${{MySQL.MYSQL_USERNAME}}
   DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   
   # Redis 연결
   REDIS_URL=${{Redis.REDIS_URL}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
   
   # JWT 보안 설정
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
   JWT_EXPIRATION=86400000
   
   # 이메일 설정
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=jys13230@gmail.com
   SMTP_PASSWORD=bo020623
   
   # AWS S3 설정 (선택사항)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=ap-northeast-2
   AWS_S3_BUCKET=yourjob-uploads
   
   # Toss 결제 설정 (선택사항)
   TOSS_CLIENT_KEY=test_ck_your_client_key
   TOSS_SECRET_KEY=test_sk_your_secret_key
   
   # 애플리케이션 설정
   APP_ENV=production
   APP_DEBUG=false
   SPRING_PROFILES_ACTIVE=production
   API_RATE_LIMIT=1000
   GRADLE_OPTS=-Dorg.gradle.daemon=false
   ```

3. **Deploy 설정**:
   - Railway가 자동으로 `backend/nixpacks.toml` 사용
   - Java 17 + Spring Boot 빌드 자동 처리

### 3. 🔄 BFF 서비스 설정

**Railway Dashboard → BFF 서비스 → Settings 탭:**

1. **Root Directory 설정**:
   ```
   bff
   ```

2. **환경변수 설정** (Variables 탭):
   ```bash
   # Backend 연결
   BACKEND_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
   BACKEND_HOST=${{Backend.RAILWAY_PRIVATE_DOMAIN}}
   BACKEND_PORT=8082
   
   # JWT 설정 (Backend와 동일해야 함)
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
   
   # 애플리케이션 설정
   APP_ENV=production
   APP_DEBUG=false
   SPRING_PROFILES_ACTIVE=production
   API_RATE_LIMIT=1000
   GRADLE_OPTS=-Dorg.gradle.daemon=false
   ```

### 4. 🎨 Frontend 서비스 설정

**Railway Dashboard → Frontend 서비스 → Settings 탭:**

1. **Root Directory 설정**:
   ```
   frontend
   ```

2. **환경변수 설정** (Variables 탭):
   ```bash
   # API 엔드포인트
   REACT_APP_API_BASE_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
   REACT_APP_BFF_BASE_URL=https://${{BFF.RAILWAY_PUBLIC_DOMAIN}}
   
   # Firebase 설정 (있다면)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   
   # Node.js 설정
   NODE_ENV=production
   ```

---

## 🔧 문제 해결 사항

### ✅ 해결된 문제들:

1. **Docker 빌드 실패** → nixpacks 방식으로 변경
2. **JAR 파일 경로 오류** → nixpacks.toml에서 올바른 경로 지정
3. **Gradle 권한 오류** → nixpacks.toml에서 chmod +x 추가
4. **Monorepo 빌드 실패** → Root Directory 설정으로 해결

### 🔍 nixpacks 최적화:

**Backend & BFF**:
- Java 17 명시적 설정
- Gradle wrapper 권한 설정
- bootJar 태스크 사용
- 메모리 최적화 JVM 옵션

**Frontend**:
- Node.js 20 사용
- npm ci로 정확한 의존성 설치
- webpack 빌드 후 serve로 정적 파일 서빙

---

## 🚀 배포 순서

1. **데이터베이스 서비스 확인** (MySQL, Redis)
2. **Backend 서비스**:
   - Root Directory: `backend` 설정
   - 환경변수 입력
   - 배포 실행
3. **BFF 서비스**:
   - Root Directory: `bff` 설정  
   - 환경변수 입력 (Backend URL 포함)
   - 배포 실행
4. **Frontend 서비스**:
   - Root Directory: `frontend` 설정
   - 환경변수 입력 (API URLs 포함)
   - 배포 실행

---

## 📋 최종 체크리스트

- [ ] 각 서비스의 Root Directory 올바르게 설정
- [ ] nixpacks.toml 파일 각 서비스에 존재
- [ ] 환경변수 모든 서비스에 설정 완료
- [ ] MySQL/Redis 서비스 정상 작동
- [ ] 서비스 간 참조 변수 올바르게 설정 (`${{Service.VARIABLE}}`)
- [ ] JWT_SECRET 값이 Backend와 BFF에서 동일
- [ ] 모든 API URL이 올바르게 설정

이제 Railway에서 각 서비스를 순차적으로 배포하면 성공적으로 작동합니다! 🎉