import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { creativityModules, getCreativityModulePath } from '../features/creativity/modules';
import { ROUTES } from '../routes/paths';
import styles from './RootLayout.module.css';
import AuthHeader from '../shared/AuthHeader';

type NavigationItem = {
  label: string;
  path: string;
  submenu?: Array<{
    path: string;
    menuLabel: string;
    summary: string;
  }>;
};

const immersiveNavItems = [
  {
    path: ROUTES.immersive.history,
    menuLabel: "AI 역사 인터뷰",
    summary: "세종대왕과 실시간 대화 체험",
  },
  {
    path: ROUTES.immersive.coach,
    menuLabel: "AI 피트니스 코치",
    summary: "포즈 인식으로 운동 피드백 받기",
  },
];

const collaborationNavItems = [
  {
    path: ROUTES.collaboration.smartDiscussion,
    menuLabel: "곰곰이 스마트 토론",
    summary: "음성 인식으로 갈등을 중재하는 토론 수업",
  },
];

const navItems: NavigationItem[] = [
  { label: "홈", path: ROUTES.home },
  {
    label: "창의력",
    path: ROUTES.creativity.root,
  },
  { label: "AI 리터러시", path: ROUTES.aiLiteracy.root },
  {
    label: "몰입형 체험",
    path: ROUTES.immersive.history,
  },
  {
    label: "논리/협업",
    path: ROUTES.collaboration.smartDiscussion,
  },
  { label: "나의활동 기록", path: ROUTES.dashboard.activityLog },
  { label: "학급 게시판", path: ROUTES.dashboard.classBoard },
];

const notices = [
  "오늘의 알림: 상상 스파링으로 친구와 아이디어 라운드를 시작해 보세요! 💡",
  "🎉 3학년 2반 11번 이평안 오늘 생일! 축하합니다! 🎂",
  "📢 다음 주 월요일은 개교기념일입니다. 학교에 오지 마세요! 🏫",
];

function RootLayout() {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 3000); // 3초마다 변경

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to={ROUTES.home} className={styles.homeLink}>
          <div className={styles.homeButton}>
            <img src="/src/assets/eraser.png" alt="홈으로" />
          </div>
        </NavLink>

        <div
          className={styles.noticeBar}
        >
          <div className={styles.noticeContent} key={currentNoticeIndex}>
            <p className={styles.noticeText}>
              {notices[currentNoticeIndex]}
            </p>
          </div>
        </div>

        <AuthHeader />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
