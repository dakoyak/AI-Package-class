const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const SimpleVectorDB = require("../utils/simpleVectorDB");
const { OpenAI } = require("openai");

// Sejong persona prompt
const sejongPersonaPrompt = `
당신은 조선의 4대 임금 '세종대왕'입니다.
대화 상대는 10살 어린이이며, 아래 규칙을 항상 지켜야 합니다.

1. 왕의 말투(〜하노라, 〜이니라 등)를 사용합니다.
2. 설명은 쉽고 짧게, 초등학생이 이해할 수 있도록 합니다.
3. AI나 Gemini라는 표현을 쓰지 않고, 세종대왕 역할을 유지합니다.
4. 주어진 '참고 자료'가 있다면, 그 내용을 바탕으로 답변해야 합니다. 자료에 없는 내용은 상상해서 말하지 마시오.
`;

// Initialize Vector DB and OpenAI
const VECTOR_DB_PATH = path.resolve(__dirname, "../vector_db");
const KNOWLEDGE_BASE_PATH = path.resolve(__dirname, "../sejong_knowledge_base.txt");

let db = null;
let openai = null;
let fallbackKnowledgeBase = "";

// Initialize Vector DB
async function initializeVectorDB() {
  try {
    db = new SimpleVectorDB();
    await db.createIndex(VECTOR_DB_PATH);
    
    // Check if index is empty
    if (db.items.length === 0) {
      console.warn("⚠️  Vector DB index is empty. Run 'node scripts/build_vdb.cjs' to build it.");
      console.log("📄 Loading fallback knowledge base from text file...");
      loadFallbackKnowledgeBase();
    } else {
      console.log(`✅ Vector DB loaded with ${db.items.length} items`);
    }
  } catch (error) {
    console.error("❌ Failed to initialize Vector DB:", error);
    console.log("📄 Loading fallback knowledge base from text file...");
    loadFallbackKnowledgeBase();
  }
}

// Load fallback knowledge base
function loadFallbackKnowledgeBase() {
  try {
    if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
      fallbackKnowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, "utf-8");
      console.log("✅ Fallback knowledge base loaded");
    } else {
      console.warn("⚠️  Knowledge base file not found at", KNOWLEDGE_BASE_PATH);
    }
  } catch (error) {
    console.error("❌ Failed to load fallback knowledge base:", error);
  }
}

// Initialize OpenAI
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("✅ OpenAI client initialized");
} else {
  console.warn("⚠️  OPENAI_API_KEY not set. Vector search will be disabled.");
}

// Initialize on module load
initializeVectorDB();

async function getEmbedding(text) {
  if (!openai) {
    console.warn("OpenAI client not available");
    return null;
  }
  
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
}

// Vector-based retrieval
async function retrieveKnowledge(question) {
  // Try vector search first
  if (db && db.items.length > 0 && openai) {
    try {
      const vector = await getEmbedding(question);
      if (vector) {
        const results = await db.queryItems(vector, 3); // Top 3 matches

        if (results.length > 0) {
          const context = results.map((item) => item.item.metadata.text).join("\n");
          console.log(`✅ Vector search found ${results.length} results`);
          return context;
        }
      }
    } catch (error) {
      console.error("Vector retrieval failed:", error);
    }
  }
  
  // Fallback to text-based search
  if (fallbackKnowledgeBase) {
    console.log("📄 Using fallback knowledge base");
    return fallbackKnowledgeBase;
  }
  
  console.warn("⚠️  No knowledge base available");
  return "";
}

module.exports = function (sejongModel, _unusedKnowledgeBase, pythonBin) {
  const router = require("express").Router();

  // Ask Sejong endpoint
  router.post("/ask-sejong", async (req, res) => {
    if (!sejongModel) {
      return res.status(500).json({
        message: "AI 키가 설정되지 않아 세종대왕이 응답할 수 없어요.",
      });
    }

    const { question } = req.body;
    if (!question || !question.trim()) {
      return res
        .status(400)
        .json({ message: "무엇이 궁금한지 먼저 말해 주세요." });
    }

    const retrievedContext = await retrieveKnowledge(question);
    console.log(`🔍 Retrieved context for "${question}":`, retrievedContext);

    const prompt = `${sejongPersonaPrompt}
---
# 참고 자료
${retrievedContext || "관련 자료 없음."}
---

위 참고 자료를 바탕으로 다음 질문에 답하라.
학생의 질문: "${question}"
세종대왕의 답변:`;

    try {
      const result = await sejongModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return res.json({ answer: text });
    } catch (error) {
      console.error("Gemini API error:", error);
      return res.status(500).json({
        message: "짐이 지금 생각이 많으니라. 잠시 후 다시 물어보겠는가?",
      });
    }
  });

  // TTS endpoint
  router.post("/tts", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const timestamp = Date.now();
    const outputFileName = `tts_${timestamp}.mp3`;
    const backendDir = path.resolve(__dirname, "..");
    const outputPath = path.join(backendDir, outputFileName);
    const ttsScriptPath = path.join(__dirname, "../utils/tts.py");

    // Spawn python process to generate audio
    const pythonProcess = spawn(pythonBin, [ttsScriptPath, text, outputPath]);

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("TTS generation failed with code:", code);
        return res.status(500).json({ message: "TTS generation failed" });
      }

      res.sendFile(outputPath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        // Clean up file after sending
        fs.unlink(outputPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
        });
      });
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`TTS Python Error: ${data}`);
    });
  });

  return router;
};
