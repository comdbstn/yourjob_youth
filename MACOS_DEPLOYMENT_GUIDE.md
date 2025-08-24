# 🍎 YourJob Platform - macOS 배포 가이드

macOS 환경에서 YourJob Platform을 개발하고 배포하기 위한 완벽한 가이드입니다.

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [환경 설정](#환경-설정)
3. [개발 환경 구축](#개발-환경-구축)
4. [로컬 배포](#로컬-배포)
5. [운영 배포](#운영-배포)
6. [트러블슈팅](#트러블슈팅)
7. [성능 최적화](#성능-최적화)

## 🖥️ 시스템 요구사항

### 최소 요구사항
- **macOS**: 11.0 (Big Sur) 이상
- **RAM**: 8GB 이상 (16GB 권장)
- **저장공간**: 20GB 이상의 여유 공간
- **CPU**: Intel x64 또는 Apple Silicon (M1/M2/M3)

### 권장 요구사항
- **macOS**: 12.0 (Monterey) 이상
- **RAM**: 16GB 이상
- **저장공간**: 50GB 이상의 여유 공간
- **네트워크**: 안정적인 인터넷 연결

## 🛠️ 환경 설정

### 1. 필수 소프트웨어 설치

#### Docker Desktop for Mac
```bash
# Homebrew를 통한 설치 (권장)
brew install --cask docker

# 또는 공식 사이트에서 다운로드
# https://docs.docker.com/desktop/mac/install/
```

#### Node.js (18.x 이상)
```bash
# Node.js 설치
brew install node@18

# 또는 nvm 사용 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Java 17
```bash
# Adoptium Temurin 17 설치 (권장)
brew install --cask temurin17

# Java 버전 확인
java --version
```

#### 기타 개발 도구
```bash
# Git (대부분 macOS에 이미 설치되어 있음)
brew install git

# curl (API 테스트용)
brew install curl

# 선택사항: MySQL 클라이언트
brew install mysql-client
```

### 2. Docker Desktop 설정 최적화

Docker Desktop 설정에서 다음과 같이 구성:

#### 리소스 설정
```
- Memory: 6GB (16GB RAM 시) / 4GB (8GB RAM 시)
- CPU: 4 cores (가능한 경우)
- Swap: 1GB
- Disk image size: 100GB
```

#### Advanced 설정
```
- Enable VirtioFS: ✅ (Apple Silicon에서 성능 향상)
- Enable Rosetta for x86/amd64: ✅ (Apple Silicon)
```

## 🚀 개발 환경 구축

### 1. 프로젝트 클론
```bash
# 프로젝트 클론
git clone https://github.com/your-org/yourjob_youth.git
cd yourjob_youth

# 권한 설정
chmod +x dev.sh deploy.macos.sh
```

### 2. 환경 변수 설정
```bash
# macOS 개발용 환경 변수 복사
cp .env.macos .env

# Frontend 환경 변수 설정
cd frontend
cp .env.macos .env
cd ..

# 필요시 환경 변수 수정
vim .env
```

### 3. 개발 환경 시작
```bash
# 개발 환경 시작 (DB + Redis만)
./dev.sh start

# 백엔드 개발 서버 시작 (별도 터미널)
./dev.sh backend run

# BFF 개발 서버 시작 (별도 터미널)
./dev.sh bff run

# 프론트엔드 개발 서버 시작 (별도 터미널)
./dev.sh frontend install
./dev.sh frontend run
```

### 4. 개발 서버 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8082
- **BFF**: http://localhost:8081
- **Database**: localhost:3306
- **Redis**: localhost:6379

## 🐳 로컬 배포

### 1. 전체 스택 Docker 배포
```bash
# macOS 최적화된 배포 스크립트 실행
./deploy.macos.sh deploy development

# 서비스 상태 확인
./deploy.macos.sh health

# 로그 확인
./deploy.macos.sh logs
```

### 2. 개별 서비스 배포
```bash
# 특정 서비스만 재시작
./deploy.macos.sh restart backend

# 특정 서비스 로그 확인
./deploy.macos.sh logs frontend 100
```

### 3. 모니터링 서비스 활성화
```bash
# 모니터링 포함 배포
docker-compose -f docker-compose.macos.yml --profile monitoring up -d
```

접속 주소:
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🌐 운영 배포

### 1. 환경 설정
```bash
# 운영용 환경 변수 설정
cp .env.example .env

# 보안 설정 업데이트 (필수!)
vim .env
```

**중요 설정 항목:**
```bash
# 강력한 JWT 시크릿 설정
JWT_SECRET=your-super-secure-jwt-secret-key-32-chars-minimum

# 데이터베이스 패스워드 변경
DB_PASSWORD=your-secure-db-password
MYSQL_ROOT_PASSWORD=your-secure-root-password

# Redis 패스워드 설정
REDIS_PASSWORD=your-secure-redis-password

# AWS S3 설정 (파일 업로드용)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-production-bucket

# SMTP 설정 (이메일 발송용)
SMTP_HOST=your-smtp-host
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password

# 결제 게이트웨이 설정
TOSS_CLIENT_KEY=your-production-client-key
TOSS_SECRET_KEY=your-production-secret-key
```

### 2. 운영 배포 실행
```bash
# 운영 모드로 배포
./deploy.macos.sh deploy production

# 시스템 정보 확인
./deploy.macos.sh info

# 헬스체크 실행
./deploy.macos.sh health
```

### 3. SSL/HTTPS 설정 (선택사항)
```bash
# SSL 인증서 디렉토리 생성
mkdir -p ssl

# Let's Encrypt 인증서 생성 (도메인이 있는 경우)
# 또는 자체 서명 인증서 생성 (개발용)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. Docker Desktop 관련 문제
```bash
# Docker 상태 확인
docker info

# Docker Desktop 재시작
killall Docker && open /Applications/Docker.app

# Docker 시스템 정리
docker system prune -a
```

#### 2. 포트 충돌 문제
```bash
# 포트 사용 확인
lsof -i :3000
lsof -i :8082

# 프로세스 종료
kill -9 <PID>
```

#### 3. 메모리 부족 문제
```bash
# Docker 메모리 사용량 확인
docker stats

# 사용하지 않는 컨테이너 정리
docker container prune
docker image prune
```

#### 4. Gradle 빌드 실패
```bash
# Gradle 캐시 정리
cd backend
./gradlew clean

# Gradle Wrapper 권한 확인
chmod +x gradlew

# Gradle 데몬 중지
./gradlew --stop
```

#### 5. Node.js/npm 문제
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### Apple Silicon (M1/M2/M3) 특별 고려사항

#### 1. 플랫폼 호환성
```bash
# x86 이미지 강제 사용 (필요시)
docker pull --platform linux/amd64 mysql:8.0

# 또는 docker-compose.yml에서 설정
platform: linux/amd64
```

#### 2. Rosetta 2 활용
Docker Desktop에서 "Use Rosetta for x86/amd64 emulation" 옵션 활성화

## ⚡ 성능 최적화

### 1. Docker 최적화

#### BuildKit 활성화
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

#### 멀티스테이지 빌드 활용
이미 Dockerfile에 구현되어 있음:
- Builder 스테이지: 의존성 다운로드 및 컴파일
- Production 스테이지: 최소한의 런타임 환경

### 2. 개발 환경 최적화

#### Gradle 설정
```bash
# macOS 최적화된 Gradle 설정 사용
cp gradle.macos.properties gradle.properties
```

#### Node.js 메모리 최적화
```bash
# .env.macos에 이미 포함된 설정
NODE_OPTIONS=--max_old_space_size=4096
```

### 3. 데이터베이스 최적화

#### MySQL 설정 최적화
```sql
-- my.cnf 또는 docker-compose에서 설정
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

#### Redis 설정 최적화
```bash
# docker-compose.macos.yml에 이미 포함된 설정
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## 📊 모니터링 및 로그

### 1. 로그 관리
```bash
# 실시간 로그 확인
./deploy.macos.sh logs [service-name]

# 특정 라인수만 확인
./deploy.macos.sh logs backend 50

# 로그 파일 위치
tail -f logs/nginx/access.log
tail -f logs/backend/application.log
```

### 2. 성능 모니터링
```bash
# 컨테이너 리소스 사용량 확인
docker stats

# 시스템 리소스 확인
top
htop
```

### 3. Grafana 대시보드
- http://localhost:3001 접속
- ID: admin, PW: admin (초기값)
- 사전 구성된 대시보드 활용

## 🔄 백업 및 복원

### 1. 데이터베이스 백업
```bash
# 백업 생성
docker-compose -f docker-compose.macos.yml exec db \
  mysqldump -u root -p yourjobdb > backup.sql

# 백업 복원
docker-compose -f docker-compose.macos.yml exec -T db \
  mysql -u root -p yourjobdb < backup.sql
```

### 2. 볼륨 백업
```bash
# 볼륨 목록 확인
docker volume ls

# 볼륨 백업
docker run --rm -v yourjob_mysql_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup.tar.gz -C /data .
```

## 🚀 CI/CD 설정

### GitHub Actions (예시)
```yaml
# .github/workflows/macos-test.yml
name: macOS Test
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Start services
        run: ./dev.sh start
      
      - name: Run tests
        run: |
          ./dev.sh backend test
          ./dev.sh frontend test
```

## 📞 지원

### 추가 도움이 필요한 경우:

1. **문서 확인**: README.md, docs/ 디렉토리
2. **이슈 리포트**: GitHub Issues
3. **커뮤니티**: Slack/Discord 채널
4. **이메일 지원**: support@yourjob.kr

---

## 📝 체크리스트

### 개발 환경 설정 완료 체크리스트
- [ ] Docker Desktop 설치 및 실행
- [ ] Node.js 18+ 설치
- [ ] Java 17 설치
- [ ] 프로젝트 클론
- [ ] 환경 변수 설정 (.env 파일)
- [ ] 개발 서버 실행 확인
- [ ] 브라우저에서 접속 확인

### 배포 완료 체크리스트
- [ ] 운영 환경 변수 설정
- [ ] SSL 인증서 설정 (운영환경)
- [ ] 데이터베이스 백업 설정
- [ ] 모니터링 대시보드 확인
- [ ] 로그 확인 및 알림 설정
- [ ] 성능 테스트 완료
- [ ] 보안 검토 완료

### 운영 체크리스트
- [ ] 정기 백업 확인
- [ ] 모니터링 알림 확인
- [ ] 보안 업데이트 적용
- [ ] 성능 지표 검토
- [ ] 사용자 피드백 수집

---

**🎉 축하합니다! macOS에서 YourJob Platform을 성공적으로 배포했습니다.**

추가 질문이나 문제가 있으시면 언제든 문의해 주세요!