const path = require("path");
const fs = require("fs");
try { fs.writeFileSync('server_debug.log', 'Server starting...\n'); } catch (e) { }

process.on('exit', (code) => {
  try { fs.appendFileSync('server_debug.log', `Process exited with code: ${code}\n`); } catch (e) { }
  console.log(`Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  try { fs.appendFileSync('server_debug.log', `Uncaught Exception: ${err.message}\n${err.stack}\n`); } catch (e) { }
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  try { fs.appendFileSync('server_debug.log', `Unhandled Rejection: ${reason}\n`); } catch (e) { }
  console.error('Unhandled Rejection:', reason);
});


require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const initializeDatabase = require("./database/init.cjs");
let db;
try {
  db = initializeDatabase();
  fs.appendFileSync('server_debug.log', 'Database initialized.\n');
} catch (err) {
  try { fs.appendFileSync('server_debug.log', 'Database init error: ' + err.message + '\n'); } catch (e) { }
  console.error(err);
}
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5001;

const GEMINI_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
let geminiClient = null;
let sejongModel = null;
let perspectiveModel = null;
let sejongKnowledgeBase = "";

if (GEMINI_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(GEMINI_KEY);
    sejongModel = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
    perspectiveModel = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
    console.log(`✓ Gemini client initialized with model: ${GEMINI_MODEL}`);
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error.message);
  }

  const knowledgeBasePath = path.join(__dirname, "sejong_knowledge_base.txt");
  try {
    if (fs.existsSync(knowledgeBasePath)) {
      sejongKnowledgeBase = fs.readFileSync(knowledgeBasePath, "utf-8");
      console.log("✓ Sejong knowledge base loaded");
    } else {
      console.warn(
        `⚠️  Knowledge base file not found at ${knowledgeBasePath}. Continuing without RAG.`
      );
    }
  } catch (error) {
    console.warn("⚠️  Failed to load Sejong knowledge base:", error.message);
  }
} else {
  console.warn(
    "⚠️  GEMINI_API_KEY가 설정되지 않아 세종 인터뷰 기능이 비활성화됩니다."
  );
}

// Middleware
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Challenge routes (OpenAI guardrail)
const challengeRoutes = require("./routes/challenge.cjs");
app.use("/api/challenge", challengeRoutes);

// Discussion routes (곰곰이 토론 교실)
const discussionRoutes = require("./routes/discussion.cjs");
app.use("/api/discussion", discussionRoutes);

// Sejong Historical Interview routes
const sejongRoutes = require("./routes/sejong.cjs");
app.use("/api", sejongRoutes(sejongModel, sejongKnowledgeBase));

// TTS endpoint using edge-tts
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const pythonScript = path.join(__dirname, "utils/tts.py");
    const outputFile = path.join(__dirname, `../temp_audio_${Date.now()}.mp3`);

    if (!fs.existsSync(pythonScript)) {
      console.warn("TTS script not found, using browser fallback");
      return res.status(503).json({
        error: "TTS service not available",
        message: "Using browser speech synthesis"
      });
    }

    // Run Python TTS script
    const python = spawn("python", [pythonScript, text, outputFile]);

    let errorOutput = "";

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0 && fs.existsSync(outputFile)) {
        // Read the generated audio file
        const audioBuffer = fs.readFileSync(outputFile);

        // Clean up temp file
        fs.unlinkSync(outputFile);

        // Send audio response
        res.set("Content-Type", "audio/mpeg");
        res.send(audioBuffer);
      } else {
        console.error("TTS generation failed:", errorOutput);
        // Fallback to browser TTS
        res.status(503).json({
          error: "TTS generation failed",
          message: "Using browser speech synthesis"
        });
      }
    });

    python.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      res.status(503).json({
        error: "TTS service error",
        message: "Using browser speech synthesis"
      });
    });
  } catch (error) {
    console.error("TTS endpoint error:", error);
    res.status(503).json({
      error: "TTS service error",
      message: "Using browser speech synthesis"
    });
  }
});

// Authentication routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  db.get(
    "SELECT * FROM students WHERE username = ?",
    [username],
    async (err, student) => {
      if (err) {
        console.error("Database error during login (students):", err.message);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (student) {
        const isMatch = await bcrypt.compare(password, student.password);
        if (isMatch) {
          const { password: _pw, ...userData } = student;
          return res.status(200).json({
            message: "Login successful",
            user: userData,
            userType: "student",
          });
        }
      }

      db.get(
        "SELECT * FROM teachers WHERE username = ?",
        [username],
        async (teacherErr, teacher) => {
          if (teacherErr) {
            console.error(
              "Database error during login (teachers):",
              teacherErr.message
            );
            return res.status(500).json({ message: "Internal server error" });
          }

          if (teacher) {
            const isMatch = await bcrypt.compare(password, teacher.password);
            if (isMatch) {
              const { password: _pw, ...userData } = teacher;
              return res.status(200).json({
                message: "Login successful",
                user: userData,
                userType: "teacher",
              });
            }
          }

          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }
      );
    }
  );
});

app.post("/api/signup", (req, res) => {
  const { role, name, username, password, gender, grade, classroom, number } =
    req.body;

  if (!role || !["student", "teacher"].includes(role)) {
    return res.status(400).json({ message: "회원 유형을 선택해주세요." });
  }

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ message: "이름, 아이디, 비밀번호를 입력해주세요." });
  }

  const insertStudent = () => {
    if (!gender || !grade || !classroom || !number) {
      return res
        .status(400)
        .json({ message: "학생 가입 시 학년/반/번호와 성별을 입력해주세요." });
    }

    const studentNumber = `${grade}-${classroom}-${number.toString().padStart(2, "0")}`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.get(
      "SELECT 1 FROM students WHERE student_number = ?",
      [studentNumber],
      (studentNumberErr, existingStudent) => {
        if (studentNumberErr) {
          console.error(
            "Database error checking student number:",
            studentNumberErr.message
          );
          return res.status(500).json({ message: "Internal server error" });
        }

        if (existingStudent) {
          return res
            .status(409)
            .json({ message: "이미 등록된 학생 번호입니다." });
        }

        db.run(
          "INSERT INTO students (name, gender, student_number, username, password) VALUES (?, ?, ?, ?, ?)",
          [name, gender, studentNumber, username, hashedPassword],
          function (err) {
            if (err) {
              console.error("Database error creating student:", err.message);
              return res
                .status(500)
                .json({ message: "학생 정보를 저장하지 못했습니다." });
            }

            db.get(
              "SELECT id, name, gender, student_number, username FROM students WHERE id = ?",
              [this.lastID],
              (fetchErr, newStudent) => {
                if (fetchErr || !newStudent) {
                  console.error(
                    "Database error fetching new student:",
                    fetchErr?.message
                  );
                  return res
                    .status(500)
                    .json({ message: "회원 정보를 가져오지 못했습니다." });
                }

                return res.status(201).json({
                  message: "회원가입이 완료되었습니다.",
                  user: newStudent,
                  userType: "student",
                });
              }
            );
          }
        );
      }
    );
  };

  const insertTeacher = () => {
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      "INSERT INTO teachers (name, username, password) VALUES (?, ?, ?)",
      [name, username, hashedPassword],
      function (err) {
        if (err) {
          console.error("Database error creating teacher:", err.message);
          return res
            .status(500)
            .json({ message: "교사 정보를 저장하지 못했습니다." });
        }

        db.get(
          "SELECT id, name, username FROM teachers WHERE id = ?",
          [this.lastID],
          (fetchErr, newTeacher) => {
            if (fetchErr || !newTeacher) {
              console.error(
                "Database error fetching new teacher:",
                fetchErr?.message
              );
              return res
                .status(500)
                .json({ message: "회원 정보를 가져오지 못했습니다." });
            }

            return res.status(201).json({
              message: "회원가입이 완료되었습니다.",
              user: newTeacher,
              userType: "teacher",
            });
          }
        );
      }
    );
  };

  db.get(
    "SELECT username FROM students WHERE username = ?",
    [username],
    (studentErr, student) => {
      if (studentErr) {
        console.error(
          "Database error during signup (students):",
          studentErr.message
        );
        return res.status(500).json({ message: "Internal server error" });
      }

      if (student) {
        return res
          .status(409)
          .json({ message: "이미 사용 중인 아이디입니다." });
      }

      db.get(
        "SELECT username FROM teachers WHERE username = ?",
        [username],
        (teacherErr, teacher) => {
          if (teacherErr) {
            console.error(
              "Database error during signup (teachers):",
              teacherErr.message
            );
            return res.status(500).json({ message: "Internal server error" });
          }

          if (teacher) {
            return res
              .status(409)
              .json({ message: "이미 사용 중인 아이디입니다." });
          }

          if (role === "student") {
            insertStudent();
          } else {
            insertTeacher();
          }
        }
      );
    }
  );
});

app.post("/api/perspective", async (req, res) => {
  if (!perspectiveModel) {
    return res
      .status(500)
      .json({ ok: false, message: "AI 분석 기능이 비활성화되어 있어요." });
  }

  const { situation, my_view: myView } = req.body || {};
  if (!situation || !myView) {
    return res
      .status(400)
      .json({ ok: false, message: "상황과 나의 생각을 모두 적어 주세요." });
  }

  const prompt = `
너는 초등학생 상담 교사이다. 아래 학생의 상황과 느낀점, 말한 내용을 읽고, 상대방 친구의 입장에서 상황을 분석해라.
반드시 JSON 형식으로만 응답하며, 속성은 their_view, their_emotion, inner_message, better_expression 네 가지다.
각 필드는 한국어 문장으로 1~2문장으로 작성한다.

상황:
${situation}

나의 생각/말:
${myView}

JSON:
`;

  try {
    const result = await perspectiveModel.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text().trim();
    const jsonText = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonText);

    return res.json({
      ok: true,
      their_view: parsed.their_view || "",
      their_emotion: parsed.their_emotion || "",
      inner_message: parsed.inner_message || "",
      better_expression: parsed.better_expression || "",
    });
  } catch (error) {
    console.error("Perspective API error:", error);
    return res.status(500).json({
      ok: false,
      message:
        "곰곰이가 친구의 마음을 분석하지 못했어요. 잠시 후 다시 시도해주세요.",
    });
  }
});

app.get("/api/student/:username", (req, res) => {
  const { username } = req.params;

  db.get(
    "SELECT * FROM students WHERE username = ?",
    [username],
    (err, student) => {
      if (err) {
        console.error("Database error fetching student:", err.message);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const { password, ...studentData } = student;
      res.status(200).json(studentData);
    }
  );
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Detective HQ Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    reason: "Endpoint not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    status: "error",
    reason: err.message || "서버 오류가 발생했습니다.",
  });
});

// Initialize database and start server
// Database already initialized at the top


app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(
    `✓ CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`✓ Health check available at: http://localhost:${PORT}/health`);
});

// Keep process alive
setInterval(() => {
  // console.log('Heartbeat');
}, 10000);
