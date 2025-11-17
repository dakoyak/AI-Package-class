import { creativityModules } from './modules';
import styles from './CreativityLanding.module.css';

function CreativityLanding() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.kicker}>모듈 선택 안내</p>
      <h3 className={styles.title}>상단 버튼에서 체험을 골라 주세요</h3>
      <p className={styles.desc}>
        창의력 버튼에 마우스를 올리고 원하는 실험실을 클릭하거나, 위 카드 버튼을 눌러
        각각의 모듈을 단독 화면으로 열 수 있습니다.
      </p>

      <ul className={styles.list}>
        {creativityModules.map((module) => (
          <li key={module.key}>
            <strong>{module.label}</strong>
            <span>{module.summary}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CreativityLanding;
