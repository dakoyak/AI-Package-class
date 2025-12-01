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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

type Notice = {
  id: number;
  content: string;
  created_at: string;
};

function RootLayout() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notices`);
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  useEffect(() => {
    if (notices.length === 0) return;

    const interval = setInterval(() => {
      setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 3000); // 3초마다 변경

    return () => clearInterval(interval);
  }, [notices]);

  const [isTeacher, setIsTeacher] = useState(false);

  const checkUserRole = () => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setIsTeacher(parsed.type === 'teacher');
      } catch {
        setIsTeacher(false);
      }
    } else {
      setIsTeacher(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    window.addEventListener('auth-change', checkUserRole);
    return () => window.removeEventListener('auth-change', checkUserRole);
  }, []);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to={ROUTES.home} className={styles.homeLink}>
          <div className={styles.homeButton}>
            <img src="/src/assets/eraser.png" alt="홈으로" />
          </div>
        </NavLink>

        <div className={styles.noticeBar}>
          <div className={styles.noticeContent} key={currentNoticeIndex}>
            <p className={styles.noticeText}>
              {notices.length > 0 ? notices[currentNoticeIndex].content : "등록된 공지사항이 없습니다."}
            </p>
          </div>
        </div>

        {isTeacher && (
          <NavLink to={ROUTES.dashboard.teacherAdmin} className={styles.adminButton}>
            관리
          </NavLink>
        )}

        <AuthHeader />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
