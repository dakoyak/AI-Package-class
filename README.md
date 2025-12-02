<img width="1885" height="873" alt="image" src="https://github.com/user-attachments/assets/b00eab87-71d2-4d39-9e9b-072582165250" />

# AI Creative Classroom (AI 창의융합 교실)

AI Creative Classroom은 초등학생들을 위한 AI 기반 창의 융합 교육 플랫폼입니다. 학생들은 다양한 AI 기술을 직접 체험하고, 역사, 신체 활동, 협업 등 여러 분야에 걸쳐 창의력과 문제 해결 능력을 기를 수 있습니다.

![Project Screenshot](public/images/backgrounds/Gemini_Generated_Image_afsj4nafsj4nafsj.png)

##  주요 기능

- ** 세종대왕 역사 인터뷰:** AI 챗봇으로 구현된 세종대왕과 대화하며 자연스럽게 역사 지식을 학습합니다. (RAG 기술 활용)
- ** AI 피트니스 코치:** MediaPipe 자세 감지 기술을 활용하여 사용자의 자세를 분석하고 운동을 코칭합니다.
- ** 창의력 스튜디오:** 글쓰기, 그림 그리기, 아이디어 구상 등 다양한 창작 활동을 AI와 함께 수행합니다.
- ** 스마트 토론 및 관점 전환기:** 친구들과 토론하고, AI의 도움을 받아 다른 사람의 관점을 이해하는 연습을 합니다.
- ** AI 리터러시 챌린지:** 다양한 미션을 통해 AI의 원리를 배우고 윤리적 문제에 대해 고민합니다.
- ** 학습 활동 대시보드:** 학생과 교사는 학습 진행 상황과 활동 기록을 한눈에 확인할 수 있습니다.

##  기술 스택

### Frontend

- **Framework:** React (with Vite)
- **Language:** TypeScript
- **Styling:** Styled-components
- **AI/ML:** `@google/generative-ai`, `@mediapipe/tasks-vision`
- **Routing:** `react-router-dom`
- **State Management:** Component state, React Context

- **Framework:** React (with Vite)
- **Language:** TypeScript
- **Styling:** Styled-components
- **AI/ML:** `@google/generative-ai`, `@mediapipe/tasks-vision`
- **Routing:** `react-router-dom`
- **State Management:** Component state, React Context

### Backend

- **Framework:** Node.js, Express
- **Language:** JavaScript (CommonJS)
- **Database:** SQLite
- **AI:** `@google/generative-ai`
- **Authentication:** `bcryptjs` for password hashing

# 프로젝트 구조

```
ai-creative-classroom/
├── backend/              # 백엔드 서버 (Node.js, Express)
│   ├── database/         # SQLite 데이터베이스 초기화
│   ├── routes/           # API 라우트
│   ├── server.js         # 메인 서버 파일
│   └── sejong_knowledge_base.txt # 세종대왕 RAG 지식 베이스
├── public/               # 정적 에셋 (이미지, 모델 파일 등)
├── src/                  # 프론트엔드 소스 코드 (React, TypeScript)
│   ├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── core/             # 핵심 로직 (API 클라이언트, canned data 등)
│   ├── features/         # 주요 기능별 모듈
│   ├── pages/            # 페이지 컴포넌트
│   ├── layouts/          # 레이아웃 컴포넌트
│   ├── services/         # Gemini 등 외부 서비스 연동
│   └── styles/           # 전역 스타일 및 테마
├── index.html            # 메인 HTML 파일
├── package.json          # 프론트엔드 의존성 및 스크립트
└── vite.config.ts        # Vite 설정 파일
```

##  시작하기

### 1. 사전 요구사항

- [Node.js](https://nodejs.org/) (v18 이상 권장)
- `pnpm` 또는 `npm`, `yarn` 과 같은 패키지 매니저

### 2. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/your-username/ai-creative-classroom.git
cd ai-creative-classroom

# Frontend 의존성 설치
git clone https://github.com/your-username/ai-creative-classroom.git
cd ai-creative-classroom

# Frontend 의존성 설치
npm install

# Backend 의존성 설치
# Backend 의존성 설치
cd backend
npm install
cd ..
```

### 3. 환경 변수 설정

프로젝트 루트와 `backend` 디렉토리에 각각 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

#### 루트 디렉토리 (`.env`)

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

```env
# Vite에서 사용하는 Gemini API 키
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

#### 백엔드 디렉토리 (`backend/.env`)

```env
# Gemini API 키
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# OpenAI API 키 (Guardrail 기능용)
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# 서버 포트
PORT=5001

# Frontend URL (CORS 설정용)
FRONTEND_URL=http://localhost:5173
```

### 4. 데이터베이스 초기화

백엔드 서버를 처음 실행하면 `database.db` 파일이 자동으로 생성되고 초기화됩니다.

### 5. 애플리케이션 실행

두 개의 터미널을 열고 각각 다음 명령어를 실행합니다.

#### 터미널 1: Frontend (Vite 개발 서버)

```bash
cd ..
```

### 3. 환경 변수 설정

프로젝트 루트와 `backend` 디렉토리에 각각 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

#### 루트 디렉토리 (`.env`)

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

```env
# Vite에서 사용하는 Gemini API 키
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

#### 백엔드 디렉토리 (`backend/.env`)

```env
# Gemini API 키
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# OpenAI API 키 (Guardrail 기능용)
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# 서버 포트
PORT=5001

# Frontend URL (CORS 설정용)
FRONTEND_URL=http://localhost:5173
```

### 4. 데이터베이스 초기화

백엔드 서버를 처음 실행하면 `database.db` 파일이 자동으로 생성되고 초기화됩니다.

### 5. 애플리케이션 실행

두 개의 터미널을 열고 각각 다음 명령어를 실행합니다.

#### 터미널 1: Frontend (Vite 개발 서버)

```bash
npm run dev
```
프론트엔드 서버는 `http://localhost:5173` 에서 실행됩니다.

#### 터미널 2: Backend (Express 서버)
프론트엔드 서버는 `http://localhost:5173` 에서 실행됩니다.

#### 터미널 2: Backend (Express 서버)

```bash
cd backend
npm start
```
백엔드 서버는 `http://localhost:5001` 에서 실행됩니다.

##  사용 가능한 스크립트

### Frontend

- `npm run dev`: 개발 모드로 Vite 서버를 실행합니다.
- `npm run build`: 프로덕션용으로 앱을 빌드합니다.
- `npm run lint`: ESLint로 코드 스타일을 검사합니다.
- `npm run preview`: 빌드된 앱을 미리 봅니다.

### Backend

- `npm start`: Node.js 서버를 실행합니다.
- `npm run dev`: `nodemon`을 사용하여 개발 모드로 서버를 실행합니다 (코드 변경 시 자동 재시작).
- `npm run build:vdb`: 세종대왕 인터뷰용 벡터 DB를 빌드합니다 (OpenAI API 키 필요).

##  중요: 세종대왕 인터뷰 기능 설정

세종대왕 인터뷰 기능을 사용하려면 벡터 DB를 먼저 빌드해야 합니다:

```bash
cd backend
npm run build:vdb
```

이 명령어는 `sejong_knowledge_base.txt`의 내용을 벡터 임베딩으로 변환하여 `vector_db/index.json`에 저장합니다.

**참고:**
- OpenAI API 키가 `.env` 파일에 설정되어 있어야 합니다.
- 처음 한 번만 실행하면 되며, 지식 베이스를 업데이트할 때마다 다시 실행하세요.
- 벡터 DB가 없으면 자동으로 텍스트 기반 fallback을 사용합니다.

##  기여하기

이 프로젝트에 기여하고 싶으시다면, 이슈를 생성하거나 풀 리퀘스트를 보내주세요. 모든 기여를 환영합니다!
