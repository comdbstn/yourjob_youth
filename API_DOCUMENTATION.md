# 유어잡 API 문서

## 개요
유어잡 플랫폼의 인증 시스템 및 주요 API 엔드포인트 가이드

## 기본 설정

### API Base URL
```
개발환경: http://localhost:8080
프로덕션: https://simple-backend-77yddgdmr-comdbstns-projects.vercel.app
```

### 환경변수 설정
```bash
# Frontend (.env)
REACT_APP_API_BASE_URL=https://simple-backend-77yddgdmr-comdbstns-projects.vercel.app

# Backend (application.properties)
server.port=8080
spring.profiles.active=prod
```

## 인증 API

### 1. 회원가입
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "userType": "JOBSEEKER" // 또는 "COMPANY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "홍길동",
    "userType": "JOBSEEKER",
    "profileImage": null
  },
  "token": "jwt-token-string"
}
```

**사용 예시:**
```javascript
const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
  email: 'user@example.com',
  password: 'password123',
  name: '홍길동',
  phone: '010-1234-5678',
  userType: 'JOBSEEKER'
});
```

### 2. 로그인
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "로그인이 완료되었습니다.",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "홍길동",
    "userType": "JOBSEEKER",
    "profileImage": null
  },
  "token": "jwt-token-string"
}
```

**사용 예시:**
```javascript
const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
  email: 'user@example.com',
  password: 'password123'
});

// 토큰 저장
localStorage.setItem('auth_token', response.data.token);
localStorage.setItem('user_info', JSON.stringify(response.data.user));
```

### 3. 사용자 정보 조회
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "홍길동",
    "userType": "JOBSEEKER",
    "profileImage": null
  },
  "token": "jwt-token-string"
}
```

**사용 예시:**
```javascript
const token = localStorage.getItem('auth_token');
const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 4. 로그아웃
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "로그아웃이 완료되었습니다."
}
```

### 5. 프로필 업데이트
**PUT** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "location": "서울",
  "skills": ["JavaScript", "React"],
  "experience": "1-3년"
}
```

### 6. 이메일 중복 확인
**GET** `/api/auth/check-email?email={email}`

**Response:**
```json
{
  "exists": false
}
```

## 채용공고 API

### 1. 채용공고 목록 조회
**GET** `/api/jobs`

**Query Parameters:**
- `limit`: 조회할 개수 (기본값: 20)
- `page`: 페이지 번호 (기본값: 1)
- `category`: 카테고리 필터
- `location`: 지역 필터
- `experience`: 경력 필터
- `employment_type`: 고용형태 필터
- `keyword`: 검색 키워드
- `sort`: 정렬 기준 (latest, salary_high, salary_low)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "백엔드 개발자",
      "company": "테크컴퍼니",
      "location": "서울",
      "category": "IT·개발",
      "description": "백엔드 개발자를 모집합니다.",
      "salary": "3000-4000만원",
      "experience": "경력 3-5년",
      "employment_type": "정규직",
      "deadline": "2024-12-31",
      "image_url": "https://example.com/logo.png",
      "apply_url": "https://example.com/apply",
      "skills": ["Java", "Spring", "MySQL"],
      "benefits": ["4대보험", "퇴직금", "연차"],
      "posting_date": "2024-01-01"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 50,
    "totalItems": 1000
  }
}
```

### 2. 채용공고 상세 조회
**GET** `/api/jobs/{id}`

## 커뮤니티 API

### 1. 게시글 목록 조회
**GET** `/api/community/posts`

### 2. 게시글 작성
**POST** `/api/community/posts`

**Headers:**
```
Authorization: Bearer {token}
```

## 크롤링 API

### 1. 수동 크롤링 실행
**POST** `/api/crawler/manual`

**Headers:**
```
Authorization: Bearer {token}
```

### 2. 크롤링 상태 조회
**GET** `/api/crawler/status`

## 에러 응답

### 일반적인 에러 형식
```json
{
  "success": false,
  "message": "오류 메시지",
  "error": "ERROR_CODE"
}
```

### 주요 HTTP 상태 코드
- `200`: 성공
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

## 인증 토큰 관리

### 토큰 저장
```javascript
// 로그인 성공 시
localStorage.setItem('auth_token', token);
localStorage.setItem('user_info', JSON.stringify(userInfo));
```

### 토큰 사용
```javascript
// API 호출 시
const token = localStorage.getItem('auth_token');
const config = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
};
```

### 토큰 만료 처리
```javascript
// 401 응답 시 자동 로그아웃
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
  window.location.href = '/';
}
```

## 사용자 타입별 기능

### JOBSEEKER (구직자)
- 채용공고 조회/검색
- 프로필 관리 (스킬, 경력 등)
- 지원 내역 관리
- 커뮤니티 참여

### COMPANY (기업)
- 채용공고 등록/관리
- 기업 정보 관리 (회사 규모, 업종 등)
- 지원자 관리
- 커뮤니티 참여

## 테스트 계정

### 구직자 테스트 계정
```
이메일: test@yourjob.com
비밀번호: password123
```

### 기업 테스트 계정
```
이메일: company@yourjob.com
비밀번호: company123
```

## 개발 가이드

### Frontend 연동 예시
```javascript
// AuthModal.tsx에서 사용하는 API 호출
const handleLogin = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_info', JSON.stringify(response.data.user));
      // 로그인 성공 처리
    }
  } catch (error) {
    // 에러 처리
  }
};
```

### Backend 설정
```kotlin
// CORS 설정
@CrossOrigin(origins = ["*"])
class AuthController {
  // API 구현
}

// 토큰 생성
private fun generateToken(): String {
    return UUID.randomUUID().toString() + "-" + System.currentTimeMillis()
}
```

## 보안 고려사항

1. **패스워드 암호화**: BCrypt 사용
2. **토큰 관리**: UUID + 타임스탬프 기반
3. **CORS 설정**: 모든 origin 허용 (프로덕션에서는 제한 필요)
4. **입력 검증**: 이메일 형식, 패스워드 길이 등
5. **에러 메시지**: 보안을 고려한 일반적인 메시지 제공

## 배포 정보

### Vercel 배포
- Frontend: https://yourjob-frontend-mm6hbqdwv-comdbstns-projects.vercel.app
- Backend: https://simple-backend-77yddgdmr-comdbstns-projects.vercel.app

### 자동 배포
- GitHub push 시 자동 배포
- 환경변수는 Vercel 대시보드에서 관리