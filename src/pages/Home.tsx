import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import changImg from '../assets/chang.png';
import aiLiteracyBg from '../assets/ai-literacy.png';
import immersiveBg from '../assets/aa.png';
import {
  CREATIVITY_BASE_PATH,
  creativityModules,
  getCreativityModulePath,
} from '../features/creativity/modules';
import { ROUTES } from '../routes/paths';
import styles from './Home.module.css';

type TileSubmenuItem = {
  key: string;
  menuLabel: string;
  summary: string;
  path: string;
};

type TileConfig = {
  title: string;
  color?: string;
  path?: string;
  img?: string;
  submenu?: TileSubmenuItem[];
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
};

const creativityMenuItems: TileSubmenuItem[] = creativityModules.map((module) => ({
  key: module.key,
  menuLabel: module.menuLabel,
  summary: module.summary,
  path: getCreativityModulePath(module.slug),
}));

const immersiveModules: TileSubmenuItem[] = [
  {
    key: 'history',
    menuLabel: 'AI 역사 인터뷰',
    summary: '세종대왕과 실시간 대화 체험',
    path: ROUTES.immersive.history,
  },
  {
    key: 'coach',
    menuLabel: 'AI 체육 코치',
    summary: '포즈 인식으로 운동 피드백 받기',
    path: ROUTES.immersive.coach,
  },
];

const collaborationModules: TileSubmenuItem[] = [
  {
    key: 'smart-discussion',
    menuLabel: '곰곰이 스마트 토론',
    summary: '음성 인식으로 갈등을 중재하는 토론 수업',
    path: ROUTES.collaboration.smartDiscussion,
  },
];

const tileData: TileConfig[] = [
  {
    title: ' ',
    img: changImg,
    path: CREATIVITY_BASE_PATH,
    submenu: creativityMenuItems,
  },
  {
    title: '.',
    color: '#f6b24c',
    submenu: immersiveModules,
    backgroundImage: `url(${immersiveBg})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  {
    title: '논리/협업',
    color: '#d9fa4a',
    submenu: collaborationModules,
  },
  {
    title: ',',
    color: '#51dc5c',
    path: ROUTES.aiLiteracy.root,
    backgroundImage: `url(${aiLiteracyBg})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  { title: '나의활동 기록', color: '#7b8fe9', path: ROUTES.dashboard.activityLog },
  { title: '학급 게시판', color: '#cf77d5', path: ROUTES.dashboard.classBoard },
];

const hasSubmenu = (tile: TileConfig): tile is TileConfig & { submenu: TileSubmenuItem[] } =>
  Array.isArray(tile.submenu) && tile.submenu.length > 0;

function Home() {
  return (
    <section className={`${styles.board} ${styles['transparent-app']}`}>
      <div className={styles.tileGrid}>
        {tileData.map((tile) => {
          if (hasSubmenu(tile)) {
            const backgroundStyle: CSSProperties | undefined = tile.backgroundImage
              ? {
                  backgroundImage: tile.backgroundImage,
                  backgroundSize: tile.backgroundSize,
                  backgroundPosition: tile.backgroundPosition,
                  backgroundRepeat: tile.backgroundRepeat,
                }
              : tile.img
              ? { backgroundImage: `url(${tile.img})` }
              : tile.color
              ? { backgroundColor: tile.color }
              : undefined;

            return (
              <div
                key={tile.title}
                className={`${styles.tile} ${styles.creativityTile}`}
                style={backgroundStyle}
              >
                {tile.path ? (
                  <Link to={tile.path} className={styles.creativityMain}>
                    <span className={styles.creativityHint}>{tile.title}</span>
                  </Link>
                ) : (
                  <div className={styles.creativityMain}>
                    <span className={styles.creativityHint}>{tile.title}</span>
                  </div>
                )}
                <div className={styles.creativityMenu}>
                  {tile.submenu.map((module) => (
                    <Link key={module.key} to={module.path} className={styles.creativityMenuLink}>
                      <span className={styles.creativityMenuLabel}>{module.menuLabel}</span>
                      <span className={styles.creativityMenuSummary}>{module.summary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          if (tile.path) {
            return (
              <Link
                key={tile.title}
                to={tile.path}
                className={styles.tile}
                style={{
                  backgroundColor: tile.color,
                  backgroundImage: tile.backgroundImage,
                  backgroundSize: tile.backgroundSize,
                  backgroundPosition: tile.backgroundPosition,
                  backgroundRepeat: tile.backgroundRepeat,
                }}
              >
                {tile.title}
              </Link>
            );
          }

          return (
            <div key={tile.title} className={styles.tile} style={{ backgroundColor: tile.color }}>
              {tile.title}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Home;
