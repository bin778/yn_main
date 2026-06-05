# 법무법인 여온 (yn_main)

Next.js 사이트(`frontend/`)와 카페24 PHP API(`backend/`) 및 레거시 그누보드(`/board/`)를 함께 운영하는 메인 사이트 레포입니다.

- **프론트**: Next.js App Router (`npm run build` → `npm run start`)
- **백엔드**: PHP API 유지 (`/backend/api/` 상담, `/api/board/` 게시판 조회)
- **레거시**: 그누보드 게시판(`/board/`)은 기존 호스팅 경로 그대로 사용 (adm에서 생성/수정/삭제)

## 기술 스택

| 영역     | 스택                                                                   |
| -------- | ---------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Swiper, Tiptap 3.25 |
| Backend  | PHP 7.3+, MariaDB 10.x                                                 |
| Hosting  | 카페24 (Apache + `.htaccess`)                                          |

## 프로젝트 구조

```
yn_main/
├── frontend/          # Next.js 앱 (개발·빌드·런타임)
│   ├── app/
│   │   ├── (story)/   # 게시판 목록·상세 (review, column 등)
│   │   └── admin/     # 관리자 대시보드·글쓰기/수정
│   │       ├── components/   # AdminPostForm, BoardRichEditor 등
│   │       ├── hooks/        # useAdminPostForm, useClickOutside 등
│   │       └── lib/          # payload·dirty·업로드 검증 등 순수 로직
│   ├── public/        # 정적 에셋 (img, css 등)
├── backend/           # 상담 API (카페24 FTP 업로드)
│   ├── config/        # DB·Aligo 설정 (*.sample.php → 운영 파일)
│   ├── lib/           # board_files.php, board_auth.php 등
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

| 변수                          | 설명                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_INQUIRY_API_URL` | 상담 접수 PHP API URL. 비우면 폼 제출 시 안내 스텁 메시지 표시                 |
| `BOARD_API_URL`               | 게시판 조회 API URL (서버사이드 전용, 기본값: `https://yeoon.co.kr/api/board`) |

```bash
cp frontend/.env.example frontend/.env.local
```

### 빌드/실행

```bash
cd frontend
npm run build
npm run start
npm run lint    # ESLint
```

`next.config.ts`에서는 `trailingSlash: true`를 사용하고, `/img/*`, `/fonts/*` 경로에 장기 캐시 헤더를 설정합니다.
게시판 첨부 이미지는 `https://yeoon.co.kr/board/data/**`와 `https://lawfirmonly1.mycafe24.com/board/data/**`를 허용합니다.

## Production 배포 (카페24)

### 1. 프론트엔드 (Node 런타임)

1. `.env.local`에 운영 API URL을 설정한 뒤 `npm run build` 실행
2. 서버에서 `npm run start`로 Next 프로덕션 서버 실행
3. 레포 루트의 `.htaccess`를 `public_html/.htaccess`에 반영해 레거시 라우트를 유지

`.htaccess` 역할:

- 레거시 PHP URL → Next.js 경로 **301 리다이렉트** (예: `peoples.php?p=123` → `/people/123/`)
- `/api/`, `/board/` 요청은 Next 규칙에서 제외 (기존 API·게시판 유지)
- `config/` 디렉터리 접근 차단

> 카페24 상품에서 Node 런타임(`npm run start`) 실행이 불가능한 경우, 정적 배포(export) 방식으로 전환해 운영합니다.

### 2. 백엔드 (PHP API)

PHP 7.3 + MariaDB 10.x. reCAPTCHA 없이 IP·도배·중복 전화 방어 후 `user_inquiry`에 저장합니다.

#### 게시판 조회 API

- `GET /api/board/get_list.php` : 후기/성공사례/칼럼/여온소식 목록 (`sort`: 최신순·조회수·제목 가나다순 등)
- `GET /api/board/get_view.php` : 게시물 상세 + 이전/다음 + 첨부 파일
- `GET /api/board/download_file.php` : 첨부 다운로드 (비밀번호·JWT 검증)
- 허용 게시판: `review`, `success`, `column`, `news`
- **PHP 7.3** 호환: 화살표 함수 등 PHP 7.4+ 문법 사용 금지 (`.cursor/rules/php-7.3.mdc` 참고)
- 배포 시 `backend/api/board/*.php` 및 `backend/lib/*.php`(특히 `board_files.php`)를 서버 `/api/board/`, `/lib/` 경로에 반영

#### 게시판 관리자 (JWT, 그누보드 세션 불필요)

- 로그인 UI: **`/admin/login/`** (URL 직접 입력, UI에 노출하지 않음) → JWT
- 대시보드: **`/admin/`** (로그인 후 기본 이동)
- 글쓰기: **`/admin/{bo_table}/write/`** · 수정: **`/admin/{bo_table}/{wr_id}/edit/`**
- 구 **`/board/bbs/login.php`** → `/admin/login/`, **`/board/adm/`** → `/admin/` (`next.config` redirect)
- 로그아웃: JWT + `/board/bbs/logout.php` (그누보드 쿠키 정리)
- 세션 확인: `GET /api/board/auth/me.php` (BoardAdminBar는 `?bo_table=news` 등)
- 글 CRUD: `POST|PUT|DELETE /api/board/write_post.php` (게시판 관리자 JWT)
- 파일 업로드: `POST /api/board/upload_file.php` (썸네일·본문 이미지·첨부, 최대 **10MB**)
- 첨부 다운로드: `GET /api/board/download_file.php` (비밀번호 설정 시 입력 후 다운로드)
- `get_session.php`는 deprecated → `auth/me.php`로 위임
- `app_config.php`에 `JWT_SECRET`(32자 이상 랜덤) 필수

##### 글쓰기/수정 UI (`AdminPostForm` + `BoardRichEditor`)

| 기능          | 설명                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ |
| 리치 에디터   | Tiptap 기반. 기본·마크다운·HTML 탭, 굵게/색상/문단 스타일/정렬/리스트/인용/구분선/표/링크/이미지 |
| 미리보기      | 저장 전 본문·SEO 미리보기 모달                                                                   |
| 임시저장      | 브라우저 `localStorage`에 초안 저장·불러오기                                                     |
| 썸네일·첨부   | 클라이언트 10MB 선검증 (`boardAttachmentAccept.ts`), 실패 시 선택 UI 초기화                      |
| 첨부 비밀번호 | 업로드 시 비밀번호 설정·해제, 상세 페이지에서 입력 후 다운로드                                   |
| SEO           | 제목·슬러그·설명 메타 + 미리보기                                                                 |
| 이탈 경고     | 제목·본문·첨부 등 변경 시 취소·헤더 링크·`beforeunload` 확인                                     |

##### 관리자 프론트엔드 구조 (2026-06 리팩토링)

대형 컴포넌트를 역할별로 분리했습니다. 기존 import 경로(`AdminPostForm`, `BoardRichEditor`)는 그대로 유지합니다.

```
frontend/app/admin/
├── components/
│   ├── AdminPostForm.tsx          # 훅 + 섹션 조립 (~200줄)
│   ├── BoardRichEditor.tsx        # 에디터 셸 (~100줄)
│   ├── admin-post-form/           # SEO, 썸네일, 첨부, 미리보기, 액션 버튼
│   └── board-rich-editor/         # 툴바, ColorPickerDropdown, useBoardRichEditor
├── hooks/
│   ├── useAdminPostForm.ts        # 폼 state·핸들러
│   ├── useAdminPostLeaveGuard.ts  # 이탈 가드
│   └── useClickOutside.ts         # 툴바 드롭다운 outside-click
└── lib/
    ├── adminPostFormTypes.ts      # AdminPostInitial, emptyAdminPostInitial
    ├── buildBoardPostPayload.ts   # API payload 조립
    ├── adminPostFormDirty.ts      # dirty 판별·이탈 메시지
    ├── validateAttachmentPassword.ts
    └── boardAttachmentAccept.ts   # 업로드 확장자·10MB 검증 (백엔드와 동기)
```

#### 상담 문의 관리 (JWT, 최고관리자만)

- UI: **`/admin/inquiries/`** (목록), **`/admin/inquiries/{idx}/`** (상세·상태 저장)
- `cf_admin`과 동일한 계정만 API 접근 가능 (`bo_admin` 제외)
- `GET /api/inquiry/list.php` — `page`, `per_page` (기본 20)
- `GET /api/inquiry/get.php?idx=` — 단건 상세
- `PATCH /api/inquiry/update.php` — `c_state`, `block`, `c_state2`(메모, 45자)
- 배포 시 `backend/api/inquiry/*.php`, `backend/lib/inquiry_admin.php`를 카페24 `/api/inquiry/`, `/lib/`에 업로드

#### 디렉터리

```
backend/
  config/
    db_conn.sample.php
    app_config.sample.php
  lib/
    bootstrap.php, board_auth.php, jwt.php, ...
  api/
    board/auth/login.php, logout.php, me.php
    board/write_post.php
    inquiry/list.php, get.php, update.php
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
5. `app_config.php`에 Aligo 알림톡·`JWT_SECRET` 입력. JWT 없으면 관리자 API가 동작하지 않습니다.
6. 공개 URL 확인 (경로 예시):

   `https://yeoon.co.kr/backend/api/submit_inquiry.php`

7. 빌드 전 `frontend/.env.local`의 `NEXT_PUBLIC_INQUIRY_API_URL`에 위 URL 설정.

### 상담 API 계약

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

로컬 프로덕션 실행 확인:

```bash
cd frontend && npm run start
```

검증 체크:

- `/contact/`에서 상담 제출 → DB 적재 및 응답 `result: "1"` 확인
- `/review/`, `/success-story/`, `/column/`, `/news/` 목록/상세 노출 확인 (첨부 있는 글 500 없음)
- `/admin/login` → `admin` 로그인 → `/news/` 관리자 바(글쓰기) 노출
- `GET /api/board/auth/me.php?bo_table=news` → `is_admin: "super"` (쿠키 포함)
- `/admin/news/write`에서 글 작성 → 목록/상세 반영 (ISR 최대 60초)
- 글쓰기: 임시저장·미리보기·썸네일/첨부 업로드(10MB 초과 시 안내)·이탈 경고(취소·링크)
- `BoardRichEditor`: 기본/마크다운/HTML 탭, 색상·리스트·표·이미지 삽입
- 첨부 비밀번호 설정 글 → 상세에서 비밀번호 입력 후 다운로드
- 상세 페이지에서 수정·삭제 동작 확인
- 레거시 URL 301, `/api/board/`, `/backend/api/` 응답 확인

카페24 배포 시 업로드: `backend/lib/`(board_files.php, pbkdf2.php), `backend/api/board/`(get_view.php, get_post.php, upload_file.php, download_file.php, write_post.php), `config/app_config.php`(JWT_SECRET).

## 최근 변경 (2026-06-05)

### 프론트엔드

- **관리자 글쓰기 강화**: Tiptap 리치 에디터(마크다운·HTML 탭, 표·배경색·구분선 등), 저장 전 미리보기, 임시저장
- **업로드 UX**: 썸네일·본문 이미지·첨부 10MB 클라이언트 선검증 및 실패 시 UI 초기화
- **이탈 경고**: 작성 중 취소·내부 링크·탭 닫기 시 확인 (`useAdminPostLeaveGuard`)
- **첨부 비밀번호**: 관리자 폼에서 설정·해제, 상세 `BoardAttachmentItem`에서 다운로드 전 입력
- **게시글 상세 500 수정**: `BoardAttachmentItem`의 `formatFileSize`를 컴포넌트 내부로 이동 (Server→Client 함수 props 제거)
- **코드 구조**: `AdminPostForm`·`BoardRichEditor`를 lib/hooks/섹션 컴포넌트로 분리 (동작·import 경로 유지)
- **의존성**: `@tiptap/*` 패키지 `^3.25.0`으로 버전 통일 (Vercel peer dependency 충돌 방지)

### 백엔드 (카페24 FTP 반영 필요)

- **PHP 7.3 호환**: `get_view.php`, `get_post.php` 등 화살표 함수 → 익명 함수
- **`board_files.php`**: 첨부·이미지 업로드/저장, 10MB 제한, 첨부 비밀번호 PBKDF2 해시
- **`download_file.php`**: 첨부 다운로드 API 신설
- **`write_post.php` / `upload_file.php`**: 첨부 비밀번호 설정·해제 연동
