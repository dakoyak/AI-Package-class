import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ROUTE_BASE, ROUTES } from './routes/paths';
import { theme } from './styles/theme';
import { NewIntroPage } from './pages/NewIntroPage';
import { MissionHub } from './pages/MissionHub';
import { NewLiveChallengePage } from './pages/NewLiveChallengePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { preloadSounds } from './core/soundEffects';
import { GlobalStyle } from './styles/GlobalStyle';
import HistoricalInterview from './HistoricalInterview/HistoricalInterview';
import FitnessCoach from './FitnessCoach/FitnessCoach';
import SmartDiscussion from './features/smartDiscussion/SmartDiscussion';
import ActivityLogPage from './pages/ActivityLogPage';
import ClassBoardPage from './pages/ClassBoardPage';
import ActivityTracker from './components/ActivityTracker';
import AuthFooter from './shared/AuthFooter';

// Imported from router.jsx
import RootLayout from './layouts/RootLayout';
// import Home from './pages/Home'; // Home is now the root, so it's directly used
import CreativityStudio from './pages/CreativityStudio';
import SparringLab from './features/creativity/SparringLab';
import WritingAtelier from './features/creativity/WritingAtelier';
import ArtWorkshop from './features/creativity/ArtWorkshop';
import CreativityLanding from './features/creativity/CreativityLanding';
import Home from './pages/Home'; // Re-import Home for the root route

const noopLessonHook = () => {};

const HistoricalInterviewLesson = () => (
  <HistoricalInterview onStartLesson={noopLessonHook} onEndLesson={noopLessonHook} />
);

const FitnessCoachLesson = () => (
  <FitnessCoach onStartLesson={noopLessonHook} onEndLesson={noopLessonHook} />
);

function App() {
  // Preload sound effects on app mount
  useEffect(() => {
    preloadSounds();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <>
            <ActivityTracker />
            <Routes>
              <Route path={ROUTES.home} element={<Home />} /> {/* Home is now the root page */}

              {/* AI Literacy routes, nested under /ai-literacy */}
              <Route path={ROUTES.aiLiteracy.root}>
                <Route index element={<NewIntroPage />} />
                <Route path="mission/:missionType" element={<MissionHub />} />
                <Route path="challenge/:missionType/:challengeId" element={<NewLiveChallengePage />} />
              </Route>

              {/* Routes from router.jsx, nested under /creative-classroom */}
              <Route path={ROUTE_BASE.creativeClassroom} element={<RootLayout />}>
                {/* Home was here, but now it's the root */}
                <Route path="creativity" element={<CreativityStudio />}>
                  <Route index element={<CreativityLanding />} />
                  <Route path="sparring" element={<SparringLab />} />
                  <Route path="art" element={<ArtWorkshop />} />
                  <Route path="writing" element={<WritingAtelier />} />
                </Route>
              </Route>

              {/* Immersive experience routes */}
              <Route path={ROUTES.immersive.history} element={<HistoricalInterviewLesson />} />
              <Route path={ROUTES.immersive.coach} element={<FitnessCoachLesson />} />
              <Route path={ROUTES.collaboration.smartDiscussion} element={<SmartDiscussion />} />
              <Route path={ROUTES.dashboard.activityLog} element={<ActivityLogPage />} />
              <Route path={ROUTES.dashboard.classBoard} element={<ClassBoardPage />} />
            </Routes>
            <AuthFooter />
          </>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
