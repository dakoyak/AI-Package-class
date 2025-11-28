const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH = './database.db';

function initializeDatabase() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');
      db.serialize(() => {
        db.run(
          `
          CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            gender TEXT NOT NULL,
            student_number TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          )
        `,
          (studentErr) => {
            if (studentErr) {
              console.error('Error creating students table:', studentErr.message);
            } else {
              db.get('SELECT COUNT(*) AS count FROM students', (countErr, row) => {
                if (countErr) {
                  console.error('Error checking student count:', countErr.message);
                  return;
                }
                if (row.count === 0) {
                  const students = [
                    { name: '김철수', gender: '남', student_number: '1-1-01', username: 'kimcs', password: 'password123' },
                    { name: '이영희', gender: '여', student_number: '1-1-02', username: 'leeyh', password: 'password123' },
                    { name: '박민준', gender: '남', student_number: '1-2-03', username: 'parkmj', password: 'password123' },
                    { name: '최지우', gender: '여', student_number: '1-2-04', username: 'choijw', password: 'password123' },
                    { name: '정현우', gender: '남', student_number: '2-1-05', username: 'junghw', password: 'password123' },
                    { name: '강수민', gender: '여', student_number: '2-1-06', username: 'kangsm', password: 'password123' },
                    { name: '조성민', gender: '남', student_number: '2-2-07', username: 'chosm', password: 'password123' },
                    { name: '윤서연', gender: '여', student_number: '2-2-08', username: 'yunsy', password: 'password123' },
                    { name: '임도윤', gender: '남', student_number: '3-1-09', username: 'limdy', password: 'password123' },
                    { name: '한예은', gender: '여', student_number: '3-1-10', username: 'hanye', password: 'password123' },
                  ];

                  const stmt = db.prepare(
                    'INSERT INTO students (name, gender, student_number, username, password) VALUES (?, ?, ?, ?, ?)',
                  );
                  students.forEach((student) => {
                    const hashedPassword = bcrypt.hashSync(student.password, 10);
                    stmt.run(student.name, student.gender, student.student_number, student.username, hashedPassword);
                  });
                  stmt.finalize(() => {
                    console.log('Dummy student data inserted.');
                  });
                }
              });
            }
          },
        );

        db.run(
          `
          CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          )
        `,
          (teacherErr) => {
            if (teacherErr) {
              console.error('Error creating teachers table:', teacherErr.message);
            } else {
              db.get('SELECT COUNT(*) AS count FROM teachers', (countErr, row) => {
                if (countErr) {
                  console.error('Error checking teacher count:', countErr.message);
                  return;
                }
                if (row.count === 0) {
                  const teachers = [
                    { name: '김선비', username: 'teacherkim', password: 'password123' },
                    { name: '이기자', username: 'teacherlee', password: 'password123' },
                    { name: '박용철', username: 'teacherpark', password: 'password123' },
                  ];

                  const stmt = db.prepare('INSERT INTO teachers (name, username, password) VALUES (?, ?, ?)');
                  teachers.forEach((teacher) => {
                    const hashedPassword = bcrypt.hashSync(teacher.password, 10);
                    stmt.run(teacher.name, teacher.username, hashedPassword);
                  });
                  stmt.finalize(() => {
                    console.log('Dummy teacher data inserted.');
                  });
                }
              });
            }
          },
        );
      });
    }
  });
  return db;
}

module.exports = initializeDatabase;

