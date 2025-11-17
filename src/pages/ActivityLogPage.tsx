import { useMemo, useState } from 'react';
import type { ActivityEntry } from '../utils/activityLog';
import { getActivityLog, clearActivityLog } from '../utils/activityLog';
import styles from './ActivityLogPage.module.css';

const groupEntries = (entries: ActivityEntry[]) => {
  return entries.reduce<Record<string, ActivityEntry[]>>((acc, entry) => {
    const bucket = acc[entry.category] ?? [];
    bucket.push(entry);
    acc[entry.category] = bucket;
    return acc;
  }, {});
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('ko-KR', options);
};

export const ActivityLogPage = () => {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => getActivityLog());

  const grouped = useMemo(() => groupEntries(entries), [entries]);
  const categories = Object.keys(grouped);

  const handleClear = () => {
    if (window.confirm('모든 활동 기록을 지울까요?')) {
      clearActivityLog();
      setEntries([]);
    }
  };

  const handleRefresh = () => {
    setEntries(getActivityLog());
  };

  return (
    <div className={styles.pageShell}>
      <section className={styles.heroCard}>
        <h1 className={styles.heroTitle}>나의 활동 기록</h1>
        <p className={styles.heroText}>
          창의력 실험실과 몰입형 체험에서 놀았던 순간들이 모두 이곳에 모여요. 뒤로 돌아보며 다음 수업을 계획해 보세요.
        </p>
      </section>

      <div className={styles.actionsRow}>
        <button className={styles.ghostButton} onClick={handleRefresh}>
          새로고침
        </button>
        <button className={styles.ghostButton} onClick={handleClear} style={{ marginLeft: '0.5rem' }}>
          전체 삭제
        </button>
      </div>

      {entries.length === 0 ? (
        <div className={styles.emptyCard}>아직 저장된 활동이 없어요. 원하는 모듈을 체험해 보세요!</div>
      ) : (
        <div className={styles.groupGrid}>
          {categories.map((category) => (
            <div key={category} className={styles.groupCard}>
              <p className={styles.groupTitle}>{category}</p>
              {grouped[category].map((entry) => (
                <article key={entry.id} className={styles.entryItem}>
                  <p className={styles.entryTitle}>{entry.label}</p>
                  <p className={styles.entryDetail}>{entry.detail}</p>
                  <p className={styles.entryTime}>{formatTime(entry.timestamp)}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;
