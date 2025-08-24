# 유어잡 프로젝트 - 필요한 외부 API 키 목록

## 🔐 제공해야 할 API 키들

### 1. 카카오 로그인 API ⭐ (필수)
카카오 개발자 센터에서 발급받아야 하는 키들:

```bash
# 카카오 JavaScript 키
REACT_APP_KAKAO_JS_KEY=your_kakao_js_key_here

# 카카오 REST API 키  
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here

# 카카오 Client Secret (선택사항, 보안강화시 사용)
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
```

**발급 방법:**
1. https://developers.kakao.com/ 접속
2. 애플리케이션 생성
3. 플랫폼 설정 → Web 플랫폼 추가 → 도메인 등록
4. 제품 설정 → 카카오 로그인 활성화
5. 동의항목 설정 (닉네임, 이메일 등)

**필요한 리다이렉트 URI:**
```
개발: http://localhost:3000/oauth/kakao/callback
운영: https://yourjob-frontend-mm6hbqdwv-comdbstns-projects.vercel.app/oauth/kakao/callback
```

### 2. 이메일 발송 서비스 (선택사항)
비밀번호 찾기, 회원가입 인증 등을 위한 이메일 서비스:

#### Option A: SendGrid
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourjob.com
```

#### Option B: Gmail SMTP
```bash
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### 3. 파일 저장소 (프로필 이미지용, 선택사항)
사용자 프로필 이미지 업로드를 위한 클라우드 스토리지:

#### Option A: AWS S3
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=yourjob-profile-images
AWS_REGION=ap-northeast-2
```

#### Option B: Cloudinary (추천 - 이미지 처리 포함)
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. 외부 채용정보 API (고급 기능, 선택사항)
더 많은 채용 정보를 가져오기 위한 공식 API:

#### 워크넷 API (한국고용정보원)
```bash
WORKNET_API_KEY=your_worknet_api_key
```
- 발급처: https://www.work.go.kr/
- 무료, 한국 정부 제공 채용정보

#### 사람인 API (파트너십 필요)
```bash
SARAMIN_API_KEY=your_saramin_api_key
```

### 5. 알림 서비스 (선택사항)

#### 푸시 알림 - Firebase
```bash
FIREBASE_SERVER_KEY=your_firebase_server_key
FIREBASE_PROJECT_ID=your_project_id
```

#### SMS 알림 - 네이버 클라우드 플랫폼
```bash
NCP_ACCESS_KEY=your_ncp_access_key
NCP_SECRET_KEY=your_ncp_secret_key
NCP_SMS_SERVICE_ID=your_sms_service_id
```

## 📋 우선순위별 정리

### 🔴 필수 (즉시 필요)
1. **카카오 로그인 API** - 소셜 로그인 기능

### 🟡 권장 (기능 향상)
1. **Cloudinary** - 프로필 이미지 업로드
2. **SendGrid/Gmail** - 이메일 인증

### 🟢 선택사항 (추후 확장)
1. **워크넷 API** - 추가 채용정보
2. **Firebase** - 푸시 알림
3. **SMS 서비스** - 문자 인증

## 🛠️ 환경변수 설정 파일

### Frontend (.env)
```bash
# 카카오 로그인
REACT_APP_KAKAO_JS_KEY=your_kakao_js_key_here

# API 기본 URL
REACT_APP_API_BASE_URL=https://simple-backend-77yddgdmr-comdbstns-projects.vercel.app

# Cloudinary (이미지 업로드)
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Backend (application.properties 또는 환경변수)
```properties
# 카카오 로그인
kakao.rest-api-key=your_kakao_rest_api_key_here
kakao.client-secret=your_kakao_client_secret_here
kakao.redirect-uri=https://yourjob-frontend-mm6hbqdwv-comdbstns-projects.vercel.app/oauth/kakao/callback

# 이메일 서비스
sendgrid.api-key=your_sendgrid_api_key_here
sendgrid.from-email=noreply@yourjob.com

# 파일 업로드
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# 외부 채용정보 API
worknet.api-key=your_worknet_api_key
```

## 💳 예상 비용

### 무료 티어로 시작 가능한 서비스
- **카카오 로그인**: 무료 (월 100만 요청까지)
- **Cloudinary**: 무료 (월 25GB 저장공간, 25GB 대역폭)
- **SendGrid**: 무료 (일 100통까지)
- **워크넷 API**: 완전 무료

### 유료 서비스 (필요시)
- **AWS S3**: 월 $1-5 정도 (소규모 사용시)
- **Firebase**: 월 무료~$25
- **SMS 서비스**: 건당 15-20원

## 🚀 구현 우선순위 추천

1. **1단계**: 카카오 로그인만 먼저 구현
2. **2단계**: 프로필 이미지 업로드 (Cloudinary)
3. **3단계**: 이메일 인증 (SendGrid)
4. **4단계**: 추가 기능들

## 📞 지원

API 키 발급이나 설정에 문제가 있으면:
1. 카카오 로그인: https://devtalk.kakao.com/
2. Cloudinary: https://support.cloudinary.com/
3. SendGrid: https://support.sendgrid.com/

---
**우선 카카오 로그인 API 키만 발급받으셔서 제공해주시면, 소셜 로그인 기능부터 구현하겠습니다!**