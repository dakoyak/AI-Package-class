import { useEffect, useState, useCallback } from 'react';
import styles from './AuthHeader.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

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

type LoginSuccessResponse = {
    message: string;
    userType: LoggedInUser['type'];
    user: StudentData | TeacherData;
};

type LoginErrorResponse = {
    message: string;
};

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

const isStudentData = (data: unknown): data is StudentData => {
    return (
        typeof data === 'object' &&
        data !== null &&
        'student_number' in data &&
        'name' in data &&
        typeof (data as StudentData).student_number === 'string' &&
        typeof (data as StudentData).name === 'string'
    );
};

const isTeacherData = (data: unknown): data is TeacherData => {
    return typeof data === 'object' && data !== null && 'name' in data && typeof (data as TeacherData).name === 'string';
};

const isLoggedInUser = (value: unknown): value is LoggedInUser => {
    if (typeof value !== 'object' || value === null || !('type' in value) || !('data' in value)) {
        return false;
    }

    const parsed = value as { type: string; data: unknown };
    if (parsed.type === 'student') {
        return isStudentData(parsed.data);
    }

    if (parsed.type === 'teacher') {
        return isTeacherData(parsed.data);
    }

    return false;
};

const parseStudentNumber = (studentNumber: string) => {
    const [grade = '', classroom = '', number = ''] = studentNumber.split('-');
    return { grade, classroom, number };
};

const isLoginSuccessResponse = (value: LoginResponse): value is LoginSuccessResponse => {
    return (
        'userType' in value &&
        (value.userType === 'student' || value.userType === 'teacher') &&
        'user' in value
    );
};

type SignupFormState = {
    role: 'student' | 'teacher';
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    gender: '남' | '여';
    grade: string;
    classroom: string;
    number: string;
};

const initialSignupForm: SignupFormState = {
    role: 'student',
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: '남',
    grade: '',
    classroom: '',
    number: '',
};

const readStoredUser = (): LoggedInUser | null => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (!storedUser) return null;
    try {
        const parsed = JSON.parse(storedUser);
        return isLoggedInUser(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

function AuthHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signupForm, setSignupForm] = useState<SignupFormState>(initialSignupForm);
    const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(() => readStoredUser());

    useEffect(() => {
        setLoggedInUser(readStoredUser());
    }, []);

    const resetSignupForm = () => setSignupForm(initialSignupForm);

    const openModal = () => {
        setAuthMode('login');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setAuthMode('login');
        resetSignupForm();
    };

    const persistUser = useCallback((payload: LoginResponse) => {
        if (!isLoginSuccessResponse(payload)) {
            throw new Error('서버 응답 형식이 올바르지 않습니다.');
        }

        let userPayload: LoggedInUser | null = null;
        if (payload.userType === 'student' && isStudentData(payload.user)) {
            userPayload = { type: 'student', data: payload.user };
        } else if (payload.userType === 'teacher' && isTeacherData(payload.user)) {
            userPayload = { type: 'teacher', data: payload.user };
        }

        if (!userPayload) {
            throw new Error('서버 응답에 사용자 정보가 없습니다.');
        }

        setLoggedInUser(userPayload);
        localStorage.setItem('loggedInUser', JSON.stringify(userPayload));
        setUsername('');
        setPassword('');
        resetSignupForm();
        closeModal();
        alert(payload.message);
    }, []);

    const postJson = useCallback(async (url: string, body: Record<string, string>) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data: LoginResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        return data;
    }, []);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }
        try {
            const response = await postJson(`${API_BASE_URL}/api/login`, { username, password });
            persistUser(response);
        } catch (error) {
            console.error('Login error:', error);
            alert(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
        }
    };

    const handleSignup = async () => {
        const { role, name, username: signupUsername, password: signupPassword, confirmPassword, gender, grade, classroom, number } = signupForm;

        if (signupPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!name || !signupUsername || !signupPassword) {
            alert('필수 정보를 모두 입력해주세요.');
            return;
        }

        if (role === 'student' && (!gender || !grade || !classroom || !number)) {
            alert('학생 가입 시 학년/반/번호와 성별을 입력해주세요.');
            return;
        }

        const payload: Record<string, string> = {
            role,
            name,
            username: signupUsername,
            password: signupPassword,
        };

        if (role === 'student') {
            payload.gender = gender;
            payload.grade = grade;
            payload.classroom = classroom;
            payload.number = number;
        }

        try {
            const response = await postJson(`${API_BASE_URL}/api/signup`, payload);
            persistUser(response);
        } catch (error) {
            console.error('Signup error:', error);
            alert(error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.');
        }
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        localStorage.removeItem('loggedInUser');
        alert('로그아웃되었습니다.');
    };

    const renderLoggedInUI = useCallback(() => {
        if (!loggedInUser) {
            return null;
        }

        if (loggedInUser.type === 'student') {
            const { student_number, name } = loggedInUser.data;
            const { grade, classroom, number } = parseStudentNumber(student_number);

            return (
                <div className={styles.loggedInInfo}>
                    <span>{grade}학년</span>
                    <span>{classroom}반</span>
                    <span>{number}번</span>
                    <span>{name}</span>
                    <button onClick={handleLogout} className={styles.logoutButton} aria-label="로그아웃">
                        &times;
                    </button>
                </div>
            );
        }

        if (loggedInUser.type === 'teacher') {
            const { name } = loggedInUser.data;
            return (
                <div className={styles.loggedInInfo}>
                    <span>{name} 선생님</span>
                    <button onClick={handleLogout} className={styles.logoutButton} aria-label="로그아웃">
                        &times;
                    </button>
                </div>
            );
        }

        return null;
    }, [loggedInUser]);

    const renderLoginFields = () => (
        <>
            <input
                type="text"
                placeholder="아이디"
                className={styles.modalInput}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />
            <input
                type="password"
                placeholder="비밀번호"
                className={styles.modalInput}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
        </>
    );

    const renderSignupFields = () => (
        <>
            <select
                className={styles.modalInput}
                value={signupForm.role}
                onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, role: event.target.value as SignupFormState['role'] }))
                }
            >
                <option value="student">학생</option>
                <option value="teacher">교사</option>
            </select>

            <input
                type="text"
                placeholder="이름"
                className={styles.modalInput}
                value={signupForm.name}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
            />

            {signupForm.role === 'student' && (
                <>
                    <select
                        className={styles.modalInput}
                        value={signupForm.gender}
                        onChange={(event) =>
                            setSignupForm((prev) => ({ ...prev, gender: event.target.value as '남' | '여' }))
                        }
                    >
                        <option value="남">남학생</option>
                        <option value="여">여학생</option>
                    </select>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="학년"
                            className={styles.modalInput}
                            value={signupForm.grade}
                            onChange={(event) => setSignupForm((prev) => ({ ...prev, grade: event.target.value }))}
                        />
                        <input
                            type="text"
                            placeholder="반"
                            className={styles.modalInput}
                            value={signupForm.classroom}
                            onChange={(event) =>
                                setSignupForm((prev) => ({ ...prev, classroom: event.target.value }))
                            }
                        />
                        <input
                            type="text"
                            placeholder="번호"
                            className={styles.modalInput}
                            value={signupForm.number}
                            onChange={(event) => setSignupForm((prev) => ({ ...prev, number: event.target.value }))}
                        />
                    </div>
                </>
            )}

            <input
                type="text"
                placeholder="아이디"
                className={styles.modalInput}
                value={signupForm.username}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, username: event.target.value }))}
            />
            <input
                type="password"
                placeholder="비밀번호"
                className={styles.modalInput}
                value={signupForm.password}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <input
                type="password"
                placeholder="비밀번호 확인"
                className={styles.modalInput}
                value={signupForm.confirmPassword}
                onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
            />
        </>
    );

    return (
        <>
            <div className={styles.authContainer}>
                {loggedInUser ? (
                    renderLoggedInUI()
                ) : (
                    <button onClick={openModal} className={styles.loginButton}>
                        로그인
                    </button>
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalBackdrop} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{authMode === 'login' ? 'AI 창의력 수업' : '회원가입'}</h2>
                            <button onClick={closeModal} className={styles.closeButton}>
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {authMode === 'login' ? renderLoginFields() : renderSignupFields()}
                        </div>
                        <div className={styles.modalActions}>
                            {authMode === 'login' ? (
                                <>
                                    <button onClick={handleLogin} className={styles.modalButton}>
                                        로그인
                                    </button>
                                    <button
                                        className={`${styles.modalButton} ${styles.signupButton}`}
                                        onClick={() => {
                                            setAuthMode('signup');
                                            resetSignupForm();
                                        }}
                                    >
                                        회원가입
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleSignup} className={styles.modalButton}>
                                        가입하기
                                    </button>
                                    <button
                                        className={`${styles.modalButton} ${styles.signupButton}`}
                                        onClick={() => {
                                            setAuthMode('login');
                                            resetSignupForm();
                                        }}
                                    >
                                        뒤로가기
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AuthHeader;
