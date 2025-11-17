// server/database/init.js
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
        // Create students table
        db.run(`
          CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            gender TEXT NOT NULL,
            student_number TEXT NOT NULL UNIQUE, -- e.g., "1-3-05" (grade-class-number)
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('Error creating students table:', err.message);
          } else {
            console.log('Students table created or already exists.');
            // Insert dummy student data if table is empty
            db.get('SELECT COUNT(*) AS count FROM students', (err, row) => {
              if (err) {
                console.error('Error checking student count:', err.message);
                return;
              }
              if (row.count === 0) {
                console.log('Inserting dummy student data...');
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

                const stmt = db.prepare('INSERT INTO students (name, gender, student_number, username, password) VALUES (?, ?, ?, ?, ?)');
                students.forEach(student => {
                  const hashedPassword = bcrypt.hashSync(student.password, 10); // Hash password
                  stmt.run(student.name, student.gender, student.student_number, student.username, hashedPassword);
                });
                stmt.finalize(() => {
                  console.log('Dummy student data inserted.');
                });
              } else {
                console.log('Students table already contains data. Skipping dummy data insertion.');
              }
            });
          }
        });

        // Create teachers table
        db.run(`
          CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('Error creating teachers table:', err.message);
          } else {
            console.log('Teachers table created or already exists.');
            // Insert dummy teacher data if table is empty
            db.get('SELECT COUNT(*) AS count FROM teachers', (err, row) => {
              if (err) {
                console.error('Error checking teacher count:', err.message);
                return;
              }
              if (row.count === 0) {
                console.log('Inserting dummy teacher data...');
                const teachers = [
                  { name: '김선비', username: 'teacherkim', password: 'password123' },
                  { name: '이기자', username: 'teacherlee', password: 'password123' },
                  { name: '박용철', username: 'teacherpark', password: 'password123' },
                ];

                const stmt = db.prepare('INSERT INTO teachers (name, username, password) VALUES (?, ?, ?)');
                teachers.forEach(teacher => {
                  const hashedPassword = bcrypt.hashSync(teacher.password, 10); // Hash password
                  stmt.run(teacher.name, teacher.username, hashedPassword);
                });
                stmt.finalize(() => {
                  console.log('Dummy teacher data inserted.');
                });
              } else {
                console.log('Teachers table already contains data. Skipping dummy data insertion.');
              }
            });
          }
        });
      });
    }
  });
  return db;
}

module.exports = initializeDatabase;
