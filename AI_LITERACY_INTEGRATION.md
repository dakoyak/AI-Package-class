# AI 리터러시 모듈 통합 완료

## 📋 통합 개요

here 폴더의 AI 리터러시 수업 모듈이 Hackathon 프로젝트에 성공적으로 통합되었습니다.

## ✅ 통합된 주요 기능

### 1. AI 리터러시 모듈 핵심 컴포넌트

#### 페이지 컴포넌트
- `LiteracyIntroPage.tsx` - AI 리터러시 수업 도입 페이지
- `MissionHubPage.tsx` - 미션 선택 허브 페이지
- `LiveChallengePage.tsx` - 실시간 챌린지 진행 페이지

#### 데이터 파일
- `cannedData.ts` - 미션 1 '편견 찾기' 데이터 (한국어 프롬프트로 업데이트)
  - case1_doctor: 의사 선생님
  - case2_nurse: 간호사
  - case3_ceo: 회사 대표
  - case5_engineer: 엔지니어
  - case6_teacher: 선생님
  - '아름다운 사람' 케이스 제거됨

- `guardrailCases.ts` - 미션 2 '안전장치 확인' 데이터 (한국어 프롬프트로 업데이트)
  - 저작권 보호 테스트
  - 폭력성 콘텐츠 차단 테스트
  - 불법 정보 차단 테스트
  - 유명인 초상권 보호 테스트
  - 위험한 정보 차단 테스트
  - 혐오 표현 차단 테스트

#### Context 및 상태 관리
- `AiLiteracyFullscreenContext.tsx` - 전체화면 모드 상태 관리

### 2. 공유 컴포넌트 업데이트

#### DialogueBox 컴포넌트
- 이전/다음 탐색 버튼 추가
- `onPrev`, `showPrev` props 추가
- 버튼 스타일 개선 (◀ 이전, 다음 ▶)

#### 새로운 공유 컴포넌트
- `ToggleFullscreenButton.tsx` - 전체화면 토글 버튼

### 3. 전역 스타일 업데이트

#### GlobalStyle.ts → GlobalStyle.tsx
- React Hook 사용을 위해 함수형 컴포넌트로 변경
- `useAiLiteracyFullscreen` hook 통합
- 전체화면 모드 시 갈색 테두리 숨김 기능 추가

### 4. 백엔드 API 통합

#### Challenge Routes (`backend/routes/challenge.js`)
- OpenAI API 통합 (Gemini에서 OpenAI로 전환)
- DALL-E 3를 사용한 이미지 생성 안전장치 테스트
- GPT-4를 사용한 텍스트 생성 안전장치 테스트
- 한국어 거절 키워드 목록 확장
- API 오류 처리 개선 (429 Rate Limit 등)

#### 의존성 추가
- `openai` 패키지 (v6.9.1) 추가

### 5. 라우팅 업데이트

#### App.tsx
- `AiLiteracyFullscreenProvider` 추가
- `Outlet` import 추가
- AI 리터러시 라우트를 중첩 라우트로 변경
- 새로운 페이지 컴포넌트 import

```typescript
<Route path={ROUTES.aiLiteracy.root} element={<Outlet />}>
  <Route index element={<LiteracyIntroPage />} />
  <Route path="mission/:missionType" element={<MissionHubPage />} />
  <Route path="challenge/:missionType/:challengeId" element={<LiveChallengePage />} />
</Route>
```

## 📦 복사된 파일 목록

### 프론트엔드
```
here/src/features/ai-literacy/ → Hackathon/src/features/ai-literacy/
  ├── pages/
  │   ├── LiteracyIntroPage.tsx
  │   ├── MissionHubPage.tsx
  │   └── LiveChallengePage.tsx
  ├── data/
  │   ├── cannedData.ts
  │   └── guardrailCases.ts
  ├── assets/
  │   └── ai-literacy.png
  └── AiLiteracyFullscreenContext.tsx

here/src/shared/ToggleFullscreenButton.tsx → Hackathon/src/shared/
```

### 백엔드
```
here/backend/routes/challenge.js → Hackathon/backend/routes/challenge.js
```

### 이미지 에셋
```
here/public/images/bias/engineer/ → Hackathon/public/images/bias/engineer/
here/public/images/bias/ceo/ → Hackathon/public/images/bias/ceo/
```

## 🔧 수정된 파일 목록

### 프론트엔드
1. `Hackathon/src/App.tsx`
   - AiLiteracyFullscreenProvider 추가
   - 새로운 페이지 import
   - 라우트 구조 변경

2. `Hackathon/src/components/DialogueBox.tsx`
   - 이전/다음 탐색 버튼 추가
   - Props 인터페이스 확장

3. `Hackathon/src/styles/GlobalStyle.ts`
   - 함수형 컴포넌트로 변경
   - 전체화면 모드 지원 추가

4. `Hackathon/src/core/cannedData.ts`
   - 한국어 프롬프트로 업데이트
   - 케이스 정리 (아름다운 사람 제거)

5. `Hackathon/src/core/guardrailCases.ts`
   - 한국어 프롬프트로 업데이트

### 백엔드
1. `Hackathon/backend/package.json`
   - `openai` 의존성 추가

2. `Hackathon/.env.example`
   - `OPENAI_API_KEY` 추가

## 🚀 사용 방법

### 1. 환경 변수 설정
`.env` 파일에 OpenAI API 키를 추가하세요:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. 백엔드 의존성 설치
```bash
cd Hackathon/backend
npm install
```

### 3. 서버 실행
```bash
# 백엔드 서버
cd Hackathon/backend
npm start

# 프론트엔드 서버 (다른 터미널)
cd Hackathon
npm run dev
```

### 4. AI 리터러시 모듈 접속
브라우저에서 `http://localhost:5173/ai-literacy` 로 접속하세요.

## 🎯 주요 개선 사항

1. **한국어 프롬프트**: 모든 AI 프롬프트가 한국어로 변경되어 학생들이 이해하기 쉬워졌습니다.

2. **대화 탐색**: 이전/다음 버튼으로 대화를 자유롭게 탐색할 수 있습니다.

3. **전체화면 모드**: 수업 중 집중도를 높이기 위한 전체화면 기능이 추가되었습니다.

4. **OpenAI 통합**: 더 안정적인 안전장치 테스트를 위해 OpenAI API를 사용합니다.

5. **에러 처리 개선**: API 오류 상황에 대한 한국어 메시지가 추가되었습니다.

## ✨ 다음 단계

1. OpenAI API 키를 `.env` 파일에 설정
2. 백엔드 서버에서 `npm install` 실행
3. 프론트엔드와 백엔드 서버 실행
4. `/ai-literacy` 경로로 접속하여 테스트

## 📝 참고사항

- 미션 1 '편견 찾기'는 사전 생성된 이미지를 사용합니다 (API 호출 없음)
- 미션 2 '안전장치 확인'은 OpenAI API를 실시간으로 호출합니다
- 전체화면 모드는 AI 리터러시 모듈에서만 작동합니다
- 모든 대화와 학습 내용은 한국어로 제공됩니다
