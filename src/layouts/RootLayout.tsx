import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import styles from './RootLayout.module.css';
import AuthHeader from '../shared/AuthHeader';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

type Notice = {
  id: number;
  content: string;
  created_at: string;
};

function RootLayout() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState('');

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

  const addNotice = async () => {
    if (!newNotice.trim()) {
      alert('공지사항 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNotice }),
      });

      if (response.ok) {
        setNewNotice('');
        fetchNotices();
        alert('공지사항이 추가되었습니다.');
      }
    } catch (error) {
      console.error('Error adding notice:', error);
      alert('공지사항 추가에 실패했습니다.');
    }
  };

  const deleteNotice = async (id: number) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotices();
        alert('공지사항이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('공지사항 삭제에 실패했습니다.');
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
    try {
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
    } catch (error) {
      console.warn('localStorage access denied:', error);
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
          {isTeacher && (
            <button
              className={styles.settingsButton}
              onClick={() => setIsNoticeModalOpen(true)}
            >
              <img
                src="/src/assets/setting.png"
                alt="공지 관리"
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
              />
            </button>
          )}
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

      {isNoticeModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsNoticeModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>공지사항 관리</h2>
              <button onClick={() => setIsNoticeModalOpen(false)} className={styles.closeButton}>
                &times;
              </button>
            </div>
            <div className={styles.noticeInput}>
              <textarea
                placeholder="새 공지사항 입력"
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                className={styles.noticeTextarea}
              />
              <button onClick={addNotice} className={styles.addButton}>추가</button>
            </div>
            <div className={styles.noticeList}>
              {notices.map((notice) => (
                <div key={notice.id} className={styles.noticeItem}>
                  <span>{notice.content}</span>
                  <button onClick={() => deleteNotice(notice.id)} className={styles.deleteButton}>삭제</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RootLayout;
