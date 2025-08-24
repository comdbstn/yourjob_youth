# 🚀 YourJob Platform - macOS 빠른 시작 가이드

macOS에서 5분 안에 YourJob Platform을 실행하는 방법입니다.

## ⚡ 빠른 시작 (5분)

### 1단계: 필수 요구사항 확인
```bash
# Docker Desktop이 실행 중인지 확인
docker --version

# Node.js 버전 확인 (18+ 필요)
node --version

# Java 버전 확인 (17+ 필요)
java --version
```

### 2단계: 프로젝트 설정
```bash
# 프로젝트 디렉토리로 이동
cd yourjob_youth

# 실행 권한 부여
chmod +x dev.sh deploy.macos.sh

# macOS 개발용 환경 변수 설정
cp .env.macos .env
cd frontend && cp .env.macos .env && cd ..
```

### 3단계: 개발 환경 실행
```bash
# 데이터베이스 및 Redis 시작
./dev.sh start

# 잠시 기다린 후 (30초)
./dev.sh db:setup
```

### 4단계: 애플리케이션 실행
새 터미널 창들을 열어서 각각 실행:

```bash
# 터미널 1: 백엔드
./dev.sh backend run

# 터미널 2: BFF 
./dev.sh bff run

# 터미널 3: 프론트엔드 (처음 실행시)
./dev.sh frontend install
./dev.sh frontend run
```

### 5단계: 접속 확인
- **메인 사이트**: http://localhost:3000
- **API 문서**: http://localhost:8082/swagger-ui.html
- **관리자**: http://localhost:3000/admin

## 🐳 Docker로 한번에 실행 (대안)

```bash
# 전체 스택을 Docker로 실행
./deploy.macos.sh deploy development

# 상태 확인
./deploy.macos.sh health
```

## 🔧 문제 해결

### Docker Desktop이 없는 경우:
```bash
brew install --cask docker
```

### 포트 충돌 시:
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :8082

# 프로세스 종료
kill -9 <PID>
```

### 권한 문제 시:
```bash
chmod +x gradlew
chmod +x dev.sh deploy.macos.sh
```

## 📞 도움말

더 자세한 내용은 [MACOS_DEPLOYMENT_GUIDE.md](./MACOS_DEPLOYMENT_GUIDE.md)를 참조하세요.

---

**성공!** 🎉 이제 YourJob Platform이 macOS에서 실행됩니다!