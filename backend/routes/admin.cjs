const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = (db) => {
  // ... (existing routes) ...

  // 공지사항 목록 조회
  router.get('/notices', (req, res) => {
    db.all('SELECT * FROM notices ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        console.error('Error fetching notices:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // 공지사항 추가
  router.post('/notices', (req, res) => {
    const { content, created_by } = req.body;

    if (!content) {
      return res.status(400).json({ message: '공지사항 내용을 입력해주세요.' });
    }

    db.run(
      'INSERT INTO notices (content, created_by) VALUES (?, ?)',
      [content, created_by || null],
      function (err) {
        if (err) {
          console.error('Error creating notice:', err.message);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ id: this.lastID, content, message: '공지사항이 추가되었습니다.' });
      }
    );
  });

  // 공지사항 삭제
  router.delete('/notices/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM notices WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting notice:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ message: '공지사항이 삭제되었습니다.' });
    });
  });

  // 학생 목록 조회 (반별)
  router.get('/students', (req, res) => {
    const { grade, classroom } = req.query;

    let query = 'SELECT id, name, gender, student_number, username FROM students';
    const params = [];

    if (grade && classroom) {
      query += ' WHERE student_number LIKE ?';
      params.push(`${grade}-${classroom}-%`);
    }

    query += ' ORDER BY student_number';

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching students:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // 학생 추가
  router.post('/students', (req, res) => {
    const { name, gender, grade, classroom, number, username, password } = req.body;

    if (!name || !gender || !grade || !classroom || !number || !username || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    const studentNumber = `${grade}-${classroom}-${number.toString().padStart(2, '0')}`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      'INSERT INTO students (name, gender, student_number, username, password) VALUES (?, ?, ?, ?, ?)',
      [name, gender, studentNumber, username, hashedPassword],
      function (err) {
        if (err) {
          console.error('Error creating student:', err.message);
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ message: '이미 등록된 학생 번호 또는 아이디입니다.' });
          }
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({
          id: this.lastID,
          name,
          gender,
          student_number: studentNumber,
          username,
          message: '학생이 등록되었습니다.',
        });
      }
    );
  });

  // 학생 삭제
  router.delete('/students/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting student:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ message: '학생이 삭제되었습니다.' });
    });
  });

  // 교사 게시판 목록 조회
  router.get('/teacher-posts', (req, res) => {
    db.all(
      'SELECT * FROM teacher_posts ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching teacher posts:', err.message);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(rows);
      }
    );
  });

  // 교사 게시판 글 작성
  router.post('/teacher-posts', (req, res) => {
    const { title, content, author_id, author_name } = req.body;

    if (!title || !content || !author_id || !author_name) {
      return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    db.run(
      'INSERT INTO teacher_posts (title, content, author_id, author_name) VALUES (?, ?, ?, ?)',
      [title, content, author_id, author_name],
      function (err) {
        if (err) {
          console.error('Error creating teacher post:', err.message);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({
          id: this.lastID,
          title,
          content,
          author_name,
          message: '게시글이 작성되었습니다.',
        });
      }
    );
  });

  // 교사 게시판 글 삭제
  router.delete('/teacher-posts/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM teacher_posts WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting teacher post:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ message: '게시글이 삭제되었습니다.' });
    });
  });

  // 학급 게시판 목록 조회
  router.get('/class-posts', (req, res) => {
    const { grade, classroom } = req.query;

    let query = 'SELECT * FROM class_posts';
    const params = [];

    if (grade && classroom) {
      query += ' WHERE grade = ? AND classroom = ?';
      params.push(grade, classroom);
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching class posts:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // 학급 게시판 글 작성 (파일 업로드 포함)
  router.post('/class-posts', upload.single('image'), (req, res) => {
    const { title, content, author_id, author_name, author_type, grade, classroom } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image_url = req.body.image_url;
    }

    if (!title || !author_id || !author_name) {
      return res.status(400).json({ message: '필수 정보를 입력해주세요.' });
    }

    db.run(
      'INSERT INTO class_posts (title, image_url, content, author_id, author_name, author_type, grade, classroom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, image_url, content || null, author_id, author_name, author_type, grade || null, classroom || null],
      function (err) {
        if (err) {
          console.error('Error creating class post:', err.message);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({
          id: this.lastID,
          title,
          image_url,
          message: '게시글이 작성되었습니다.',
        });
      }
    );
  });

  // 학급 게시판 글 삭제
  router.delete('/class-posts/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM class_posts WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting class post:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ message: '게시글이 삭제되었습니다.' });
    });
  });

  return router;
};

module.exports = module.exports;
