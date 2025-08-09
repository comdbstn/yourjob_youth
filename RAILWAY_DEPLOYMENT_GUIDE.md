# 🚀 Railway pleasing-gratitude 프로젝트 완벽 배포 가이드

## 📊 현재 서비스 구성
- **MySQL**: 데이터베이스 서비스
- **Redis**: 캐시 및 세션 저장소
- **Backend**: Spring Boot API 서버
- **BFF**: Backend for Frontend 서비스  
- **Frontend**: React 웹 애플리케이션

## 🔧 1. MySQL 서비스 설정

### 자동 생성된 환경변수 (수정 불필요)
```bash
MYSQL_URL=mysql://username:password@host:port/railway
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6543
MYSQL_DATABASE=railway
MYSQL_USERNAME=root  
MYSQL_PASSWORD=자동생성됨
```

### 추가 설정 (선택사항)
Railway → MySQL 서비스 → Variables 탭에 추가:
```bash
MYSQL_CHARSET=utf8mb4
MYSQL_COLLATION=utf8mb4_unicode_ci
```

## 🔴 2. Redis 서비스 설정

### 자동 생성된 환경변수 (수정 불필요)
```bash
REDIS_URL=redis://default:password@host:port
REDIS_HOST=containers-us-west-xxx.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=자동생성됨
```

## 🔙 3. Backend 서비스 설정

Railway → Backend 서비스 → Variables 탭에서 다음 환경변수들을 설정:

### 필수 데이터베이스 설정
```bash
DATABASE_URL=${{MySQL.DATABASE_URL}}
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USERNAME}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
```

### 필수 Redis 설정
```bash
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
```

### 필수 보안 설정
```bash
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production-key-change-this
JWT_EXPIRATION=86400000
```

### 이메일 설정
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=jys13230@gmail.com
SMTP_PASSWORD=bo020623
```

### AWS S3 설정 (선택사항)
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=yourjob-uploads-production
```

### Toss 결제 설정 (선택사항)
```bash
TOSS_CLIENT_KEY=test_ck_your_client_key_here
TOSS_SECRET_KEY=test_sk_your_secret_key_here
```

### 애플리케이션 설정
```bash
APP_ENV=production
APP_DEBUG=false
SPRING_PROFILES_ACTIVE=production
API_RATE_LIMIT=1000
SERVER_PORT=8082
```

## 🔄 4. BFF 서비스 설정

Railway → BFF 서비스 → Variables 탭에서 다음 환경변수들을 설정:

### Backend 연결 설정
```bash
BACKEND_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
BACKEND_HOST=${{Backend.RAILWAY_PRIVATE_DOMAIN}}
BACKEND_PORT=8082
```

### JWT 설정 (Backend와 동일해야 함)
```bash
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production-key-change-this
```

### 애플리케이션 설정
```bash
APP_ENV=production
APP_DEBUG=false
SPRING_PROFILES_ACTIVE=production
API_RATE_LIMIT=1000
SERVER_PORT=8083
```

## 🎨 5. Frontend 서비스 설정

Railway → Frontend 서비스 → Variables 탭에서 다음 환경변수들을 설정:

### API 엔드포인트 설정
```bash
REACT_APP_API_BASE_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
REACT_APP_BFF_BASE_URL=https://${{BFF.RAILWAY_PUBLIC_DOMAIN}}
```

### Firebase 설정 (있는 경우)
```bash
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 빌드 설정
```bash
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

## 🚀 6. 배포 순서

### 1단계: 데이터베이스 서비스 배포
1. **MySQL** 서비스가 정상 실행 중인지 확인
2. **Redis** 서비스가 정상 실행 중인지 확인

### 2단계: Backend 서비스 배포
1. Backend 서비스에 모든 환경변수 설정 완료
2. Railway에서 Backend 서비스 배포 실행
3. 로그 확인: `Railway → Backend → Deployments → View Logs`

### 3단계: BFF 서비스 배포
1. Backend 배포 완료 후 BFF 환경변수 설정
2. Railway에서 BFF 서비스 배포 실행
3. 로그 확인: `Railway → BFF → Deployments → View Logs`

### 4단계: Frontend 서비스 배포
1. Backend, BFF 배포 완료 후 Frontend 환경변수 설정
2. Railway에서 Frontend 서비스 배포 실행
3. 로그 확인: `Railway → Frontend → Deployments → View Logs`

## 🔍 7. 배포 확인 방법

### 서비스별 헬스 체크
```bash
# Backend 헬스 체크
GET https://backend-service-url/actuator/health

# BFF 헬스 체크  
GET https://bff-service-url/health

# Frontend 접속 확인
GET https://frontend-service-url
```

### 로그 확인 방법
1. Railway Dashboard → 각 서비스 선택
2. Deployments 탭 → 최신 배포 선택  
3. View Logs 클릭하여 실시간 로그 확인

## 🚨 8. 문제 해결

### 공통 문제
1. **빌드 실패**: `gradle` 권한 확인, `./gradlew` 실행 가능하게 설정
2. **데이터베이스 연결 실패**: MySQL 환경변수 올바른지 확인
3. **서비스 간 통신 실패**: `${{Service.RAILWAY_PUBLIC_DOMAIN}}` 형식 확인

### Backend 관련 문제
- **포트 에러**: `SERVER_PORT=8082` 설정 확인
- **JAR 실행 실패**: `backend-app.jar` 파일명 확인
- **데이터베이스 초기화**: MySQL 스키마 및 데이터 확인

### Frontend 관련 문제
- **API 호출 실패**: `REACT_APP_*` 환경변수들 올바른지 확인
- **CORS 에러**: Backend에서 Frontend 도메인 허용 설정 확인

## 🔐 9. 보안 권장사항

1. **JWT_SECRET**: 강력한 32자 이상의 랜덤 키 사용
2. **데이터베이스**: Railway 자동 생성 비밀번호 사용 (변경하지 말 것)
3. **API 키**: 실제 프로덕션 키로 교체
4. **CORS**: 특정 도메인만 허용하도록 설정

## 📊 10. 모니터링

### Railway 내장 모니터링
- CPU/메모리 사용량 확인
- 요청 수 및 응답 시간 모니터링
- 에러 로그 실시간 확인

### 외부 모니터링 도구 연동 (선택사항)
- Sentry: 에러 추적
- DataDog: 성능 모니터링
- LogRocket: 사용자 세션 기록

---

## ✅ 설정 완료 체크리스트

- [ ] MySQL 서비스 정상 실행
- [ ] Redis 서비스 정상 실행  
- [ ] Backend 환경변수 모두 설정
- [ ] BFF 환경변수 모두 설정
- [ ] Frontend 환경변수 모두 설정
- [ ] 모든 서비스 성공적으로 배포
- [ ] 서비스 간 통신 정상 작동
- [ ] 프로덕션 도메인 접속 확인

모든 설정이 완료되면 https://frontend-domain-url 에서 완전한 애플리케이션을 확인할 수 있습니다! 🎉