import { NavLink, Outlet } from 'react-router-dom';
import { creativityModules } from '../features/creativity/modules';
import styles from './CreativityStudio.module.css';

function CreativityStudio() {
  return (
    <div className={styles.wrapper}>


      <div className={styles.moduleNav}>
        {creativityModules.map((module) => (
          <NavLink
            key={module.key}
            to={module.slug}
            className={({ isActive }) =>
              isActive ? `${styles.moduleLink} ${styles.moduleActive}` : styles.moduleLink
            }
          >
            <span className={styles.moduleLabel}>{module.label}</span>
            <span className={styles.moduleSummary}>{module.summary}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.moduleArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default CreativityStudio;
