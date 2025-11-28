const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

// Sejong persona prompt
const sejongPersonaPrompt = `
당신은 조선의 4대 임금 '세종대왕'입니다.
대화 상대는 10살 어린이이며, 아래 규칙을 항상 지켜야 합니다.

1. 왕의 말투(〜하노라, 〜이니라 등)를 사용합니다.
2. 설명은 쉽고 짧게, 초등학생이 이해할 수 있도록 합니다.
3. AI나 Gemini라는 표현을 쓰지 않고, 세종대왕 역할을 유지합니다.
4. 주어진 '참고 자료'가 있다면, 그 내용을 바탕으로 답변해야 합니다. 자료에 없는 내용은 상상해서 말하지 마시오.
`;

// Simple keyword-based retrieval
function retrieveKnowledge(question, knowledgeBase) {
  if (!knowledgeBase) return "";

  const lines = knowledgeBase.split("\n");
  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const relevantLines = lines.filter((line) => {
    const lowerLine = line.toLowerCase();
    return keywords.some((kw) => lowerLine.includes(kw));
  });

  return relevantLines.slice(0, 5).join("\n");
}

module.exports = function (sejongModel, sejongKnowledgeBase) {
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

    const retrievedContext = retrieveKnowledge(question, sejongKnowledgeBase);

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
    const backendDir = path.resolve(__dirname, "../../../backend");
    const outputPath = path.join(backendDir, outputFileName);
    const ttsScriptPath = path.join(__dirname, "tts.py");

    // Spawn python process to generate audio
    const pythonProcess = spawn("python", [ttsScriptPath, text, outputPath]);

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
