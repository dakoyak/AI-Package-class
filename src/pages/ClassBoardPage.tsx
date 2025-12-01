import { useEffect, useState } from 'react';
import styles from './ClassBoardPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

type StudentData = {
  student_number: string;
  name: string;
};

type TeacherData = {
  name: string;
  grade?: string;
  classroom?: string;
};

type LoggedInUser =
  | { type: 'student'; data: StudentData }
  | { type: 'teacher'; data: TeacherData };

type ClassPost = {
  id: number;
  title: string;
  image_url?: string;
  content?: string;
  author_name: string;
  created_at: string;
};

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

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const ClassBoardPage = () => {
  const [posts, setPosts] = useState<ClassPost[]>([]);
  const currentUser = parseStoredUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (currentUser?.type === 'student') {
        const [grade, classroom] = currentUser.data.student_number.split('-');
        params.append('grade', grade);
        params.append('classroom', classroom);
      } else if (currentUser?.type === 'teacher') {
        if (currentUser.data.grade) params.append('grade', currentUser.data.grade);
        if (currentUser.data.classroom) params.append('classroom', currentUser.data.classroom);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/class-posts?${params}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching class posts:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className={styles.boardShell}>
        <div className={styles.loginMessage}>
          <h2>로그인이 필요합니다</h2>
          <p>우리 반 게시판을 보려면 로그인을 해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.boardShell}>
      <section className={styles.boardHero}>
        <h1 className={styles.boardTitle}>우리 반 앨범</h1>
        <p className={styles.boardText}>
          우리 반의 즐거운 추억들을 모아보세요!
        </p>
      </section>

      {posts.length === 0 ? (
        <div className={styles.emptyBoard}>등록된 게시글이 없습니다.</div>
      ) : (
        <div className={styles.cardGrid}>
          {posts.map((post) => (
            <article key={post.id} className={styles.cardItem}>
              {post.image_url ? (
                <div className={styles.cardImage} style={{ backgroundImage: `url(${post.image_url})` }} />
              ) : (
                <div className={styles.cardImagePlaceholder}>📷</div>
              )}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardBody}>{post.content}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardAuthor}>{post.author_name}</span>
                  <span className={styles.cardTime}>{formatTime(post.created_at)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassBoardPage;
