# 법무법인 여온 (yn_main)

Next.js 사이트(`frontend/`)와 카페24 PHP API(`backend/`), 레거시 그누보드(`/board/`)를 함께 운영하는 메인 사이트 레포입니다.

| 영역     | 설명                                                                   |
| -------- | ---------------------------------------------------------------------- |
| Frontend | Next.js App Router — `npm run build` → `npm run start`                 |
| Backend  | PHP API — 상담 접수, 게시판 조회·관리 (`/api/board/`, `/api/inquiry/`) |
| Legacy   | 그누보드 게시판 (`/board/`) — 기존 호스팅 경로 유지                    |

**운영 도메인**: [https://yeoon.co.kr](https://yeoon.co.kr)

## 목차

- [빠른 시작](#빠른-시작)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [로컬 개발](#로컬-개발)
- [페이지](#페이지)
- [환경 변수](#환경-변수)
- [SEO](#seo)
- [Google Analytics 4 · Google Tag Manager](#google-analytics-4--google-tag-manager)
- [성능 최적화](#성능-최적화)
- [관리자](#관리자)
- [백엔드 API](#백엔드-api)
- [배포](#배포)
- [보안](#보안)
- [검증](#검증)

## 빠른 시작

```bash
cd frontend
npm install
cp .env.example .env.local   # 필요 시 값 수정
npm run dev
```

개발 서버: [http://localhost:3000](http://localhost:3000)

```bash
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint
```

## 기술 스택

| 영역     | 스택                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Swiper, TinyMCE 8 (self-hosted GPL) |
| Backend  | PHP 7.3+, MariaDB 10.x                                                                 |
| Hosting  | 카페24 (Apache + `.htaccess`), Vercel (스테이징)                                       |

> PHP 7.3 호환 필수 — 화살표 함수 등 7.4+ 문법 금지. [`.cursor/rules/php-7.3.mdc`](.cursor/rules/php-7.3.mdc) 참고.

## 프로젝트 구조

```
yn_main/
├── frontend/              # Next.js 앱
│   ├── app/
│   │   ├── (story)/       # 게시판 목록·상세 (review, success-story, column, news)
│   │   │                  # 성공사례·칼럼: practiceAreaCategories 소분류 (형사·민사·가사·부동산)
│   │   ├── admin/         # 관리자 대시보드·글쓰기/수정·예약글·상담 문의
│   │   ├── components/    # Header, Footer, Analytics 등
│   │   ├── constants/     # 페이지·푸터·GA 이벤트 상수
│   │   └── lib/           # sitemap, analytics, fonts
│   ├── public/            # 정적 에셋 (img, yeoon_brochure.pdf 등)
│   └── scripts/           # copy-tinymce.mjs, subset-pretendard.mjs
├── backend/               # PHP API (카페24 FTP 업로드)
│   ├── config/            # DB·Aligo·JWT (*.sample.php → 운영 파일)
│   ├── lib/               # board_auth, board_files, jwt, pbkdf2 등
│   ├── api/               # board/, inquiry/, submit_inquiry
│   └── scripts/           # migrate_board_legacy.php
├── .htaccess              # 카페24 루트 Apache 리라이트·301 규칙
└── schema.sql             # user_inquiry 테이블 DDL
```

## 로컬 개발

`next.config.ts`의 **rewrite**로 `/img`, `/board`, `/api`, `/backend` 요청이 카페24 운영 서버(`lawfirmonly1.mycafe24.com`)로 프록시됩니다. Next 내부 라우트(`/api/board/revalidate` 등)는 프록시 대상에서 제외됩니다.

주요 설정:

- `trailingSlash: true` — 운영 URL은 슬래시(`/`)로 끝남
- `/img/*`, `/fonts/*` — 장기 캐시 헤더
- 게시판 첨부 이미지 도메인: `yeoon.co.kr`, `lawfirmonly1.mycafe24.com`

## 페이지

| 경로                        | 설명                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `/`                         | 메인                                                                                   |
| `/about/`                   | 여온의 약속                                                                            |
| `/people/`, `/people/[id]/` | 구성원 목록·상세 (빌드 시 정적 생성)                                                   |
| `/field/`                   | 여온이 하는 일                                                                         |
| `/contact/`                 | 오시는 길·상담 문의                                                                    |
| `/privacy/`                 | 개인정보처리방침                                                                       |
| `/review/`                  | 후기 (`bo_table=review`)                                                               |
| `/success-story/`           | 성공사례 전체 (`bo_table=success`, 미분류·분류 글 모두)                                |
| `/success-story/{area}/`    | 성공사례 소분류 목록. `{area}`: `criminal` \| `civil` \| `family` \| `real-estate`     |
| `/column/`                  | 칼럼 전체 (`bo_table=column`)                                                          |
| `/column/{area}/`           | 칼럼 소분류 목록 (slug는 성공사례와 동일)                                              |
| `/news/`                    | 여온소식                                                                               |
| `/{slug}/[postKey]/`        | 게시물 상세 (ISR `revalidate: 60`). `postKey`는 SEO Slug(`wr_2`) 또는 글 번호(`wr_id`) |

### 성공사례·칼럼 소분류

성공사례(`success`)와 칼럼(`column`)은 **형사·민사·가사·부동산** 4개 소분류를 지원합니다.

| 경로 예시                                        | 표시 대상                                      |
| ------------------------------------------------ | ---------------------------------------------- |
| `/success-story/`, `/column/`                    | **전체** — `wr_7`이 비어 있거나 분류된 글 모두 |
| `/success-story/criminal/`, `/column/family/` 등 | **해당 분류만** — DB `wr_7` 값이 일치하는 글   |

- 소분류 slug: `criminal`(형사), `civil`(민사), `family`(가사), `real-estate`(부동산)
- 분류 저장 필드: `g5_write_success` / `g5_write_column`의 **`wr_7`**
- 상세 URL은 변경 없음 — `/success-story/{slug}/`, `/column/{slug}/` 유지
- 라우팅: `[bo_table]/[wr_id]`에서 소분류 slug와 게시물 slug를 분기 (`practiceAreaCategories.ts`)
- 프론트: `PracticeAreaSubTabs`, `PracticeAreaCategoryListPage`

**게시판 커스텀 필드 (`wr_*`)**

| 필드   | 용도                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| `wr_1` | 썸네일 URL                                                                               |
| `wr_2` | SEO slug                                                                                 |
| `wr_3` | SEO title                                                                                |
| `wr_4` | SEO description                                                                          |
| `wr_5` | JSON-LD schema                                                                           |
| `wr_6` | 본문 형식 마커 (`legacy_html`)                                                           |
| `wr_7` | 성공사례·칼럼 소분류 (`criminal` \| `civil` \| `family` \| `real-estate`, 비우면 미분류) |

## 환경 변수

`frontend/.env.example`을 복사해 `frontend/.env.local`을 만듭니다.

| 변수                            | 설명                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_INQUIRY_API_URL`   | 상담 API. Vercel·로컬: `/api/submit_inquiry.php` (same-origin). 카페24 단독: `https://yeoon.co.kr/api/submit_inquiry.php` |
| `BOARD_API_URL`                 | 게시판 API (서버사이드 전용, 기본: `https://yeoon.co.kr/api/board`)                                                       |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 측정 ID (`G-`로 시작). 비우면 직접 gtag GA4 비활성화                                                                  |
| `NEXT_PUBLIC_GTM_ID`            | GTM 컨테이너 ID (`GTM-`로 시작). 비우면 GTM 비활성화. 동의 후 로드, 이벤트는 `dataLayer`로 전달                           |

## SEO

`app/robots.ts`, `app/sitemap.ts`가 배포 시 `/robots.txt`, `/sitemap.xml`을 생성합니다. 기준 도메인은 `app/lib/sitemapEntries.ts`의 `SITE_ORIGIN` (`https://yeoon.co.kr`).

**robots.txt** — 공개 페이지 `Allow: /`, `/admin/` `Disallow`. Googlebot·Bingbot·Yeti(네이버)·OAI-SearchBot·GPTBot 등 주요 봇별 규칙 포함. `/admin/` disallow는 JWT·API 권한의 보완 위생 조치이며, `/admin/*`에는 `X-Robots-Tag: noindex`·메타 noindex도 적용됩니다.

**sitemap.xml** — 정적 페이지, `/people/[id]/`, 게시판 목록·글 URL 포함. ISR `revalidate: 3600` (1시간). `/admin/`·비공개 예약글 제외.

**사이트 소유 확인** — 네이버: `app/layout.tsx` `metadata.verification`. 페이지별 canonical·게시글 SEO 메타는 각 `page.tsx`·`generateMetadata`, 관리자 `AdminPostForm` SEO 필드.

## Google Analytics 4 · Google Tag Manager

공개 페이지에만 적용. `/admin`은 스크립트·이벤트 제외.

**접속 즉시** GA4(gtag)·GTM을 로드합니다. 별도 동의 배너·Consent Mode 거부 기본값은 사용하지 않습니다. 광고·리마케팅용 신호는 GA4 설정에서 비활성화합니다 (`gtagConsent.ts`의 `GTAG_CONFIG_OPTIONS`).

| 이벤트              | 트리거                         | 주요 파라미터                                                        |
| ------------------- | ------------------------------ | -------------------------------------------------------------------- |
| `page_view`         | 공개 페이지 방문               | `page_path` (GTM dataLayer)                                          |
| `home_lead_success` | `/contact/` 상담 폼 API 성공   | `form_name`, `link_source`, `inflow_url` (`contact` \| `contact-ad`) |
| `home_phone_click`  | `tel:` 링크 클릭               | `link_source` 등                                                     |
| `home_kakao_click`  | `pf.kakao.com` 링크 클릭       | `link_source` 등                                                     |
| `file_download`     | `yeoon_brochure.pdf` 링크 클릭 | `link_source` 등                                                     |

`trackGaEvent`는 **dataLayer push(GTM)** 와 **gtag event(직접 GA4)** 를 함께 보냅니다.

**GTM 콘솔** — 맞춤 이벤트 트리거 이름 = 위 이벤트명. `home_lead_success`에서 `inflow_url`로 Ads 전환 등을 분기. 직접 gtag GA4(`NEXT_PUBLIC_GA_MEASUREMENT_ID`)를 쓰는 동안 GTM에 **동일 GA4 이벤트 태그를 중복 추가하지 마세요**(중복 집계).

**GA4 콘솔 권장** — `home_lead_success`, `home_phone_click`, `home_kakao_click`, `file_download`를 키 이벤트로 등록. `inflow_url` 맞춤 측정기준 등록. Google 신호·데이터 공유는 최소화.

주요 파일: `AnalyticsProvider`, `GoogleAnalyticsLoader`, `GoogleTagManagerLoader`, `lib/analyticsConfig.ts`, `lib/trackGaEvent.ts`.

## 성능 최적화

| 항목                 | 설명                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| Pretendard 서브셋    | `PretendardSubset.woff2` (~145KB). `npm run fonts:subset`으로 재생성             |
| 홈 LCP               | `HeroSwiperFallback` — `<picture>` + `fetchPriority="high"`, Swiper `ssr: false` |
| 히어로 art direction | `/about/`, `/field/` — `ResponsiveHeroBackground`                                |
| Below-the-fold       | `loading="lazy"` / `fetchPriority="low"`                                         |
| Header 로고          | LCP 경쟁 방지를 위해 `fetchPriority="low"`                                       |

## 관리자

JWT 기반. 그누보드 세션 불필요. `app_config.php`에 `JWT_SECRET`(32자 이상) 필수.

| 경로                              | 설명                              |
| --------------------------------- | --------------------------------- |
| `/admin/login/`                   | 로그인 (URL 직접 입력, UI 미노출) |
| `/admin/`                         | 대시보드                          |
| `/admin/{bo_table}/write/`        | 글쓰기                            |
| `/admin/{bo_table}/{wr_id}/edit/` | 수정                              |
| `/admin/{bo_table}/scheduled/`    | 예약글 목록·취소                  |
| `/admin/inquiries/`               | 상담 문의 (최고관리자만)          |

**글쓰기 UI** (`AdminPostForm` + `BoardEditor`)

- TinyMCE self-hosted (GPL), Visual + HTML 탭. `npm install` 시 `postinstall`로 `public/tinymce` 생성 (Git 미포함)
- 본문 정제: `sanitizeLegacyBoardHtml` 단일 경로
- 예약 발행, 임시저장(localStorage), SEO 미리보기, 썸네일·첨부(최대 10MB), 첨부 비밀번호(PBKDF2)
- 저장·삭제 후 ISR 갱신: `POST /api/board/revalidate`

**레거시 HTML** — CTA·이메일형 레이아웃은 HTML 탭에서 붙여넣은 뒤 Visual 탭으로 전환해 글자만 수정. 상세 페이지는 DB HTML 그대로 렌더. 이메일형 글은 `board-content--legacy-layout` CSS 적용.

**레거시 마이그레이션 CLI** (`backend/scripts/migrate_board_legacy.php`)

```bash
# dry-run
php backend/scripts/migrate_board_legacy.php --bo_table=column --all --dry-run

# 적용 — wr_5(JSON-LD) 추출, 본문 script 제거
php backend/scripts/migrate_board_legacy.php --bo_table=column --all
```

`--bo_table=` (`review` \| `success` \| `column` \| `news`) 필수. `--wr_id=N` 또는 `--all` 택일. 본문 HTML 복원은 포함하지 않음 — 필요 시 DB 백업에서 `wr_content` 복원 후 `--dry-run` 확인.

**게시판 본문 스타일** — `board-typography.css`(공통 타이포), `board-content.css`(목록·표·이미지·모바일 2열 카드 세로 스택). 에디터는 `admin/components/board-editor.css`.

## 백엔드 API

### 상담 접수

- **POST** `/api/submit_inquiry.php`
- **Content-Type**: `application/x-www-form-urlencoded`
- **필드**: `c_name`, `c_tel`, `c_content` (필수), `c_inflow` (선택), `c_inflowurl` (선택: `contact` | `contact-ad`)
- **검증**: 성함 한글 2~10자 · 연락처 `010`+8자리 · 문의 5~500자
- **응답**: `{ "result": "1"|"0", "msg": "..." }`
- 차단 IP·1시간 3회 도배: 사용자에게는 성공처럼 응답, DB INSERT 없음

### 게시판 조회 (공개)

| 엔드포인트                         | 설명                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/board/get_list.php`      | 목록 (`sort`: 최신순·조회수·제목 등). `success`·`column`은 `category` 쿼리로 `wr_7` 필터 (`criminal` \| `civil` \| `family` \| `real-estate`, 생략 시 전체) |
| `GET /api/board/get_view.php`      | 상세 + 이전/다음 + 첨부 (`wr_datetime <= NOW()` 미래 글 제외)                                                                                               |
| `GET /api/board/download_file.php` | 첨부 다운로드 (비밀번호·JWT 검증)                                                                                                                           |

허용 게시판: `review`, `success`, `column`, `news`

### 게시판 관리 (JWT)

| 엔드포인트                                    | 설명                       |
| --------------------------------------------- | -------------------------- |
| `POST /api/board/auth/login.php`              | 로그인                     |
| `GET /api/board/auth/me.php`                  | 세션 확인                  |
| `GET /api/board/get_post.php`                 | 관리자 수정 폼용 단건 조회 |
| `POST\|PUT\|DELETE /api/board/write_post.php` | 글 CRUD                    |
| `GET /api/board/get_scheduled_list.php`       | 예약글 목록                |
| `POST /api/board/upload_file.php`             | 파일 업로드 (최대 10MB)    |

### 상담 문의 관리 (JWT, 최고관리자)

| 엔드포인트                      | 설명                                 |
| ------------------------------- | ------------------------------------ |
| `GET /api/inquiry/list.php`     | 목록 (`page`, `per_page` 기본 20)    |
| `GET /api/inquiry/get.php?idx=` | 상세                                 |
| `PATCH /api/inquiry/update.php` | `c_state`, `block`, `c_state2`(메모) |

### CORS 허용 Origin

`submit_inquiry.php`, `backend/lib/cors.php` 공통:

- `https://yeoon.co.kr`, `https://www.yeoon.co.kr`
- `https://new.yeoon.co.kr` (Vercel 스테이징)
- `http://localhost:3000`, `http://localhost:4173`

Vercel·로컬에서 `NEXT_PUBLIC_INQUIRY_API_URL=/api/submit_inquiry.php`이면 same-origin이라 CORS 불필요.

## 배포

### Frontend

**카페24 (Node 런타임)**

1. `.env.local`에 운영 API URL 설정 → `npm run build`
2. 서버에서 `npm run start`
3. 레포 루트 `.htaccess`를 `public_html/.htaccess`에 반영 (레거시 301, `/api/`·`/board/` 제외, `config/` 차단)

> Node 런타임 불가 시 정적 export 방식으로 전환.

**Vercel (권장 스테이징)** — `NEXT_PUBLIC_INQUIRY_API_URL=/api/submit_inquiry.php`, rewrite로 카페24 API 프록시.

### Backend (PHP)

1. FTP로 `backend/` 업로드 (예: `public_html/backend/`)
2. 샘플 → 운영 파일 복사 (Git 커밋 금지):

   | 샘플                            | 운영 파일                |
   | ------------------------------- | ------------------------ |
   | `config/db_conn.sample.php`     | `config/db_conn.php`     |
   | `config/app_config.sample.php`  | `config/app_config.php`  |
   | `api/submit_inquiry.sample.php` | `api/submit_inquiry.php` |

3. `db_conn.php` — DB 접속 정보
4. `schema.sql` — `user_inquiry` 테이블 확인
5. `app_config.php` — Aligo 알림톡, `JWT_SECRET`, `$BOARD_FILE_DIR`
6. `backend/api/board/*.php`, `backend/lib/*.php`를 서버 `/api/board/`, `/lib/`에 반영

## 보안

- Aligo·DB 비밀번호는 `app_config.php`, `db_conn.php`에만 보관. 레포에 올리지 않음.
- 노출된 API 키는 재발급·로테이션 권장.
- `/admin/` robots disallow·noindex는 보안 장치가 아님 — JWT·API 권한이 실제 방어선.

## 검증

```bash
cd frontend && npm run build && npm run lint
```

**기능 체크**

- [ ] `/contact/` 상담 제출 → `result: "1"`, DB 적재
- [ ] `/review/`, `/success-story/`, `/column/`, `/news/` 목록·상세 (첨부 글 500 없음)
- [ ] `/success-story/criminal/` 등 소분류 목록·검색·페이지네이션, `/success-story/{wr_id}/` 상세 404 없음
- [ ] `/column/criminal/` 등 칼럼 소분류·상세 동일 동작
- [ ] 게시물 상세 모바일 — 레거시 2열 표 세로 스택
- [ ] `/admin/login` → 로그인 → 게시판 관리자 바 노출
- [ ] 글 작성·예약 발행·첨부 업로드(10MB)·비밀번호 첨부 다운로드
- [ ] `/robots.txt`, `/sitemap.xml` 200 응답
- [ ] GA4 — 동의 전 gtag 요청 없음, 동의 후 이벤트 수집
- [ ] 레거시 URL 301, `/api/board/` 응답

**카페24 배포 시 업로드 확인**: `backend/lib/` (board_write, board_files, pbkdf2 등), `backend/api/board/`, `config/app_config.php` (JWT_SECRET).
