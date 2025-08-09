# YourJob Platform 설정 가이드

## 🚀 로컬 개발 환경 설정

### 1. 필수 소프트웨어 설치
```bash
# Docker & Docker Compose 설치 필요
# Windows: Docker Desktop
# Mac: Docker Desktop  
# Linux: docker, docker-compose
```

### 2. 즉시 실행 (최소 설정)
```bash
cd yourjob_repo
cp .env.example .env
./deploy.sh deploy development
```

### 3. 접속 URL
- 메인 사이트: http://localhost
- 관리자: http://localhost/admin  
- API 문서: http://localhost:8082/swagger-ui.html
- Grafana: http://localhost:3001 (admin/admin123)

## 🔧 상세 설정 (프로덕션용)

### A. 데이터베이스 (자동 설정됨)
✅ **MySQL**: 자동 생성 및 초기화
✅ **Redis**: 캐시 시스템 자동 구성

### B. 파일 스토리지 (선택사항)
🔶 **AWS S3** (이력서 파일 업로드용)
```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key  
AWS_S3_BUCKET=your-bucket-name
```
💡 **없어도 됨**: 로컬 파일시스템 사용 가능

### C. 결제 시스템 (선택사항)
🔶 **Toss Payments** (프리미엄 기능용)
```env
TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```
💡 **없어도 됨**: 테스트 모드로 동작

### D. 이메일 발송 (선택사항)
🔶 **SMTP** (회원가입 인증용)
```env
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com  
SMTP_PASSWORD=your-app-password
```
💡 **없어도 됨**: 개발 모드에서 스킵

### E. 외부 API (선택사항)
🔶 **Google Maps** (위치 서비스)
🔶 **Firebase** (푸시 알림)
🔶 **Slack** (관리자 알림)

## 🕷 크롤링 시스템

### 크롤링 대상 사이트
1. **사람인** (saramin.co.kr) - ✅ 준비됨
2. **잡코리아** (jobkorea.co.kr) - ✅ 준비됨  
3. **원티드** (wanted.co.kr) - 🔶 비활성화 (개발용)

### 크롤링 설정
```sql
-- 크롤링 간격 조정 (분 단위)
UPDATE crawler_configs SET crawl_interval = 30 WHERE site_name = 'saramin';

-- 크롤링 활성화/비활성화  
UPDATE crawler_configs SET is_active = 1 WHERE site_name = 'wanted';
```

### 크롤링 모니터링
- 관리자 패널: http://localhost/admin/crawler
- 통계: http://localhost:3001 (Grafana)
- 로그: `docker logs yourjob-backend`

## 🔒 보안 설정

### JWT 시크릿 키 (중요!)
```env
# 32자 이상의 랜덤 문자열 필수
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

### 관리자 계정 (기본값)
```
이메일: admin@yourjob.com
비밀번호: admin123  
⚠️ 프로덕션에서 반드시 변경!
```

## 📊 모니터링 대시보드

### Grafana 접속
- URL: http://localhost:3001
- 계정: admin / admin123
- 대시보드: 자동 생성됨

### 모니터링 항목
- 시스템 리소스 (CPU, 메모리, 디스크)
- API 응답시간 및 에러율
- 사용자 가입/로그인 통계
- 채용공고 등록/조회 통계  
- 크롤링 성공률 및 처리량

## 🚨 문제 해결

### 1. Docker 메모리 부족
```bash
# Docker Desktop > Settings > Resources
# Memory: 4GB 이상 할당 권장
```

### 2. 포트 충돌
```bash
# 사용중인 포트 확인
netstat -an | findstr :3306
netstat -an | findstr :8082

# 다른 MySQL/서비스 중지 후 재시도
```

### 3. 크롤링 실패
```bash
# 크롤러 로그 확인
docker logs yourjob-backend | grep -i crawler

# 크롤러 재시작
curl -X POST http://localhost:8082/api/admin/crawler/restart
```

### 4. 데이터베이스 초기화
```bash
./dev.sh db:reset
# 또는
docker-compose down -v
./deploy.sh deploy development
```

## 📈 성능 최적화

### 개발환경 리소스 절약
```env
# .env 파일에서 조정
CRAWLER_MAX_CONCURRENT=1  # 크롤러 동시 실행 수 줄이기
JAVA_OPTS=-Xmx1g          # JVM 메모리 제한
```

### 프로덕션 최적화  
```env
CRAWLER_MAX_CONCURRENT=5
JAVA_OPTS=-Xmx4g
```

## 🎯 개발 워크플로우

### 1. 백엔드 개발
```bash
./dev.sh backend run
# http://localhost:8082
```

### 2. 프론트엔드 개발  
```bash  
./dev.sh frontend run
# http://localhost:3000
```

### 3. 전체 시스템 테스트
```bash
./deploy.sh deploy development  
./deploy.sh health
```

---

## ✨ 요약: 바로 시작하기

**99% 자동화되어 있음!** 필요한 것:

1. ✅ Docker 설치
2. ✅ `./deploy.sh deploy development` 실행
3. ✅ http://localhost 접속

**선택 사항들은 나중에 추가해도 됩니다!** 🚀