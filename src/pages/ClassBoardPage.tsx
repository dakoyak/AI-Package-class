import { useMemo, useState } from 'react';
import styles from './ClassBoardPage.module.css';
import type { ActivityEntry } from '../utils/activityLog';
import { getActivityLog } from '../utils/activityLog';

type StudentData = {
  student_number: string;
  name: string;
};

type TeacherData = {
  name: string;
};

type LoggedInUser =
  | { type: 'student'; data: StudentData }
  | { type: 'teacher'; data: TeacherData };

type BoardPost = {
  id: string;
  authorName: string;
  role: LoggedInUser['type'];
  activityLabel?: string;
  message: string;
  createdAt: string;
};

const POSTS_STORAGE_KEY = 'classBoardPosts';

const parseStoredUser = (): LoggedInUser | null => {
  const raw = localStorage.getItem('loggedInUser');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === 'student' && parsed?.data?.student_number) return parsed;
    if (parsed?.type === 'teacher' && parsed?.data?.name) return parsed;
    return null;
  } catch {
    return null;
  }
};

const readPosts = (): BoardPost[] => {
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BoardPost[]) : [];
  } catch {
    return [];
  }
};

const savePosts = (posts: BoardPost[]) => {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const ClassBoardPage = () => {
  const [posts, setPosts] = useState<BoardPost[]>(() => readPosts());
  const [activityId, setActivityId] = useState('');
  const [message, setMessage] = useState('');
  const currentUser = parseStoredUser();
  const activities = useMemo<ActivityEntry[]>(() => getActivityLog().slice(0, 12), []);

  const handleSubmit = () => {
    if (!currentUser) {
      alert('로그인 후 글을 남길 수 있어요.');
      return;
    }
    if (!message.trim()) {
      alert('친구들에게 전하고 싶은 내용을 적어주세요.');
      return;
    }
    const selectedActivity = activities.find((entry) => entry.id === activityId);
    const newPost: BoardPost = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      authorName:
        currentUser.type === 'student'
          ? `${currentUser.data.student_number} ${currentUser.data.name}`
          : `${currentUser.data.name} 선생님`,
      role: currentUser.type,
      activityLabel: selectedActivity ? `${selectedActivity.category} · ${selectedActivity.label}` : undefined,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    savePosts(updated);
    setMessage('');
  };

  return (
    <div className={styles.boardShell}>
      <section className={styles.boardHero}>
        <h1 className={styles.boardTitle}>학급 게시판</h1>
        <p className={styles.boardText}>
          방금 배운 내용을 친구들에게 소개하거나 서로 응원의 말을 남겨보세요. 즐거웠던 활동을 선택하면 자동으로 태그가 붙어요.
        </p>
      </section>

      <section className={styles.formCard}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>어떤 활동을 공유할까요?</label>
          <select
            className={styles.selectField}
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
          >
            <option value="">활동을 선택하거나 건너뛰기</option>
            {activities.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.category} · {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>친구들에게 남길 말</label>
          <textarea
            className={styles.textArea}
            placeholder="오늘 배운 점이나 느낀 점을 적어보세요."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <div className={styles.submitRow}>
          <button
            className={styles.primaryButton}
            onClick={handleSubmit}
            disabled={!currentUser || !message.trim()}
          >
            게시글 올리기
          </button>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className={styles.emptyBoard}>첫 번째 글을 남겨 보세요!</div>
      ) : (
        <div className={styles.postList}>
          {posts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <span className={styles.postAuthor}>{post.authorName}</span>
                <span className={styles.postTime}>{formatTime(post.createdAt)}</span>
              </div>
              {post.activityLabel && <span className={styles.postTag}>{post.activityLabel}</span>}
              <p className={styles.postBody}>{post.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassBoardPage;
