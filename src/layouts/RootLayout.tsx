import { NavLink, Outlet } from 'react-router-dom';
import { creativityModules, getCreativityModulePath } from '../features/creativity/modules';
import { ROUTES } from '../routes/paths';
import styles from './RootLayout.module.css';

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
    menuLabel: 'AI 역사 인터뷰',
    summary: '세종대왕과 실시간 대화 체험',
  },
  {
    path: ROUTES.immersive.coach,
    menuLabel: 'AI 체육 코치',
    summary: '포즈 인식으로 운동 피드백 받기',
  },
];

const collaborationNavItems = [
  {
    path: ROUTES.collaboration.smartDiscussion,
    menuLabel: '곰곰이 스마트 토론',
    summary: '음성 인식으로 갈등을 중재하는 토론 수업',
  },
];

const navItems: NavigationItem[] = [
  { label: '홈', path: ROUTES.home },
  {
    label: '창의력',
    path: ROUTES.creativity.root,
  },
  { label: 'AI 리터러시', path: ROUTES.aiLiteracy.root },
  {
    label: '몰입형 체험',
    path: ROUTES.immersive.history,
    
  },
  {
    label: '논리/협업',
    path: ROUTES.collaboration.smartDiscussion,
   
  },
  { label: '나의활동 기록', path: ROUTES.dashboard.activityLog },
  { label: '학급 게시판', path: ROUTES.dashboard.classBoard },
];

function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.noticeBar}>
          <div className={styles.noticeTrack}>
            <p className={styles.noticeText}>
              오늘의 알림: 상상 스파링으로 친구와 아이디어 라운드를 시작해 보세요! · 글쓰기 듀오에 새 학년별 템플릿이
              추가됐습니다. · 아트 워크숍은 오후 2시 이후 예약 없이 사용 가능해요.
            </p>
            <p className={styles.noticeText} aria-hidden="true">
              오늘의 알림: 상상 스파링으로 친구와 아이디어 라운드를 시작해 보세요! · 글쓰기 듀오에 새 학년별 템플릿이
              추가됐습니다. · 아트 워크숍은 오후 2시 이후 예약 없이 사용 가능해요.
            </p>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <div
              key={item.path}
              className={item.submenu ? `${styles.navItem} ${styles.hasMenu}` : styles.navItem}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {item.label}
              </NavLink>

              {item.submenu && (
                <div className={styles.submenu}>
                  {item.submenu.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        isActive ? `${styles.subLink} ${styles.subActive}` : styles.subLink
                      }
                    >
                      <span className={styles.subLabel}>{child.menuLabel}</span>
                      <span className={styles.subSummary}>{child.summary}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
