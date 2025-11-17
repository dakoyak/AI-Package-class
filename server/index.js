// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const initializeDatabase = require('./database/init');

const app = express();
const PORT = 3001;

// Initialize database and get the db instance
const db = initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let sejongModel = null;

if (GEMINI_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    sejongModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
  }
}

const sejongPersonaPrompt = `
당신은 조선의 4대 임금 '세종대왕'입니다.
대화 상대는 10살 어린이이며, 아래 규칙을 항상 지켜야 합니다.

1. 왕의 말투(〜하노라, 〜이니라 등)를 사용합니다.
2. 설명은 쉽고 짧게, 초등학생이 이해할 수 있도록 합니다.
3. AI나 Gemini라는 표현을 쓰지 않고, 세종대왕 역할을 유지합니다.
`;

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // 1. Try to find a student
  db.get('SELECT * FROM students WHERE username = ?', [username], async (err, student) => {
    if (err) {
      console.error('Database error during login (students):', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (student) {
      // Student found, compare password
      const isMatch = await bcrypt.compare(password, student.password);
      if (isMatch) {
        const { password, ...userData } = student;
        return res.status(200).json({
          message: 'Login successful',
          user: userData,
          userType: 'student',
        });
      }
    }

    // 2. If not a student or password didn't match, try to find a teacher
    db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, teacher) => {
      if (err) {
        console.error('Database error during login (teachers):', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (teacher) {
        // Teacher found, compare password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (isMatch) {
          const { password, ...userData } = teacher;
          return res.status(200).json({
            message: 'Login successful',
            user: userData,
            userType: 'teacher',
          });
        }
      }

      // 3. If user is not in students or teachers, or password was wrong for both
      return res.status(401).json({ message: 'Invalid username or password' });
    });
  });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { role, name, username, password, gender, grade, classroom, number } = req.body;

  if (!role || !['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: '회원 유형을 선택해주세요.' });
  }

  if (!name || !username || !password) {
    return res.status(400).json({ message: '이름, 아이디, 비밀번호를 입력해주세요.' });
  }

  const checkTeacherTable = () => {
    db.get('SELECT username FROM teachers WHERE username = ?', [username], (err, teacher) => {
      if (err) {
        console.error('Database error during signup (teachers):', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (teacher) {
        return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
      }

      if (role === 'student') {
        createStudent();
      } else {
        createTeacher();
      }
    });
  };

  db.get('SELECT username FROM students WHERE username = ?', [username], (err, student) => {
    if (err) {
      console.error('Database error during signup (students):', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (student) {
      return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    checkTeacherTable();
  });

  const createStudent = () => {
    if (!gender || !grade || !classroom || !number) {
      return res.status(400).json({ message: '학생 가입 시 학년/반/번호와 성별을 입력해주세요.' });
    }

    const studentNumber = `${grade}-${classroom}-${number.toString().padStart(2, '0')}`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      'INSERT INTO students (name, gender, student_number, username, password) VALUES (?, ?, ?, ?, ?)',
      [name, gender, studentNumber, username, hashedPassword],
      function (err) {
        if (err) {
          console.error('Database error creating student:', err.message);
          return res.status(500).json({ message: '학생 정보를 저장하지 못했습니다.' });
        }

        const insertedId = this.lastID;
        db.get(
          'SELECT id, name, gender, student_number, username FROM students WHERE id = ?',
          [insertedId],
          (error, newStudent) => {
            if (error || !newStudent) {
              console.error('Database error fetching new student:', error?.message);
              return res.status(500).json({ message: '회원 정보를 가져오지 못했습니다.' });
            }

            return res.status(201).json({
              message: '회원가입이 완료되었습니다.',
              user: newStudent,
              userType: 'student',
            });
          },
        );
      },
    );
  };

  const createTeacher = () => {
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      'INSERT INTO teachers (name, username, password) VALUES (?, ?, ?)',
      [name, username, hashedPassword],
      function (err) {
        if (err) {
          console.error('Database error creating teacher:', err.message);
          return res.status(500).json({ message: '교사 정보를 저장하지 못했습니다.' });
        }

        const insertedId = this.lastID;
        db.get(
          'SELECT id, name, username FROM teachers WHERE id = ?',
          [insertedId],
          (error, newTeacher) => {
            if (error || !newTeacher) {
              console.error('Database error fetching new teacher:', error?.message);
              return res.status(500).json({ message: '회원 정보를 가져오지 못했습니다.' });
            }

            return res.status(201).json({
              message: '회원가입이 완료되었습니다.',
              user: newTeacher,
              userType: 'teacher',
            });
          },
        );
      },
    );
  };
});

app.post('/api/ask-sejong', async (req, res) => {
  if (!sejongModel) {
    return res.status(500).json({ message: 'AI 키가 설정되지 않아 세종대왕이 응답할 수 없어요.' });
  }

  const { question } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ message: '무엇이 궁금한지 먼저 말해 주세요.' });
  }

  const prompt = `${sejongPersonaPrompt}\n학생의 질문: "${question}"\n세종대왕의 답변:`;

  try {
    const result = await sejongModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return res.json({ answer: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ message: '짐이 지금 생각이 많으니라. 잠시 후 다시 물어보겠는가?' });
  }
});

// Endpoint to get student data by username (for personalized screen)
app.get('/api/student/:username', (req, res) => {
  const { username } = req.params;

  db.get('SELECT * FROM students WHERE username = ?', [username], (err, student) => {
    if (err) {
      console.error('Database error fetching student:', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const { password, ...studentData } = student; // Exclude password
    res.status(200).json(studentData);
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
