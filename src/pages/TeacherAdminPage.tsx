import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import styles from './TeacherAdminPage.module.css';
import AuthHeader from '../shared/AuthHeader';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

type LoggedInTeacher = {
  id: number;
  name: string;
  username: string;
  grade?: string;
  classroom?: string;
};

type Notice = {
  id: number;
  content: string;
  created_at: string;
};

type Student = {
  id: number;
  name: string;
  gender: string;
  student_number: string;
  username: string;
};

type TeacherPost = {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
};

type Tab = 'class-management' | 'lesson-create' | 'class-board' | 'teacher-board';

function TeacherAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('class-management');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [newNotice, setNewNotice] = useState('');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherPosts, setTeacherPosts] = useState<TeacherPost[]>([]);
  const [loggedInTeacher, setLoggedInTeacher] = useState<LoggedInTeacher | null>(null);

  // 학생 등록 폼
  const [studentForm, setStudentForm] = useState({
    name: '',
    gender: '남',
    grade: '',
    classroom: '',
    number: '',
    username: '',
    password: '',
  });

  // 교사 게시판 글 작성 폼
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
  });

  // 학급 게시판 상태
  type ClassPost = {
    id: number;
    title: string;
    image_url?: string;
    content?: string;
    author_name: string;
    created_at: string;
  };

  const [classPosts, setClassPosts] = useState<ClassPost[]>([]);
  const [classPostForm, setClassPostForm] = useState({
    title: '',
    image_url: '',
    content: '',
  });

  const checkLoginStatus = () => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.type === 'teacher') {
          setLoggedInTeacher(parsed.data);
        } else {
          setLoggedInTeacher(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoggedInTeacher(null);
      }
    } else {
      setLoggedInTeacher(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('auth-change', checkLoginStatus);
    return () => window.removeEventListener('auth-change', checkLoginStatus);
  }, []);

  useEffect(() => {
    fetchNotices();
    fetchStudents();
    fetchTeacherPosts();
  }, []);

  useEffect(() => {
    if (loggedInTeacher) {
      fetchClassPosts();
    }
  }, [loggedInTeacher]);

  const fetchClassPosts = async () => {
    if (!loggedInTeacher) return;
    try {
      const params = new URLSearchParams();
      if (loggedInTeacher.grade) params.append('grade', loggedInTeacher.grade);
      if (loggedInTeacher.classroom) params.append('classroom', loggedInTeacher.classroom);

      const response = await fetch(`${API_BASE_URL}/api/admin/class-posts?${params}`);
      const data = await response.json();
      setClassPosts(data);
    } catch (error) {
      console.error('Error fetching class posts:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setClassPostForm({ ...classPostForm, image_url: data.url });
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const addClassPost = async () => {
    const { title, image_url, content } = classPostForm;

    if (!title || !content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!loggedInTeacher) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/class-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          image_url,
          content,
          author_id: loggedInTeacher.id,
          author_name: loggedInTeacher.name,
          author_type: 'teacher',
          grade: loggedInTeacher.grade,
          classroom: loggedInTeacher.classroom,
        }),
      });

      if (response.ok) {
        setClassPostForm({ title: '', image_url: '', content: '' });
        fetchClassPosts();
        alert('게시글이 등록되었습니다.');
      }
    } catch (error) {
      console.error('Error adding class post:', error);
      alert('게시글 등록에 실패했습니다.');
    }
  };

  const deleteClassPost = async (id: number) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/class-posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClassPosts();
        alert('게시글이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Error deleting class post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

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
        body: JSON.stringify({
          content: newNotice,
          created_by: loggedInTeacher?.id,
        }),
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

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (loggedInTeacher?.grade) params.append('grade', loggedInTeacher.grade);
      if (loggedInTeacher?.classroom) params.append('classroom', loggedInTeacher.classroom);

      const response = await fetch(`${API_BASE_URL}/api/admin/students?${params}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const addStudent = async () => {
    const { name, grade, classroom, number, username, password } = studentForm;

    if (!name || !grade || !classroom || !number || !username || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });

      const data = await response.json();

      if (response.ok) {
        setStudentForm({
          name: '',
          gender: '남',
          grade: '',
          classroom: '',
          number: '',
          username: '',
          password: '',
        });
        fetchStudents();
        alert('학생이 등록되었습니다.');
      } else {
        alert(data.message || '학생 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('학생 등록에 실패했습니다.');
    }
  };

  const deleteStudent = async (id: number) => {
    if (!confirm('이 학생을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStudents();
        alert('학생이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('학생 삭제에 실패했습니다.');
    }
  };

  const fetchTeacherPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teacher-posts`);
      const data = await response.json();
      setTeacherPosts(data);
    } catch (error) {
      console.error('Error fetching teacher posts:', error);
    }
  };

  const addTeacherPost = async () => {
    const { title, content } = postForm;

    if (!title || !content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!loggedInTeacher) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teacher-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          author_id: loggedInTeacher.id,
          author_name: loggedInTeacher.name,
        }),
      });

      if (response.ok) {
        setPostForm({ title: '', content: '' });
        fetchTeacherPosts();
        alert('게시글이 작성되었습니다.');
      }
    } catch (error) {
      console.error('Error adding teacher post:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  const deleteTeacherPost = async (id: number) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teacher-posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTeacherPosts();
        alert('게시글이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Error deleting teacher post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'class-management':
        return (
          <div className={styles.tabContent}>
            <h2>우리반 관리</h2>

            <div className={styles.studentForm}>
              <h3>학생 등록</h3>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  placeholder="이름"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                />
                <select
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                >
                  <option value="남">남학생</option>
                  <option value="여">여학생</option>
                </select>
                <input
                  type="text"
                  placeholder="학년"
                  value={studentForm.grade}
                  onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="반"
                  value={studentForm.classroom}
                  onChange={(e) => setStudentForm({ ...studentForm, classroom: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="번호"
                  value={studentForm.number}
                  onChange={(e) => setStudentForm({ ...studentForm, number: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="아이디"
                  value={studentForm.username}
                  onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                />
                <button onClick={addStudent} className={styles.addButton}>
                  학생 등록
                </button>
              </div>
            </div>

            <div className={styles.studentList}>
              <h3>학생 목록</h3>
              <table>
                <thead>
                  <tr>
                    <th>학번</th>
                    <th>이름</th>
                    <th>성별</th>
                    <th>아이디</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.student_number}</td>
                      <td>{student.name}</td>
                      <td>{student.gender}</td>
                      <td>{student.username}</td>
                      <td>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className={styles.deleteButton}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'lesson-create':
        return (
          <div className={styles.tabContent}>
            <h2>수업 만들기</h2>
            <p className={styles.comingSoon}>기능 준비중...</p>
          </div>
        );

      case 'class-board':
        return (
          <div className={styles.tabContent}>
            <h2>우리반 게시판</h2>

            <div className={styles.postForm}>
              <h3>게시글 작성</h3>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  placeholder="제목"
                  value={classPostForm.title}
                  onChange={(e) => setClassPostForm({ ...classPostForm, title: e.target.value })}
                  className={styles.fullWidthInput}
                />
                <div className={styles.fileInputWrapper}>
                  <label className={styles.fileInputLabel}>
                    이미지 첨부
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.hiddenFileInput}
                    />
                  </label>
                  {classPostForm.image_url && <span className={styles.fileName}>이미지 업로드 완료</span>}
                </div>
                <textarea
                  placeholder="내용"
                  value={classPostForm.content}
                  onChange={(e) => setClassPostForm({ ...classPostForm, content: e.target.value })}
                  className={styles.contentTextarea}
                />
                <button onClick={addClassPost} className={styles.addButton}>
                  게시글 등록
                </button>
              </div>
            </div>

            <div className={styles.cardGrid}>
              {classPosts.map((post) => (
                <div key={post.id} className={styles.cardItem}>
                  {post.image_url ? (
                    <div className={styles.cardImage} style={{ backgroundImage: `url(${post.image_url})` }} />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>📷</div>
                  )}
                  <div className={styles.cardContent}>
                    <h4 className={styles.cardTitle}>{post.title}</h4>
                    <p className={styles.cardBody}>{post.content}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardAuthor}>{post.author_name}</span>
                      <span className={styles.cardTime}>{new Date(post.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => deleteClassPost(post.id)}
                        className={styles.deleteButton}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'teacher-board':
        return (
          <div className={styles.tabContent}>
            <h2>교사 게시판</h2>

            <div className={styles.postForm}>
              <h3>글 작성</h3>
              <input
                type="text"
                placeholder="제목"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                className={styles.titleInput}
              />
              <textarea
                placeholder="내용"
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                className={styles.contentTextarea}
              />
              <button onClick={addTeacherPost} className={styles.addButton}>
                게시글 작성
              </button>
            </div>

            <div className={styles.postList}>
              {teacherPosts.map((post) => (
                <div key={post.id} className={styles.postCard}>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <div className={styles.postMeta}>
                    <span>{post.author_name}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => deleteTeacherPost(post.id)}
                      className={styles.deleteButton}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  useEffect(() => {
    if (notices.length === 0) return;

    const interval = setInterval(() => {
      setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [notices]);

  return (
    <div className={`${styles.adminPage} ${styles['transparent-app']}`}>
      <header className={styles.header}>
        <Link to={ROUTES.home} className={styles.homeLink}>
          <div className={styles.homeButton}>
            <img src="/src/assets/eraser.png" alt="홈으로" />
          </div>
        </Link>
        <div className={styles.noticeBar}>
          <div className={styles.noticeContent} key={currentNoticeIndex}>
            <p className={styles.noticeText}>
              {notices.length > 0 ? notices[currentNoticeIndex].content : "등록된 공지사항이 없습니다."}
            </p>
          </div>
          <button
            className={styles.settingsButton}
            onClick={() => {
              console.log('Settings button clicked');
              setIsNoticeModalOpen(true);
            }}
          >
            <img
              src="/src/assets/setting.png"
              alt="설정"
              style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            />
          </button>
        </div>
        <AuthHeader />
      </header>

      <div className={styles.mainContent}>
        <aside className={styles.sidebar}>
          <button
            className={`${styles.tabButton} ${activeTab === 'class-management' ? styles.active : ''}`}
            onClick={() => setActiveTab('class-management')}
          >
            우리반 관리
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'lesson-create' ? styles.active : ''}`}
            onClick={() => setActiveTab('lesson-create')}
          >
            수업 만들기
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'class-board' ? styles.active : ''}`}
            onClick={() => setActiveTab('class-board')}
          >
            우리반 게시판
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'teacher-board' ? styles.active : ''}`}
            onClick={() => setActiveTab('teacher-board')}
          >
            교사 게시판
          </button>
        </aside>

        <main className={styles.content}>{renderTabContent()}</main>
      </div>

      {isNoticeModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsNoticeModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>공지사항 관리</h2>
            <div className={styles.noticeInput}>
              <textarea
                placeholder="새 공지사항 입력"
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
              />
              <button onClick={addNotice}>추가</button>
            </div>
            <div className={styles.noticeList}>
              {notices.map((notice) => (
                <div key={notice.id} className={styles.noticeItem}>
                  <span>{notice.content}</span>
                  <button onClick={() => deleteNotice(notice.id)}>삭제</button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsNoticeModalOpen(false)} className={styles.closeButton}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAdminPage;
