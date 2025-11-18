# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# 🕵️ AI 탐정단 본부 (AI Detective HQ)

초등학생을 위한 AI 리터러시 교육 플랫폼

## 📋 프로젝트 개요

**AI 탐정단 본부**는 초등학생들이 AI의 편견과 안전장치를 직접 체험하며 배울 수 있는 인터랙티브 웹 기반 교육 플랫폼입니다. 게임처럼 재미있는 미션을 통해 AI 기술의 작동 원리와 한계를 이해하고, 비판적 사고력을 기를 수 있습니다.

### 🎯 교육 목표

1. **AI 편견 이해하기**: AI가 학습 데이터의 편견을 어떻게 반영하는지 체험
2. **AI 안전장치 알아보기**: AI가 유해한 콘텐츠를 어떻게 차단하는지 학습
3. **비판적 사고력 기르기**: AI 결과를 무조건 믿지 않고 분석하는 능력 향상

### 🎮 주요 기능

#### 미션 1: 편견 찾기 🔍
- AI가 생성한 이미지에서 성별, 직업, 문화적 편견 발견
- 8가지 케이스 (의사, 간호사, CEO, 선생님, 엔지니어 등)
- 사전 생성된 이미지로 안전하고 빠른 학습 경험 제공

#### 미션 2: 안전장치 확인 🛡️
- AI의 콘텐츠 필터링 시스템 체험
- 저작권, 유해 콘텐츠, 불법 활동 차단 확인
- 실시간 OpenAI API 호출로 실제 AI 반응 관찰

### 🎨 특징

- **교실 TV 최적화**: 1920x1080 해상도에서 스크롤 없이 모든 콘텐츠 표시
- **고대비 디자인**: 18px 이상 폰트, 높은 명암비로 멀리서도 선명하게
- **귀여운 캐릭터**: 알피(Alphy) 탐정이 함께하는 즐거운 학습
- **사운드 효과**: 클릭, 결과 표시 시 피드백 사운드
- **반응형 레이아웃**: 다양한 화면 크기 지원

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 (학생/교사)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  IntroPage   │  │  MissionHub  │  │ ChallengePage│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Components (Alphy, Grid, Textbox)        │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │    Core (API Client, Canned Data, Guardrails)    │      │
│  └──────────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Node.js + Express)                  │
│  ┌──────────────────────────────────────────────────┐      │
│  │         /api/challenge/guardrail (POST)          │      │
│  │         /health (GET)                            │      │
│  └──────────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI API                                │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  DALL-E 3    │              │    GPT-4     │            │
│  │ (이미지 생성) │              │  (텍스트 생성)│            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ 개발 환경 세팅

### 프런트엔드 (Vite)
1. 루트 디렉터리에서 의존성을 설치합니다.
   ```bash
   npm install
   ```
2. `.env.example`을 복사해 `.env`를 만들고 아래 값을 채웁니다.
   ```ini
   VITE_GEMINI_API_KEY=your_google_generative_ai_key
   VITE_GEMINI_TEXT_MODEL=gemini2.5-flash
   VITE_GEMINI_IMAGE_MODEL=gemini-1.5-flash
   VITE_API_URL=http://localhost:5001
   ```
3. 개발 서버 실행
   ```bash
   npm run dev
   ```

### 백엔드 (Express)
1. 백엔드 폴더로 이동하고 의존성을 설치합니다.
   ```bash
   cd backend
   npm install
   ```
2. `.env` 파일을 만들고 필수 값을 설정합니다.
   ```ini
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=your_google_generative_ai_key  # 세종대왕 인터뷰 기능
   PORT=5001
   FRONTEND_URL=http://localhost:5173
   ```
3. 개발 서버 실행
   ```bash
   npm run dev  # nodemon
   ```
4. 헬스체크로 서버를 확인합니다: `http://localhost:5001/health`
5. SQLite 데이터베이스(`database.db`)는 서버 실행 시 자동 생성/마이그레이션됩니다.

## 🔗 라우팅 요약 (`src/routes/paths.ts`)

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 대시보드 (모듈 타일) |
| `/ai-literacy` | AI 리터러시 인트로 및 미션 선택 |
| `/ai-literacy/mission/:missionType` | 미션 허브 (`missionType`: `bias` 또는 `guardrail`) |
| `/ai-literacy/challenge/:missionType/:challengeId` | 라이브 챌린지 실행 페이지 |
| `/creative-classroom/creativity` | 창의력 스튜디오 레이아웃 |
| `/creative-classroom/creativity/sparring` | AI 상상 스파링 모듈 |
| `/creative-classroom/creativity/art` | AI 아트 워크숍 |
| `/creative-classroom/creativity/writing` | AI 글쓰기 듀오 |
| `/immersive/history` | 몰입형 체험 - AI 역사 인터뷰 |
| `/immersive/coach` | 몰입형 체험 - AI 체육 코치 |
| `/collaboration/smart-discussion` | 곰곰이 스마트 토론 교실 |
| `/dashboard/activity-log` | 나의 활동 기록 |
| `/dashboard/class-board` | 학급 게시판 |

---

## 📁 프로젝트 구조

```
ai-detective-hq/
├── frontend/                          # 프론트엔드 (React + TypeScript)
│   ├── src/
│   │   ├── assets/                    # 정적 리소스 (이미지, 폰트)
│   │   ├── components/                # 재사용 가능한 UI 컴포넌트
│   │   │   ├── AlphyCharacter.tsx     # 알피 캐릭터 (5가지 감정 상태)
│   │   │   ├── ResultGrid.tsx         # 이미지 그리드 (3열, 애니메이션)
│   │   │   ├── ResultTextbox.tsx      # 말풍선 텍스트 박스
│   │   │   ├── MissionButton.tsx      # 미션 선택 버튼
│   │   │   ├── LoadingSpinner.tsx     # 로딩 애니메이션
│   │   │   ├── ErrorBoundary.tsx      # 에러 처리
│   │   │   └── ...
│   │   ├── pages/                     # 페이지 컴포넌트
│   │   │   ├── NewIntroPage.tsx       # 메인 페이지 (미션 선택)
│   │   │   ├── MissionHub.tsx         # 미션별 챌린지 목록
│   │   │   └── NewLiveChallengePage.tsx # 챌린지 실행 페이지
│   │   ├── core/                      # 핵심 비즈니스 로직
│   │   │   ├── apiClient.ts           # 백엔드 API 통신
│   │   │   ├── cannedData.ts          # 편견 케이스 데이터 (8개)
│   │   │   ├── guardrailCases.ts      # 안전장치 케이스 데이터 (6개)
│   │   │   └── soundEffects.ts        # 사운드 효과 재생
│   │   ├── styles/                    # 스타일 설정
│   │   │   ├── theme.ts               # 색상, 폰트, 간격 테마
│   │   │   └── GlobalStyle.ts         # 전역 스타일 (TV 최적화)
│   │   ├── App.tsx                    # 앱 라우팅 설정
│   │   └── main.tsx                   # 앱 진입점
│   ├── public/                        # 공개 정적 파일
│   │   └── images/                    # 편견 케이스 이미지
│   ├── package.json                   # 의존성 관리
│   └── vite.config.ts                 # Vite 빌드 설정
│
├── backend/                           # 백엔드 (Node.js + Express)
│   ├── database/
│   │   └── init.js                    # SQLite 초기화 및 더미 데이터
│   ├── routes/
│   │   └── challenge.js               # API 라우트 (guardrail 챌린지)
│   ├── server.js                      # 인증/세종/가드레일 서버
│   ├── package.json                   # 의존성 관리
│   └── .env.example                   # 환경 변수 템플릿
│
└── README.md                          # 이 파일
```

---

## 🔧 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 프레임워크 |
| TypeScript | 5.9.3 | 타입 안전성 |
| Vite | 7.2.2 | 빌드 도구 (빠른 HMR) |
| React Router | 7.9.6 | 페이지 라우팅 |
| Styled Components | 6.1.19 | CSS-in-JS 스타일링 |
| Axios | 1.13.2 | HTTP 클라이언트 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 런타임 환경 |
| Express | 5.1.0 | 웹 프레임워크 |
| Axios | 1.13.2 | OpenAI API 호출 |
| SQLite3 | 5.1.x | 로컬 사용자 DB |
| bcryptjs | 3.0.3 | 비밀번호 해시 |
| @google/generative-ai | 0.24.1 | 세종 인터뷰(Gemini) |
| CORS | 2.8.5 | CORS 미들웨어 |
| dotenv | 17.2.3 | 환경 변수 관리 |

### External APIs
- **OpenAI DALL-E 3**: 이미지 생성 (미션 2)
- **Google Gemini 1.5 Flash**: 세종대왕 페르소나 Q&A
- **OpenAI GPT-4**: 텍스트 생성 (미션 2)

---

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- OpenAI API 키 (미션 2 실행 시 필요)

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd ai-detective-hq
```

### 2. Frontend 설정
```bash
cd frontend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 VITE_API_URL 확인 (기본값: http://localhost:5001)

# 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 접속
```

### 3. Backend 설정
```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 OpenAI API 키 입력
# OPENAI_API_KEY=your_api_key_here

# 개발 서버 실행
npm run dev
# → http://localhost:5001 에서 실행
```

### 4. 프로덕션 빌드
```bash
# Frontend 빌드
cd frontend
npm run build
# → dist/ 폴더에 빌드 파일 생성

# Backend 실행
cd backend
npm start
```

---

## 📚 주요 파일 설명

### Frontend 핵심 파일

#### `src/App.tsx`
- 앱의 라우팅 설정
- 3개 페이지: 메인(`/`), 미션 허브(`/mission/:type`), 챌린지(`/challenge/:type/:id`)
- ErrorBoundary로 전역 에러 처리
- 사운드 효과 사전 로드

#### `src/core/cannedData.ts`
- 미션 1(편견 찾기)의 8개 케이스 데이터
- 각 케이스: 제목, 프롬프트, 이미지 URL, 토론 질문, 학습 포인트
- 직업 편견(의사, 간호사, CEO 등), 성역할 편견, 문화적 편견 포함

#### `src/core/guardrailCases.ts`
- 미션 2(안전장치 확인)의 6개 케이스 데이터
- 저작권(유명 캐릭터), 유해 콘텐츠(폭력), 불법 활동 등
- 각 케이스: API 타입(DALL-E/GPT), 예상 거절 키워드

#### `src/core/apiClient.ts`
- 백엔드 API 통신 모듈
- `runGuardrailChallenge()`: 안전장치 챌린지 실행
- 에러 처리, 재시도 로직, 타임아웃 관리

#### `src/components/AlphyCharacter.tsx`
- 알피 캐릭터 컴포넌트 (5가지 상태)
  - `idle`: 기본 상태
  - `thinking`: 생각 중 (로딩)
  - `surprised`: 놀람 (편견 발견)
  - `shielding`: 방어 (안전장치 작동)
  - `happy`: 기쁨 (성공)
- SVG 기반 애니메이션

#### `src/styles/theme.ts`
- 디자인 시스템 정의
- 색상: 하늘색(#87CEEB), 노란색(#FFD700), 흰색, 진한 회색
- 폰트 크기: 18px(small) ~ 48px(xlarge)
- 간격: 8px(xs) ~ 48px(xl)
- 브레이크포인트: 768px(tablet), 1024px(desktop), 1920px(tv)

### Backend 핵심 파일

#### `server.js`
- Express 서버 설정 (단일 백엔드)
- CORS 설정 (개발/프로덕션 환경 분리)
- OpenAI/Gemini API 키 검증 및 로깅
- 로그인/회원가입/학생 정보/세종 Q&A 엔드포인트
- `/api/challenge/guardrail` 라우트 장착
- 헬스 체크 엔드포인트 (`/health`)와 공통 에러 핸들링

#### `routes/challenge.js`
- `POST /api/challenge/guardrail`: 안전장치 챌린지 실행
  - 요청: `{ prompt: string, apiType: 'dalle' | 'gpt' }`
  - 응답: `{ status: 'success' | 'rejected' | 'error', ... }`
- OpenAI API 호출 (DALL-E 3 / GPT-4)
- 거절 감지 및 에러 처리
- 타임아웃: DALL-E 60초, GPT 30초

#### `database/init.js`
- SQLite 연결 및 `students`, `teachers` 테이블 자동 생성
- 테스트용 더미 계정(학생/교사) 자동 주입
- bcrypt로 비밀번호 해시 저장

---

## 🎓 교육 활용 가이드

### 수업 진행 방법

#### 1단계: 도입 (5분)
- 메인 페이지에서 알피 캐릭터 소개
- AI가 무엇인지, 어떻게 학습하는지 간단히 설명

#### 2단계: 미션 1 - 편견 찾기 (20분)
1. "의사 선생님" 케이스 시작
2. 생성된 6개 이미지 관찰
3. 토론 질문: "왜 AI는 의사를 대부분 남자로 그렸을까요?"
4. 학습 포인트 확인
5. 다른 케이스들도 같은 방식으로 진행

**토론 주제**:
- AI는 어디서 데이터를 배울까?
- 편견이 있는 데이터로 학습하면 어떻게 될까?
- 우리는 어떻게 공정한 AI를 만들 수 있을까?

#### 3단계: 미션 2 - 안전장치 확인 (20분)
1. "유명 캐릭터 그리기" 케이스 시작
2. 생성 버튼 클릭 → AI 거절 메시지 확인
3. 토론 질문: "왜 AI가 이 그림을 그려주지 않았을까요?"
4. 학습 포인트 확인
5. 다른 케이스들도 같은 방식으로 진행

**토론 주제**:
- AI에게 안전장치가 필요한 이유는?
- 어떤 콘텐츠를 차단해야 할까?
- AI를 안전하게 사용하는 방법은?

#### 4단계: 정리 (5분)
- 오늘 배운 내용 요약
- AI를 비판적으로 바라보는 자세의 중요성 강조

### 교실 환경 설정

#### TV 디스플레이 (권장)
- 해상도: 1920x1080 (Full HD)
- 브라우저 전체화면 모드 (F11)
- 확대/축소: 100%
- 시청 거리: 2-4미터

#### 개별 태블릿/PC
- 최소 해상도: 1024x768
- 모던 브라우저 (Chrome, Firefox, Safari, Edge)

---

## 🔒 보안 및 개인정보

### 데이터 수집
- **수집하지 않음**: 학생 개인정보, 로그인 정보
- **임시 저장**: API 요청/응답 (서버 메모리, 세션 종료 시 삭제)

### API 키 관리
- 백엔드 서버에서만 API 키 사용
- 프론트엔드에 노출되지 않음
- `.env` 파일로 관리 (Git에 커밋하지 않음)

### 콘텐츠 안전성
- 미션 1: 사전 검토된 이미지만 사용
- 미션 2: OpenAI의 콘텐츠 필터링 시스템 활용
- 부적절한 콘텐츠 차단

---

## 🐛 문제 해결

### Frontend 실행 오류
```bash
# 포트 충돌 시
# vite.config.ts에서 포트 변경 또는
PORT=3000 npm run dev

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### Backend 실행 오류
```bash
# API 키 오류
# .env 파일에 OPENAI_API_KEY 확인

# 포트 충돌 시
PORT=5002 npm run dev

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### API 호출 실패
- 백엔드 서버 실행 확인: `http://localhost:5001/health`
- CORS 설정 확인: `.env`의 `FRONTEND_URL`
- OpenAI API 키 유효성 확인
- 네트워크 연결 확인

---

## 📈 향후 개선 계획

### 기능 추가
- [ ] 교사용 대시보드 (학습 진행 상황 확인)
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 더 많은 편견 케이스 추가
- [ ] 학습 결과 저장 및 공유 기능

### 기술 개선
- [ ] 4K 디스플레이 지원 (3840x2160)
- [ ] PWA 변환 (오프라인 지원)
- [ ] 접근성 개선 (스크린 리더 최적화)
- [ ] 성능 최적화 (이미지 lazy loading)

---

## 👥 기여하기

이 프로젝트는 교육 목적으로 개발되었습니다. 개선 제안이나 버그 리포트는 환영합니다!

### 개발 가이드라인
1. 코드 스타일: ESLint + Prettier 설정 준수
2. 커밋 메시지: 명확하고 설명적으로
3. 테스트: 주요 기능 변경 시 수동 테스트 필수
4. 문서화: README 및 코드 주석 업데이트

---

## 📄 라이선스

ISC License

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ for elementary school students learning about AI**
