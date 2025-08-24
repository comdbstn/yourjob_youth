# 🚀 YourJob Platform - 배포 체크리스트

## 배포 전 체크리스트

### ✅ 1. 시스템 요구사항 확인
- [ ] macOS 11.0 (Big Sur) 이상
- [ ] 8GB RAM 이상 (16GB 권장)
- [ ] 20GB 이상 여유 디스크 공간
- [ ] 안정적인 인터넷 연결

### ✅ 2. 필수 소프트웨어 설치
```bash
# 자동 설치 스크립트 실행
./setup.macos.sh

# 또는 개별 설치
brew install --cask docker
brew install node@18
brew install --cask temurin17
```

### ✅ 3. 프로젝트 설정
```bash
# 실행 권한 부여
chmod +x dev.sh deploy.macos.sh setup.macos.sh

# 환경 변수 설정
cp .env.complete .env
cp frontend/.env.macos frontend/.env

# 환경 변수 수정 (필수!)
vim .env
```

### ✅ 4. 핵심 환경 변수 설정 확인
```bash
# 데이터베이스 설정
DB_HOST=localhost
DB_NAME=yourjobdb
DB_USER=urjob
DB_PASSWORD=secure-password

# JWT 보안 설정
JWT_SECRET=minimum-32-characters-secure-key

# API 엔드포인트
REACT_APP_API_BASE_URL=http://localhost:8082
REACT_APP_BFF_BASE_URL=http://localhost:8081
```

## 배포 실행

### 🔧 개발 환경 배포
```bash
# 1. 개발 서비스만 시작 (추천)
./dev.sh start

# 2. 백엔드 로컬 실행 (새 터미널)
./dev.sh backend run

# 3. 프론트엔드 로컬 실행 (새 터미널)
./dev.sh frontend install
./dev.sh frontend run

# 접속: http://localhost:3000
```

### 🐳 Docker 전체 스택 배포
```bash
# 개발 모드 배포
./deploy.macos.sh deploy development

# 상태 확인
./deploy.macos.sh health

# 접속: http://localhost:3000
```

### 🏭 운영 환경 배포
```bash
# 운영용 환경 변수 설정
cp .env.example .env
vim .env  # 운영 설정으로 수정

# 운영 모드 배포
./deploy.macos.sh deploy production

# 헬스체크
./deploy.macos.sh health
```

## 배포 후 검증

### ✅ 1. 서비스 접속 확인
- [ ] 프론트엔드: http://localhost:3000
- [ ] 백엔드 API: http://localhost:8082/actuator/health
- [ ] BFF: http://localhost:8081/health
- [ ] 관리자: http://localhost:3000/admin

### ✅ 2. 데이터베이스 연결 확인
```bash
# 데이터베이스 상태 확인
./dev.sh db:setup

# 또는 직접 연결 테스트
mysql -h localhost -P 3306 -u urjob -p yourjobdb
```

### ✅ 3. API 통신 테스트
```bash
# 백엔드 헬스체크
curl http://localhost:8082/actuator/health

# BFF 헬스체크
curl http://localhost:8081/health

# 프론트엔드 로딩 확인
curl http://localhost:3000
```

### ✅ 4. 로그 확인
```bash
# 모든 서비스 로그
./deploy.macos.sh logs

# 특정 서비스 로그
./deploy.macos.sh logs backend
./deploy.macos.sh logs frontend
```

### ✅ 5. 성능 확인
```bash
# 리소스 사용량 확인
docker stats

# 시스템 정보
./deploy.macos.sh info
```

## 트러블슈팅

### 🔧 일반적인 문제 해결

#### Docker 관련
```bash
# Docker Desktop 재시작
killall Docker && open /Applications/Docker.app

# Docker 시스템 정리
docker system prune -a
```

#### 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3000
lsof -i :8082

# 프로세스 종료
kill -9 <PID>
```

#### 빌드 실패
```bash
# 캐시 정리 후 재빌드
./dev.sh clean
./deploy.macos.sh cleanup
./deploy.macos.sh deploy development
```

#### 권한 문제
```bash
# 스크립트 권한 확인
chmod +x *.sh
chmod +x backend/gradlew
chmod +x bff/gradlew
```

### 🩺 헬스체크 실패 시
1. 서비스 로그 확인: `./deploy.macos.sh logs [service]`
2. 컨테이너 상태 확인: `docker ps -a`
3. 환경 변수 확인: `cat .env`
4. 포트 충돌 확인: `lsof -i :port`
5. 메모리 부족 확인: `docker stats`

## 성공 기준

### ✅ 배포 성공 확인
- [ ] 모든 컨테이너가 healthy 상태
- [ ] 프론트엔드 페이지 정상 로딩
- [ ] API 엔드포인트 응답 정상
- [ ] 데이터베이스 연결 정상
- [ ] 로그에 에러 없음

### 🎯 성능 기준
- [ ] 프론트엔드 로딩 시간 < 3초
- [ ] API 응답 시간 < 1초
- [ ] 메모리 사용량 < 4GB
- [ ] CPU 사용률 < 50%

## 운영 모니터링

### 📊 모니터링 서비스 (선택사항)
```bash
# 모니터링 포함 배포
docker-compose -f docker-compose.macos.yml --profile monitoring up -d

# 접속 주소
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

### 📝 정기 점검 항목
- [ ] 주간 백업 확인
- [ ] 로그 파일 크기 모니터링
- [ ] 시스템 리소스 사용량 확인
- [ ] 보안 업데이트 적용

## 지원 및 문의

### 📚 문서
- [MACOS_DEPLOYMENT_GUIDE.md](./MACOS_DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [QUICK_START_MACOS.md](./QUICK_START_MACOS.md) - 빠른 시작 가이드
- [README.md](./README.md) - 프로젝트 개요

### 🆘 지원
- GitHub Issues: 프로젝트 저장소
- 이메일: support@yourjob.kr
- 문서: 프로젝트 docs/ 디렉토리

---

**✨ 성공적인 배포를 위해 체크리스트를 단계별로 확인하세요!**