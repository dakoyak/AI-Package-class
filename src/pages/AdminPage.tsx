import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

// --- Types ---
type Student = {
  id: number;
  name: string;
  gender: 'male' | 'female';
  student_number: string;
  username: string;
};

type Notice = {
  id: number;
  content: string;
  created_at: string;
};

type ClassPost = {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  author_name: string;
  created_at: string;
};

type TeacherUser = {
  type: 'teacher';
  data: {
    name: string;
    grade: string;
    classroom: string;
  };
};

// --- Sub-components ---

const StudentManager = ({ teacher }: { teacher: TeacherUser['data'] }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    number: '',
    username: '',
    password: '',
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/students?grade=${teacher.grade}&classroom=${teacher.classroom}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grade: teacher.grade,
          classroom: teacher.classroom,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', gender: 'male', number: '', username: '', password: '' });
        fetchStudents();
      } else {
        alert('학생 등록 실패');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>학생 관리 ({teacher.grade}학년 {teacher.classroom}반)</h3>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ 학생 등록</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>성별</th>
            <th>아이디</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.student_number.split('-')[2]}번</td>
              <td>{student.name}</td>
              <td>{student.gender === 'male' ? '남' : '여'}</td>
              <td>{student.username}</td>
              <td>
                <button className={styles.deleteButton} onClick={() => handleDelete(student.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>학생 등록</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>이름</label>
                <input
                  className={styles.formInput}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>번호</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>성별</label>
                <select
                  className={styles.formSelect}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="male">남</option>
                  <option value="female">여</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>아이디</label>
                <input
                  className={styles.formInput}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>비밀번호</label>
                <input
                  className={styles.formInput}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className={styles.submitButton}>등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NoticeManager = ({ teacher }: { teacher: TeacherUser['data'] }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [content, setContent] = useState('');

  const fetchNotices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notices`);
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, created_by: teacher.name }),
      });
      if (res.ok) {
        setContent('');
        fetchNotices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/notices/${id}`, { method: 'DELETE' });
      fetchNotices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>공지사항 관리</h3>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div className={styles.formGroup}>
          <textarea
            className={styles.formTextarea}
            placeholder="새로운 공지사항을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>공지사항 등록</button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>내용</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => (
            <tr key={notice.id}>
              <td>{notice.content}</td>
              <td>{new Date(notice.created_at).toLocaleDateString()}</td>
              <td>
                <button className={styles.deleteButton} onClick={() => handleDelete(notice.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AlbumManager = ({ teacher }: { teacher: TeacherUser['data'] }) => {
  const [posts, setPosts] = useState<ClassPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/class-posts?grade=${teacher.grade}&classroom=${teacher.classroom}`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('author_id', '0');
    data.append('author_name', teacher.name);
    data.append('author_type', 'teacher');
    data.append('grade', teacher.grade);
    data.append('classroom', teacher.classroom);
    if (file) {
      data.append('image', file);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/class-posts`, {
        method: 'POST',
        body: data, // Send FormData
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', content: '' });
        setFile(null);
        fetchPosts();
      } else {
        alert('업로드 실패');
      }
    } catch (err) {
      console.error(err);
      alert('업로드 중 오류 발생');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/class-posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>우리 반 앨범 관리</h3>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ 사진 등록</button>
      </div>

      <div className={styles.grid}>
        {posts.map((post) => (
          <div key={post.id} className={styles.card}>
            <button className={styles.cardDelete} onClick={() => handleDelete(post.id)}>×</button>
            {post.image_url ? (
              <div className={styles.cardImage} style={{ backgroundImage: `url(${API_BASE_URL}${post.image_url})` }} />
            ) : (
              <div className={styles.cardImage} style={{ backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
            )}
            <div className={styles.cardBody}>
              <h4 className={styles.cardTitle}>{post.title}</h4>
              <p className={styles.cardText}>{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>사진 등록</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>제목</label>
                <input
                  className={styles.formInput}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>사진 파일</label>
                <input
                  type="file"
                  className={styles.formInput}
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>내용</label>
                <textarea
                  className={styles.formTextarea}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className={styles.submitButton}>등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page ---

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'notices' | 'album'>('students');
  const [teacher, setTeacher] = useState<TeacherUser['data'] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loggedInUser');
      if (!raw) {
        alert('로그인이 필요합니다.');
        navigate('/');
        return;
      }
      try {
        const user = JSON.parse(raw);
        if (user.type !== 'teacher') {
          alert('선생님만 접근할 수 있습니다.');
          navigate('/');
          return;
        }
        setTeacher(user.data);
      } catch {
        navigate('/');
      }
    } catch (error) {
      console.warn('localStorage access denied:', error);
      navigate('/');
    }
  }, [navigate]);

  if (!teacher) return null;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.adminTitle}>공지사항</h1>
          <span className={styles.adminSubtitle}>| 관리자 페이지</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.addModuleButton}
            onClick={() => alert("추후 업데이트 예정")}
          >
            + 수업모듈 추가
          </button>
          <span>{teacher.name} 선생님</span>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <nav className={styles.sidebar}>
          <button
            className={`${styles.navButton} ${activeTab === 'students' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('students')}
          >
            우리반 관리
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'notices' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            공지사항
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'album' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('album')}
          >
            우리반 앨범
          </button>
        </nav>

        <main className={styles.contentArea}>
          {activeTab === 'students' && <StudentManager teacher={teacher} />}
          {activeTab === 'notices' && <NoticeManager teacher={teacher} />}
          {activeTab === 'album' && <AlbumManager teacher={teacher} />}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
