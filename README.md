# 법무법인 여온 (yn_main)

Next.js 프론트엔드(`frontend/`)와 카페24 PHP 상담 API(`backend/`)로 구성된 메인 사이트 마이그레이션 레포입니다.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

개발 서버: [http://localhost:3000](http://localhost:3000)

### 환경 변수

`frontend/.env.example`를 참고해 `frontend/.env.local`을 만듭니다.

| 변수                          | 설명                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_INQUIRY_API_URL` | 상담 접수 PHP API URL. 비우면 폼 제출 시 안내 스텁 메시지 표시 |

```bash
cp frontend/.env.example frontend/.env.local
```

## Backend (상담 API)

PHP 7.3 + MariaDB 10.x. reCAPTCHA 없이 IP·도배·중복 전화 방어 후 `user_inquiry`에 저장합니다.

### 디렉터리

```
backend/
  config/
    db_conn.sample.php
    app_config.sample.php
  api/
    submit_inquiry.sample.php
```

### 카페24 배포 절차

1. FTP로 `backend/` 구조를 호스팅에 업로드 (예: `public_html/backend/`).
2. 샘플 파일을 운영용으로 복사·편집 (git에 커밋하지 않음):

   | 샘플                            | 운영 파일                |
   | ------------------------------- | ------------------------ |
   | `config/db_conn.sample.php`     | `config/db_conn.php`     |
   | `config/app_config.sample.php`  | `config/app_config.php`  |
   | `api/submit_inquiry.sample.php` | `api/submit_inquiry.php` |

3. `db_conn.php`에 DB 호스트·계정·DB명 입력.
4. `app_config.php`에 Aligo 알림톡 값 입력. 키·수신자가 비어 있으면 DB 저장만 하고 알림톡은 보내지 않습니다.
5. 공개 URL 확인 (경로 예시):

   `https://yeoon.co.kr/backend/api/submit_inquiry.php`

6. Next/Vercel `NEXT_PUBLIC_INQUIRY_API_URL`에 위 URL 설정.

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
cd frontend && npm run build
```

`/contact`에서 API URL 설정 후 제출 → DB 적재 및 응답 `result: "1"` 확인.
