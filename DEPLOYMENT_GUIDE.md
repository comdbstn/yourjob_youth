# YourJob 플랫폼 온라인 배포 가이드

## 🎯 목표
로컬 개발 환경에서 벗어나 실제 인터넷에서 접근 가능한 YourJob 플랫폼 배포

## 🏗 추천 배포 방법: AWS EC2 + Docker

### 사전 준비
1. **AWS 계정** (12개월 무료 사용 가능)
2. **도메인 이름** (선택사항, 연간 10-15달러)
3. **SSH 클라이언트** (Windows: PuTTY, Mac/Linux: 터미널)

---

## 📍 Step 1: AWS EC2 인스턴스 생성

### 1-1. EC2 인스턴스 설정
```
인스턴스 타입: t3.medium (2 vCPU, 4GB RAM)
OS: Ubuntu Server 22.04 LTS
스토리지: 20GB gp3
키페어: 새로 생성 (yourjob-key.pem)
```

### 1-2. 보안 그룹 설정
```
인바운드 규칙:
- SSH (22): 내 IP
- HTTP (80): 모든 곳 (0.0.0.0/0)
- HTTPS (443): 모든 곳 (0.0.0.0/0)
- Custom TCP (8082): 모든 곳 (백엔드 API)
- Custom TCP (3001): 내 IP (Grafana)
```

---

## 📍 Step 2: 서버 초기 설정

### 2-1. EC2 접속
```bash
# Windows (Git Bash 또는 WSL)
ssh -i yourjob-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Mac/Linux
chmod 400 yourjob-key.pem
ssh -i yourjob-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2-2. 기본 패키지 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
sudo apt install -y docker.io docker-compose-v2 git curl nginx

# Docker 권한 설정
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# 재로그인 (Docker 권한 적용)
exit
# 다시 SSH 접속
```

---

## 📍 Step 3: 프로젝트 배포

### 3-1. 프로젝트 클론
```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/YOUR_USERNAME/yourjob_repo.git
cd yourjob_repo

# 환경변수 파일 설정
cp .env.example .env
```

### 3-2. 환경변수 설정 (.env 파일)
```bash
nano .env

# 다음 값들을 수정:
DB_HOST=db
DB_NAME=yourjobdb
DB_USER=urjob
DB_PASSWORD=강력한비밀번호생성

REDIS_PASSWORD=강력한Redis비밀번호

JWT_SECRET=최소32자이상의강력한시크릿키생성해주세요

# 프론트엔드 API URL (EC2 IP로 변경)
REACT_APP_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:8082
REACT_APP_BFF_BASE_URL=http://YOUR_EC2_PUBLIC_IP:8081

# AWS S3 설정 (선택사항)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=yourjob-files

# 이메일 설정 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 3-3. 배포 실행
```bash
# 실행 권한 부여
chmod +x deploy.sh

# 프로덕션 배포
./deploy.sh deploy production

# 배포 상태 확인 (2-3분 소요)
docker compose ps
./deploy.sh health
```

---

## 📍 Step 4: 도메인 및 SSL 설정 (선택사항)

### 4-1. 도메인 연결
```bash
# DNS A 레코드 설정
# yourjob.com → YOUR_EC2_PUBLIC_IP
# www.yourjob.com → YOUR_EC2_PUBLIC_IP
```

### 4-2. SSL 인증서 설정
```bash
# Let's Encrypt 인증서 설치
sudo apt install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourjob.com -d www.yourjob.com

# 자동 갱신 설정
sudo systemctl enable certbot.timer
```

### 4-3. Nginx 프록시 설정
```bash
sudo nano /etc/nginx/sites-available/yourjob

# 다음 내용 추가:
server {
    listen 80;
    server_name yourjob.com www.yourjob.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8082/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 설정 활성화
sudo ln -s /etc/nginx/sites-available/yourjob /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📍 Step 5: 접속 및 테스트

### 5-1. 서비스 접속 URL
```
메인 사이트: http://YOUR_EC2_PUBLIC_IP (또는 https://yourjob.com)
백엔드 API: http://YOUR_EC2_PUBLIC_IP:8082
API 문서: http://YOUR_EC2_PUBLIC_IP:8082/swagger-ui.html
관리자: http://YOUR_EC2_PUBLIC_IP/admin
모니터링: http://YOUR_EC2_PUBLIC_IP:3001
```

### 5-2. 기본 테스트 계정
```
관리자: admin@yourjob.com / admin123
구직자: user@yourjob.com / user123  
기업: company@yourjob.com / user123
```

---

## 📍 Step 6: 모니터링 및 유지보수

### 6-1. 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f backend
docker compose logs -f frontend

# 리소스 사용량 확인
docker stats
```

### 6-2. 자동 백업 설정
```bash
# 데이터베이스 백업 스크립트
sudo crontab -e

# 매일 새벽 3시 백업
0 3 * * * docker exec yourjob-mysql mysqldump -u root -p'password' yourjobdb > /backup/yourjob_$(date +\%Y\%m\%d).sql
```

### 6-3. 시스템 업데이트
```bash
# 코드 업데이트 시
cd yourjob_repo
git pull
./deploy.sh deploy production
```

---

## 💰 비용 예상

### AWS EC2 t3.medium 기준
- **인스턴스**: $24/월 (12개월 무료 사용 가능)
- **트래픽**: $5-10/월 (사용량에 따라)
- **스토리지**: $2-5/월
- **도메인**: $10-15/년 (선택사항)

**총 예상 비용: 월 $30-40 (첫 해 무료 적용 시 $15-20)**

---

## ⚠️ 중요 보안 설정

### 필수 보안 조치
```bash
# 1. 방화벽 설정
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 2. 시스템 자동 업데이트
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades

# 3. SSH 키 기반 인증만 허용
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
sudo systemctl restart ssh

# 4. 정기적인 백업 및 모니터링
# Grafana 대시보드에서 시스템 상태 모니터링
```

---

## 🚨 문제해결

### 자주 발생하는 문제들

1. **메모리 부족**
   ```bash
   # 스왑 파일 생성
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. **Docker 컨테이너 실행 실패**
   ```bash
   # 로그 확인
   docker compose logs
   
   # 강제 재시작
   docker compose down
   docker compose up -d --build
   ```

3. **데이터베이스 연결 오류**
   ```bash
   # 데이터베이스 상태 확인
   docker compose exec db mysql -u root -p
   
   # 데이터베이스 재시작
   docker compose restart db
   ```

---

## 📞 지원 및 문의

배포 중 문제가 발생하면:
1. 로그 파일 확인: `docker compose logs`
2. 시스템 리소스 확인: `top`, `df -h`
3. 네트워크 연결 확인: `curl http://localhost:8082/actuator/health`

배포 성공 시 실제 인터넷에서 `http://YOUR_EC2_IP`로 접속하여 YourJob 플랫폼을 사용할 수 있습니다!
