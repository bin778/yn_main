# 법무법인 여온 (yn_main)

Next.js 사이트(`frontend/`)와 카페24 PHP API(`backend/`) 및 레거시 그누보드(`/board/`)를 함께 운영하는 메인 사이트 레포입니다.

- **프론트**: Next.js App Router (`npm run build` → `npm run start`)
- **백엔드**: PHP API 유지 (`/backend/api/` 상담, `/api/board/` 게시판 조회·관리)
- **레거시**: 그누보드 게시판(`/board/`)은 기존 호스팅 경로 그대로 사용 (adm에서 생성/수정/삭제)

## 기술 스택

| 영역     | 스택                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Swiper, TinyMCE 8 (self-hosted GPL) |
| Backend  | PHP 7.3+, MariaDB 10.x                                                                 |
| Hosting  | 카페24 (Apache + `.htaccess`)                                                          |

## 프로젝트 구조

```
yn_main/
├── frontend/          # Next.js 앱 (개발·빌드·런타임)
│   ├── app/
│   │   ├── (story)/   # 게시판 목록·상세 (review, success-story, column, news)
│   │   ├── board-content.css    # 게시판 본문 HTML 렌더링 (표·이미지·모바일 레이아웃)
│   │   ├── board-typography.css # 본문·에디터·미리보기 공통 타이포 (md 반응형)
│   │   ├── components/       # Header, Footer, PreFooterCta, Analytics 등
│   │   ├── constants/        # footerContent.ts, analyticsEvents.ts 등
│   │   ├── lib/              # trackGaEvent.ts (GA4 커스텀 이벤트)
│   │   └── admin/            # 관리자 대시보드·글쓰기/수정·예약글
│   │       ├── components/   # AdminPostForm, BoardEditor 등
│   │       ├── hooks/        # useAdminPostForm, useClickOutside 등
│   │       └── lib/          # payload·dirty·업로드 검증 등 순수 로직
│   ├── public/        # 정적 에셋 (img, css, yeoon_brochure.pdf 등)
├── backend/           # 상담·게시판 API (카페24 FTP 업로드)
│   ├── config/        # DB·Aligo·JWT 설정 (*.sample.php → 운영 파일)
│   ├── lib/           # board_files.php, board_auth.php, pbkdf2.php 등
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

로컬 개발 시 `next.config.ts`의 **rewrite**로 `/img`, `/board`, `/api`, `/backend` 요청이 카페24 운영 서버로 프록시됩니다.

### 페이지

| 경로               | 설명                               |
| ------------------ | ---------------------------------- |
| `/`                | 메인                               |
| `/about/`          | 여온의 약속                        |
| `/people/`         | 여온의 사람들 목록                 |
| `/people/[id]/`    | 구성원 상세 (빌드 시 정적 생성)    |
| `/field/`          | 여온이 하는 일                     |
| `/contact/`        | 오시는 길·상담 문의                |
| `/privacy/`        | 개인정보처리방침                   |
| `/review/`         | 후기 목록 (`bo_table=review`)      |
| `/success-story/`  | 성공사례 목록 (`bo_table=success`) |
| `/column/`         | 칼럼 목록                          |
| `/news/`           | 여온소식 목록                      |
| `/{slug}/[wr_id]/` | 게시물 상세 (ISR `revalidate: 60`) |

`trailingSlash: true` 설정으로 운영 URL은 슬래시(`/`)로 끝납니다.

### 게시판 본문 스타일 (`board-content.css`)

그누보드·Summernote 레거시 HTML을 `(story)` 상세에서 렌더링할 때 사용합니다.

| 파일                   | 역할                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `board-typography.css` | h2~h4, `data-body` 문단 크기 — 모바일 기본, `md`(768px) 이상 확대                                                                                      |
| `board-content.css`    | 목록·이미지·인용·표; 모바일 2열 카드형 `table` 행은 세로 스택 (`:has`). 이메일형 레이아웃은 `.board-content--legacy-layout`으로 border/width 강제 해제 |

에디터·미리보기(`admin/components/board-editor.css`)는 `board-typography.css`를 공유합니다.

### 푸터 직전 CTA · 패밀리 사이트 (`PreFooterCta`)

모든 페이지 푸터 직전(`/contact/` 제외)에 상담·브로슈어 CTA가 노출됩니다.

| 요소               | 설명                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| FAMILY SITE        | `FamilySiteDropdown` — **바로 문의하기** 위 드롭다운. 외부 링크는 새 탭                                                             |
| 패밀리 사이트 목록 | `frontend/app/constants/footerContent.ts`의 `FAMILY_SITES` 배열로 관리 (현재: [보통의 하루](https://www.commonday.co.kr/))          |
| 접근성             | `aria-expanded`·`aria-controls` + 시맨틱 `<ul>` (링크 목록에 `listbox`/`option` 미사용, `.cursor/rules/typescript-eslint.mdc` 참고) |

### 환경 변수

`frontend/.env.example`를 참고해 `frontend/.env.local`을 만듭니다.

| 변수                            | 설명                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_INQUIRY_API_URL`   | 상담 접수 PHP API URL. 비우면 폼 제출 시 안내 스텁 메시지 표시                 |
| `BOARD_API_URL`                 | 게시판 조회 API URL (서버사이드 전용, 기본값: `https://yeoon.co.kr/api/board`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 측정 ID (`G-`로 시작). 비우면 GA4 스크립트·이벤트 비활성화  |

```bash
cp frontend/.env.example frontend/.env.local
```

### Google Analytics 4

루트 레이아웃(`app/layout.tsx`)에 GA4를 전역 적용합니다. `/admin` 경로는 스크립트 로드·이벤트 수집 모두 제외합니다.

| 파일                                       | 역할                                       |
| ------------------------------------------ | ------------------------------------------ |
| `app/components/Analytics.tsx`             | `@next/third-parties`로 gtag 스크립트 로드 |
| `app/components/AnalyticsClickTracker.tsx` | `tel:`·카카오·브로슈어 링크 클릭 전역 위임 |
| `app/lib/trackGaEvent.ts`                  | `gtag('event', …)` 헬퍼·링크 분류          |
| `app/constants/analyticsEvents.ts`         | 이벤트명·`data-ga-source` 상수             |

#### 수집 이벤트

| 이벤트          | 트리거                                          | 주요 파라미터                                |
| --------------- | ----------------------------------------------- | -------------------------------------------- |
| `page_view`     | 공개 페이지 방문 (gtag 기본)                    | —                                            |
| `generate_lead` | `/contact/` 상담 폼 API 성공 (`result === '1'`) | `form_name`, `link_source`                   |
| `phone_click`   | `tel:` 링크 클릭                                | `link_url`, `link_text`, `link_source`       |
| `kakao_click`   | `pf.kakao.com` 링크 클릭                        | `link_url`, `link_text`, `link_source`       |
| `file_download` | `yeoon_brochure.pdf` 링크 클릭                  | `file_name`, `file_extension`, `link_source` |

`link_source`는 클릭 위치 구분용입니다.

| 값                       | 위치                                |
| ------------------------ | ----------------------------------- |
| `floating_quick_actions` | 우측 하단 플로팅 버튼 (전화·카카오) |
| `pre_footer_cta`         | 푸터 직전 CTA 브로슈어 버튼         |
| `board_content`          | 게시글 본문 HTML 내 링크            |
| `inline`                 | 그 외 페이지 내 링크                |
| `contact_form`           | 상담 폼 제출 (generate_lead)        |

게시글 본문·플로팅·CTA 등 `tel:` / 카카오 / 브로슈어 링크는 `AnalyticsClickTracker`가 document 클릭 위임으로 한 번에 처리합니다. 컴포넌트별 출처는 `data-ga-source` 속성으로 지정합니다.

#### GA4 콘솔 설정 (권장)

배포 후 [Google Analytics](https://analytics.google.com/)에서 아래 이벤트를 **키 이벤트(전환)** 으로 등록하면 리포트에서 전환으로 집계됩니다.

- `generate_lead`
- `phone_click`
- `kakao_click`
- `file_download`

동작 확인: GA4 **관리 → DebugView** 또는 **보고서 → 실시간**에서 각 버튼·폼 제출 후 이벤트가 들어오는지 확인합니다.

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
- `GET /api/board/get_view.php` : 게시물 상세 + 이전/다음 + 첨부 파일 (`wr_datetime <= NOW()` 미래 글 제외)
- `GET /api/board/get_post.php` : 관리자 수정 폼용 단건 조회 (JWT)
- `GET /api/board/download_file.php` : 첨부 다운로드 (비밀번호·JWT 검증)
- 허용 게시판: `review`, `success`, `column`, `news`
- **PHP 7.3** 호환: 화살표 함수 등 PHP 7.4+ 문법 사용 금지 (`.cursor/rules/php-7.3.mdc` 참고)
- 배포 시 `backend/api/board/*.php` 및 `backend/lib/*.php`(특히 `board_files.php`, `pbkdf2.php`)를 서버 `/api/board/`, `/lib/` 경로에 반영

#### 게시판 관리자 (JWT, 그누보드 세션 불필요)

- 로그인 UI: **`/admin/login/`** (URL 직접 입력, UI에 노출하지 않음) → JWT
- 대시보드: **`/admin/`** (로그인 후 기본 이동)
- 글쓰기: **`/admin/{bo_table}/write/`** · 수정: **`/admin/{bo_table}/{wr_id}/edit/`**
- 예약글: **`/admin/{bo_table}/scheduled/`** (`wr_datetime > NOW()` 목록·예약 취소)
- 구 **`/board/bbs/login.php`** → `/admin/login/`, **`/board/adm/`** → `/admin/` (`next.config` redirect)
- 로그아웃: JWT + `/board/bbs/logout.php` (그누보드 쿠키 정리)
- 세션 확인: `GET /api/board/auth/me.php` (BoardAdminBar는 `?bo_table=news` 등)
- 글 CRUD: `POST|PUT|DELETE /api/board/write_post.php` (게시판 관리자 JWT)
- 예약 목록: `GET /api/board/get_scheduled_list.php?bo_table=` (JWT)
- 파일 업로드: `POST /api/board/upload_file.php` (썸네일·본문 이미지·첨부, 최대 **10MB**)
- 첨부 다운로드: `GET /api/board/download_file.php` (비밀번호 설정 시 입력 후 다운로드)
- `get_session.php`는 deprecated → `auth/me.php`로 위임
- `app_config.php`에 `JWT_SECRET`(32자 이상 랜덤) 필수
- 저장·삭제 후 Next ISR 갱신: `POST /api/board/revalidate` (프론트 Route Handler)

##### 글쓰기/수정 UI (`AdminPostForm` + `BoardEditor`)

| 기능             | 설명                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 폼·미리보기 너비 | `max-w-[1200px]` (`AdminPostForm`, 수정 로딩 화면, `AdminPostPreviewModal`)                                                          |
| 본문 에디터 높이 | TinyMCE 기본 **520px** (`BOARD_EDITOR_MIN_HEIGHT`), 하단 드래그로 확대 가능 (`resize: true`). HTML 탭 textarea 최소 520px·최대 720px |
| 본문 에디터      | TinyMCE self-hosted(GPL). **기본(Visual)** + **HTML** 탭. CTA·인라인 스타일을 Visual에서 유지하며 글자만 편집                        |
| 본문 정제        | 편집·저장·미리보기 모두 `sanitizeLegacyBoardHtml` 단일 경로 (`boardContentSanitize.ts`)                                              |
| TinyMCE 배포     | `npm install` 시 `postinstall`로 `public/tinymce` 생성. Git에는 미포함 (`.gitignore`) — Vercel/CI는 install 시 자동 복사             |
| 미리보기         | 저장 전 본문·SEO 미리보기 모달                                                                                                       |
| 임시저장         | 브라우저 `localStorage`에 초안 저장·불러오기                                                                                         |
| 예약 발행        | 즉시·10/30/60분 후·직접 지정 (`wr_datetime` 미래 시각, 목록·상세 비노출)                                                             |
| 썸네일·첨부      | 클라이언트 10MB 선검증 (`boardAttachmentAccept.ts`), 실패 시 선택 UI 초기화                                                          |
| 첨부 비밀번호    | 업로드 시 비밀번호 설정·해제, PBKDF2 해시(구·신 salt 호환), 상세에서 입력 후 다운로드                                                |
| SEO              | 제목·슬러그·설명 메타 + 미리보기                                                                                                     |
| 이탈 경고        | 제목·본문·첨부 등 변경 시 취소·헤더 링크·`beforeunload` 확인                                                                         |

**레거시·CTA HTML 편집**

- 복잡한 HTML(CTA·이메일형 레이아웃)은 **HTML 탭**에서 붙여넣은 뒤 **기본 탭**으로 전환해 글자만 수정합니다.
- 수정 폼·미리보기는 legacy sanitizer를 거치지만, **상세 페이지는 DB HTML 그대로** 렌더합니다.
- 이메일형 글(`bgcolor`, `<table width=`, nested table)은 본문 HTML 기준으로 `board-content--legacy-layout` CSS가 적용됩니다 (`boardLegacyLayout.ts`).

**legacy sanitizer가 보존하는 것 (타협 범위)**

| 구분   | 보존 항목                                                                                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 살림   | `bgcolor`, `color`/`text-align`/`font-weight`, `font-family`(Georgia·Arial), `font-size`(소수 pt·large 등), nested `<table>` 구조(셀 `<p>` 래핑 없음) |
| 조건부 | `width`/`height`(상한 900/200px), `bordercolor`, `cellpadding`/`cellspacing`/`border`(≤20), `border`/`border-radius` style                            |

**포기 (의도적 제한)**: arbitrary CSS(`position`, `url()` 등), `<script>`/`<iframe>`

##### 레거시 일괄 마이그레이션 CLI

서버(또는 DB 접속 가능한 로컬)에서 실행합니다. `backend/config/db_conn.php`가 필요합니다.

```bash
# dry-run — 변경 예정만 출력 (DB 수정 없음)
php backend/scripts/migrate_board_legacy.php --bo_table=success --wr_id=93 --dry-run
php backend/scripts/migrate_board_legacy.php --bo_table=column --dry-run
php backend/scripts/migrate_board_legacy.php --bo_table=column --all --dry-run

# 실제 적용 — wr_5(JSON-LD 추출), 본문 script 제거
php backend/scripts/migrate_board_legacy.php --bo_table=success --wr_id=93
php backend/scripts/migrate_board_legacy.php --bo_table=column --all
```

| 옵션          | 설명                                               |
| ------------- | -------------------------------------------------- |
| `--bo_table=` | `review` \| `success` \| `column` \| `news` (필수) |
| `--wr_id=N`   | 단일 글만 처리                                     |
| `--all`       | 해당 게시판 전체 글 처리 (`--wr_id`와 택일)        |
| `--dry-run`   | SQL UPDATE 없이 변경 대상·내용만 stdout 출력       |

스크립트 동작: `wr_content`에서 JSON-LD `<script>` → `wr_5` 추출, 본문에서 script 태그 제거.

**주의**: 마이그레이션은 **`wr_5`·script 제거**만 수행합니다. **본문 HTML을 그누보드 원본으로 되돌리지 않습니다.** 스타일이 이미 strip된 글은 DB 백업/그누보드에서 `wr_content`를 복원한 뒤 `--dry-run`으로 변경 예정을 확인하세요.

상세·목록의 **BoardAdminBar**: 관리자 로그인 시 글쓰기·수정·삭제·예약글 목록·관리자 허브 링크 노출.

##### 관리자 프론트엔드 구조

```
frontend/app/admin/
├── components/
│   ├── AdminPostForm.tsx          # 훅 + 섹션 조립 (max-w-[1200px])
│   ├── board-editor.css           # TinyMCE·textarea 스타일 (HTML 탭 min 520px)
│   ├── board-editor/              # BoardEditor, BoardTinyMceEditor, constants (BOARD_EDITOR_MIN_HEIGHT)
│   └── admin-post-form/           # SEO, 썸네일, 첨부, 미리보기, 예약 모달, 액션 버튼
├── hooks/
│   ├── useAdminPostForm.ts        # 폼 state·즉시/예약 저장·삭제
│   ├── useAdminPostLeaveGuard.ts  # 이탈 가드
│   └── useClickOutside.ts
└── lib/
    ├── adminPostFormTypes.ts
    ├── buildBoardPostPayload.ts   # API payload 조립 (scheduled 플래그)
    ├── boardContentSanitize.ts    # 편집·저장 sanitizer 진입점
    ├── boardSanitizeLegacyAttrs.ts
    └── sanitizeLegacyBoardHtml.ts

frontend/app/lib/
└── boardLegacyLayout.ts           # 상세·미리보기 이메일형 레이아웃 감지 (본문 HTML만)
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
    bootstrap.php, board_auth.php, board_files.php, jwt.php, pbkdf2.php, ...
  api/
    board/auth/login.php, logout.php, me.php
    board/write_post.php, get_scheduled_list.php, get_post.php
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
- `/review/`, `/success-story/`, `/column/`, `/news/` 목록/상세 노출 (첨부 있는 글 500 없음)
- 게시물 상세 모바일 뷰: 레거시 2열 표 카드가 세로 스택되는지 확인 (이메일형 `legacy-layout` 글은 제외)
- 성공사례·칼럼 등 **이메일형 레이아웃** 글: 상세 히어로 `bgcolor`·관리자 미리보기·고급 HTML 수정 화면 표시 일치
- `/admin/login` → `admin` 로그인 → `/news/` 관리자 바(글쓰기·예약글·수정·삭제) 노출
- `GET /api/board/auth/me.php?bo_table=news` → `is_admin: "super"` (쿠키 포함)
- `/admin/news/write`에서 글 작성·예약 발행 → 예약글 목록·공개 시각 이후 목록/상세 반영
- 글쓰기: 임시저장·미리보기·썸네일/첨부 업로드(10MB 초과 시 안내)·이탈 경고
- `BoardEditor`: 기본(Visual)·HTML 탭. 에디터 기본 높이 520px·폼 너비 1200px. CTA HTML 붙여넣기 → 기본 탭 전환 시 스타일 유지, 글자만 수정 가능
- 푸터 직전 CTA: **FAMILY SITE** 드롭다운 → 보통의 하루(`commonday.co.kr`) 새 탭 링크
- 저장 payload·API 응답에 `content_mode` 없음 (Phase 3)
- 첨부 비밀번호 설정 글 → 상세에서 비밀번호 입력 후 다운로드 (비밀번호 없는 첨부도 정상)
- 상세·관리자 바에서 수정·삭제 동작 확인
- `/contact/` 서울 주사무소 카카오맵: 모바일·PC 모두 을지로 주소 표시
- 레거시 URL 301, `/api/board/`, `/backend/api/` 응답 확인

카페24 배포 시 업로드: `backend/lib/`(board_write.php, board_schema.php, board_files.php, pbkdf2.php), `backend/api/board/`(get_view.php, get_post.php, get_scheduled_list.php, upload_file.php, download_file.php, write_post.php), `config/app_config.php`(JWT_SECRET).

### 그 이전 주요 마일스톤

- 푸터 CTA **FAMILY SITE** 드롭다운 (`FamilySiteDropdown`, `FAMILY_SITES` 상수)
- 관리자 글쓰기 UI 확대: 폼·미리보기 **1200px**, TinyMCE·HTML 탭 기본 높이 **520px**
- JWT 기반 `/admin/` 대시보드·게시판·상담 문의 관리 (`/admin/inquiries/`)
- Next.js 게시판 목록·상세 (`(story)`), ISR, 레거시 `board.php` 301 → `/review/` 등
- 상담 API PHP 이전 (`/backend/api/submit_inquiry.php`), Contact·About·People·Field 페이지 마이그레이션
- 게시판 정렬(날짜·조회수·제목), 검색, 그리드/리스트 뷰, LCP·Hero Swiper 최적화
