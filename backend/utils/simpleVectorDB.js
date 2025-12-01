const fs = require('fs');
const path = require('path');

class SimpleVectorDB {
  constructor() {
    this.items = [];
  }

  async createIndex(folderPath) {
    this.folderPath = folderPath;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    // Try to load existing index
    await this.load();
  }

  async insertItem(item) {
    // item: { vector: number[], text: string, metadata: object }
    this.items.push(item);
  }

  async queryItems(queryVector, topK) {
    if (this.items.length === 0) return [];

    const results = this.items.map(item => {
      const similarity = this.cosineSimilarity(queryVector, item.vector);
      return { item, score: similarity };
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async save() {
    const filePath = path.join(this.folderPath, 'index.json');
    fs.writeFileSync(filePath, JSON.stringify(this.items), 'utf-8');
  }

  async load() {
    const filePath = path.join(this.folderPath, 'index.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      this.items = JSON.parse(data);
    }
  }
}

module.exports = SimpleVectorDB;
