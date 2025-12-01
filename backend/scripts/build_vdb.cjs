const fs = require('fs');
const path = require('path');
const SimpleVectorDB = require('../utils/simpleVectorDB');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const KNOWLEDGE_BASE_PATH = path.resolve(__dirname, '../sejong_knowledge_base.txt');
const VECTOR_DB_PATH = path.resolve(__dirname, '../vector_db');

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is missing in .env');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function buildVectorDB() {
  console.log('🚀 Starting Vector DB build...');

  if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    console.error('❌ Knowledge base file not found:', KNOWLEDGE_BASE_PATH);
    process.exit(1);
  }

  const db = new SimpleVectorDB();
  await db.createIndex(VECTOR_DB_PATH);

  const content = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);

  console.log(`📄 Found ${lines.length} items in knowledge base.`);

  for (const line of lines) {
    const text = line.trim();
    try {
      const vector = await getEmbedding(text);
      await db.insertItem({
        id: uuidv4(),
        vector,
        metadata: { text }
      });
      console.log(`✅ Indexed: ${text.substring(0, 30)}...`);
    } catch (error) {
      console.error(`❌ Failed to index line: ${text.substring(0, 30)}...`, error.message);
    }
  }

  await db.save();
  console.log('🎉 Vector DB build complete!');
}

buildVectorDB();
