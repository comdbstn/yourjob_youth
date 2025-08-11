# 🚀 YourJob Platform - 최종 배포 가이드

기획서 기준으로 정리된 완전한 배포 가이드입니다.

## ✅ **배포 전 필수 체크리스트**

### 🔐 **1단계: 보안 설정 (필수)**

#### A. 환경변수 설정
```bash
# .env 파일 수정 (반드시 변경 필요)
JWT_SECRET=your-super-secure-32-character-jwt-secret-key-here
SESSION_SECRET=your-secure-session-secret-key-here
DB_PASSWORD=your-strong-database-password
REDIS_PASSWORD=your-redis-password
```

#### B. 외부 서비스 계정 준비
- [ ] **AWS S3 버킷** 생성 및 IAM 사용자 설정
- [ ] **SMTP 계정** (Gmail 앱 비밀번호 또는 AWS SES)  
- [ ] **Toss Payments** 개발자 계정 (결제 기능용)

### 💾 **2단계: 데이터베이스 준비**

#### A. MySQL 설정 확인
```sql
-- 데이터베이스가 올바르게 초기화되는지 확인
-- docker/mysql/initdb.d/ 폴더의 SQL 파일들이 순서대로 실행됨
01_init_schema.sql         # 기본 테이블 구조
02_insert_dev_data.sql     # 개발용 데이터  
03_resume_detailed_tables.sql  # 이력서 관련 테이블
04_premium_products_payments.sql  # 결제 시스템
05_crawler_tables.sql      # 크롤러 시스템
06_admin_monitoring_tables.sql  # 관리자 기능
07_create_admin_user.sql   # 관리자 계정
```

### 🚀 **3단계: 배포 방식 선택**

## **Option 1: Railway (추천) - 가장 쉬움**

### 단계별 가이드:

#### Step 1: Railway 설정
```bash
# Railway CLI 설치 및 로그인
npm install -g @railway/cli
railway login
```

#### Step 2: 환경변수 설정
Railway 대시보드에서 다음 환경변수들 설정:
```
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret  
DB_HOST=${DATABASE_URL}  # Railway에서 자동 제공
DB_PASSWORD=${DATABASE_PASSWORD}  # Railway에서 자동 제공
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret  
AWS_S3_BUCKET=your-bucket-name
TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```

#### Step 3: 배포
```bash
# 프로젝트 연결
railway link

# 데이터베이스 서비스 추가 (Railway 대시보드에서)
# - MySQL 8.0 추가
# - Redis 추가

# 배포 실행
railway up
```

## **Option 2: Docker Compose (VPS/로컬)**

#### Step 1: 환경설정
```bash
# .env 파일 생성 및 설정
cp .env.example .env
# 위의 필수 환경변수들 모두 실제 값으로 변경
```

#### Step 2: 배포
```bash
# 도커 컴포즈로 전체 스택 실행
docker-compose up -d

# 헬스체크
curl http://localhost:8082/actuator/health
curl http://localhost:8081/health  
curl http://localhost:3000
```

## **Option 3: Vercel + Railway (프로덕션)**

#### Frontend (Vercel):
```bash
# Vercel CLI 설치
npm i -g vercel

# 프론트엔드 폴더에서
cd frontend
vercel --prod

# 환경변수 설정 (Vercel 대시보드)
REACT_APP_API_BASE_URL=https://your-backend.railway.app
REACT_APP_BFF_BASE_URL=https://your-bff.railway.app
```

#### Backend (Railway):
```bash
# Railway에서 백엔드, BFF 배포 (위의 Railway 가이드 참조)
```

---

## 🔧 **4단계: 배포 후 확인사항**

### 필수 테스트 체크리스트:
- [ ] **회원가입/로그인** 동작 확인
- [ ] **채용공고 목록** 로드 확인  
- [ ] **이력서 작성** 기능 확인
- [ ] **파일 업로드** (S3) 동작 확인
- [ ] **이메일 발송** 확인  
- [ ] **결제 시스템** 테스트 (Toss Payments)
- [ ] **관리자 대시보드** 접근 확인
- [ ] **크롤러 시스템** 동작 확인

### 성능 확인:
- [ ] **응답시간** < 2초
- [ ] **메모리 사용량** 안정적
- [ ] **데이터베이스 연결** 정상

---

## 🚨 **트러블슈팅**

### 자주 발생하는 문제들:

#### 1. 데이터베이스 연결 오류
```bash
# 해결책: DB 접속 정보 확인
docker logs yourjob-mysql
# 또는 Railway 로그 확인
```

#### 2. S3 파일 업로드 오류  
```bash
# 해결책: AWS 자격증명 및 버킷 권한 확인
# IAM 사용자에게 S3 FullAccess 권한 부여
```

#### 3. 이메일 발송 실패
```bash
# Gmail 사용 시: 앱 비밀번호 사용 필요
# 2단계 인증 활성화 후 앱 비밀번호 생성
```

#### 4. 프론트엔드 API 호출 실패
```bash  
# 해결책: CORS 설정 확인
# backend/src/main/resources/application.yml의 CORS_ORIGINS 설정
```

---

## 📊 **운영 모니터링**

### 권장 모니터링:
1. **서버 상태**: Railway 대시보드 또는 서버 모니터링
2. **데이터베이스**: 연결 수, 쿼리 성능
3. **파일 저장소**: S3 사용량
4. **이메일**: SMTP 발송 상태  
5. **결제**: Toss Payments 대시보드

---

## 🎯 **성공적인 배포를 위한 팁**

1. **단계적 배포**: 먼저 기본 기능부터 테스트
2. **백업 설정**: 데이터베이스 정기 백업
3. **로그 모니터링**: 에러 로그 실시간 확인
4. **성능 최적화**: 필요시 캐싱(Redis) 활용
5. **보안 강화**: HTTPS, 방화벽, 정기 보안 업데이트

---

**🎉 이 가이드를 따라하시면 완전한 YourJob Platform이 배포됩니다!**