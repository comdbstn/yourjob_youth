@echo off
echo ==========================================
echo YourJob Platform Quick Start
echo ==========================================

REM Docker가 실행중인지 확인
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker가 설치되지 않았거나 실행되지 않았습니다.
    echo Docker Desktop을 설치하고 실행한 후 다시 시도하세요.
    pause
    exit /b 1
)

echo [INFO] Docker 확인 완료!
echo.

REM 환경변수 파일 확인
if not exist .env (
    echo [INFO] .env 파일이 생성되어 있습니다.
) else (
    echo [INFO] .env 파일 확인됨.
)

echo [INFO] YourJob Platform을 시작합니다...
echo.

REM 개발용 Docker Compose 실행
docker-compose -f docker-compose.dev.yml up -d --build

if %errorlevel% neq 0 (
    echo [ERROR] Docker 실행 중 오류가 발생했습니다.
    echo 로그를 확인하세요: docker-compose -f docker-compose.dev.yml logs
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🚀 YourJob Platform이 시작되었습니다!
echo ==========================================
echo.
echo 🌐 메인 사이트: http://localhost
echo 👨‍💼 관리자 패널: http://localhost/admin
echo 📊 모니터링: http://localhost:3001
echo 🔧 백엔드 API: http://localhost:8082
echo 🔗 BFF API: http://localhost:8081
echo.
echo 📋 테스트 계정:
echo    관리자: admin@yourjob.com / admin123
echo    구직자: user@yourjob.com / user123  
echo    기업: company@yourjob.com / user123
echo.
echo ⏳ 서비스가 완전히 시작되기까지 2-3분 정도 걸릴 수 있습니다.
echo.
echo 📝 명령어:
echo    상태 확인: docker-compose -f docker-compose.dev.yml ps
echo    로그 보기: docker-compose -f docker-compose.dev.yml logs -f
echo    중지하기: docker-compose -f docker-compose.dev.yml down
echo.

REM 브라우저 자동 열기 (선택)
set /p openBrowser="브라우저를 자동으로 열까요? (y/n): "
if /i "%openBrowser%"=="y" (
    echo 브라우저를 여는 중...
    timeout /t 5 /nobreak >nul
    start http://localhost
    timeout /t 2 /nobreak >nul
    start http://localhost:3001
)

echo.
echo Press any key to continue...
pause >nul