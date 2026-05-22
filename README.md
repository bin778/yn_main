# 법무법인 여온 (yn_main)

Next.js 정적 사이트(`frontend/`)와 카페24 PHP 상담 API(`backend/`)로 구성된 메인 사이트 마이그레이션 레포입니다.

- **프론트**: Next.js App Router → `output: 'export'`로 빌드 후 카페24 `public_html`에 배포
- **백엔드**: 상담 접수 API만 PHP로 유지 (`/backend/api/`)
- **레거시**: 그누보드 게시판(`/board/`)은 기존 호스팅 경로 그대로 사용

## 기술 스택

| 영역     | 스택                                                      |
| -------- | --------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Swiper |
| Backend  | PHP 7.3+, MariaDB 10.x                                    |
| Hosting  | 카페24 (Apache + `.htaccess`)                             |

## 프로젝트 구조

```
yn_main/
├── frontend/          # Next.js 앱 (개발·빌드)
│   ├── app/           # 페이지·컴포넌트
│   ├── public/        # 정적 에셋 (img, css 등)
│   └── out/           # npm run build 결과 (배포용, gitignore)
├── backend/           # 상담 API (카페24 FTP 업로드)
│   ├── config/        # DB·Aligo 설정 (*.sample.php → 운영 파일)
│   └── api/
├── .htaccess          # 카페24 루트용 Apache 리라이트·301 규칙
└── schema.sql         # user_inquiry 테이블 DDL
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

개발 서버: [http://localhost:3000](http://localhost:3000)

### 페이지

| 경로            | 설명                            |
| --------------- | ------------------------------- |
| `/`             | 메인                            |
| `/about/`       | 여온의 약속                     |
| `/people/`      | 여온의 사람들 목록              |
| `/people/[id]/` | 구성원 상세 (빌드 시 정적 생성) |
| `/field/`       | 여온이 하는 일                  |
| `/contact/`     | 오시는 길·상담 문의             |
| `/privacy/`     | 개인정보처리방침                |

`trailingSlash: true` 설정으로 운영 URL은 슬래시(`/`)로 끝납니다.

### 환경 변수

`frontend/.env.example`를 참고해 `frontend/.env.local`을 만듭니다.

| 변수                          | 설명                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_INQUIRY_API_URL` | 상담 접수 PHP API URL. 비우면 폼 제출 시 안내 스텁 메시지 표시 |

```bash
cp frontend/.env.example frontend/.env.local
```

### 빌드 (정적 export)

```bash
cd frontend
npm run build   # frontend/out/ 생성
npm run lint    # ESLint
```

`next.config.ts`에서 `output: 'export'`, `images.unoptimized: true`를 사용합니다. `npm start`는 Node 서버용이며, 운영 배포에는 `out/` 디렉터리를 사용합니다.

## Production 배포 (카페24)

### 1. 프론트엔드

1. `.env.local`에 운영 API URL을 설정한 뒤 `npm run build` 실행
2. `frontend/out/` **내용물**을 `public_html/` 루트에 FTP 업로드
3. 레포 루트의 `.htaccess`를 `public_html/.htaccess`에 반영

`.htaccess` 역할:

- 레거시 PHP URL → Next.js 경로 **301 리다이렉트** (예: `peoples.php?p=123` → `/people/123/`)
- `/api/`, `/board/` 요청은 Next 규칙에서 제외 (기존 API·게시판 유지)
- `/about` 등 경로를 `about/index.html` 등 정적 HTML로 연결

### 2. 백엔드 (상담 API)

PHP 7.3 + MariaDB 10.x. reCAPTCHA 없이 IP·도배·중복 전화 방어 후 `user_inquiry`에 저장합니다.

#### 디렉터리

```
backend/
  config/
    db_conn.sample.php
    app_config.sample.php
  api/
    submit_inquiry.sample.php
```

#### 배포 절차

1. FTP로 `backend/` 구조를 호스팅에 업로드 (예: `public_html/backend/`).
2. 샘플 파일을 운영용으로 복사·편집 (git에 커밋하지 않음):

   | 샘플                            | 운영 파일                |
   | ------------------------------- | ------------------------ |
   | `config/db_conn.sample.php`     | `config/db_conn.php`     |
   | `config/app_config.sample.php`  | `config/app_config.php`  |
   | `api/submit_inquiry.sample.php` | `api/submit_inquiry.php` |

3. `db_conn.php`에 DB 호스트·계정·DB명 입력.
4. DB에 `schema.sql`의 `user_inquiry` 테이블이 있는지 확인.
5. `app_config.php`에 Aligo 알림톡 값 입력. 키·수신자가 비어 있으면 DB 저장만 하고 알림톡은 보내지 않습니다.
6. 공개 URL 확인 (경로 예시):

   `https://yeoon.co.kr/backend/api/submit_inquiry.php`

7. 빌드 전 `frontend/.env.local`의 `NEXT_PUBLIC_INQUIRY_API_URL`에 위 URL 설정.

### API 계약

- **Method**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded`
- **필드**: `c_name`, `c_tel`, `c_content` (필수), `c_inflow` (선택, 기본 유입 라벨)
- **검증**: 성함 한글 완성형 2~10자 · 연락처 `010`+8자리 · 문의 5~500자
- **성공**: `{ "result": "1", "msg": "..." }`
- **실패**: `{ "result": "0", "msg": "..." }`
- 차단 IP·1시간 3회 도배: 사용자에게는 성공(`result: "1"`)처럼 응답, DB INSERT 없음

### CORS 허용 Origin

- `https://yeoon.co.kr`
- `https://www.yeoon.co.kr`
- `http://localhost:3000` (Next dev)
- `http://localhost:4173`

추가 도메인이 필요하면 `api/submit_inquiry.php`의 `$allowed_origins` 배열을 수정합니다.

### 보안

- Aligo·DB 비밀번호는 `app_config.php`, `db_conn.php`에만 두고 레포에 올리지 않습니다.
- 레거시/타 프로젝트에 노출된 API 키는 재발급·로테이션을 권장합니다.

## 검증

```bash
cd frontend && npm run build && npm run lint
```

로컬에서 `out/` 미리보기 (선택):

```bash
npx serve frontend/out
```

`/contact/`에서 API URL 설정 후 제출 → DB 적재 및 응답 `result: "1"` 확인.

배포 후 레거시 URL 301, `/board/` 게시판, `/backend/api/` 응답도 함께 확인합니다.
