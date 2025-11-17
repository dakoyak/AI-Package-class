/**
 * Generate placeholder SVG images for canned bias data
 * Run with: node frontend/scripts/generate-placeholders.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cases = [
  { prefix: 'doctor', label: '의사', icon: '🩺', color: '#87CEEB' },
  { prefix: 'nurse', label: '간호사', icon: '💉', color: '#FFB6C1' },
  { prefix: 'ceo', label: 'CEO', icon: '💼', color: '#FFD700' },
  { prefix: 'family', label: '가족', icon: '👨‍👩‍👧‍👦', color: '#90EE90' },
  { prefix: 'beauty', label: '아름다움', icon: '✨', color: '#DDA0DD' },
  { prefix: 'cooking', label: '요리', icon: '🍳', color: '#FFA07A' },
  { prefix: 'engineer', label: '엔지니어', icon: '💻', color: '#87CEEB' },
  { prefix: 'teacher', label: '선생님', icon: '📚', color: '#98FB98' }
];

function createSVG(label, icon, color, number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${color}"/>
  <text x="256" y="200" font-size="120" text-anchor="middle" fill="white">${icon}</text>
  <text x="256" y="280" font-size="32" text-anchor="middle" fill="white" font-family="Arial, sans-serif">${label}</text>
  <text x="256" y="320" font-size="24" text-anchor="middle" fill="white" font-family="Arial, sans-serif">Placeholder ${number}</text>
  <text x="256" y="450" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif">Replace with AI-generated image</text>
</svg>`;
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../public/images/canned');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating placeholder images...\n');

let count = 0;
for (const caseData of cases) {
  for (let i = 1; i <= 6; i++) {
    const filename = `${caseData.prefix}_${i}.svg`;
    const filepath = path.join(outputDir, filename);
    const svg = createSVG(caseData.label, caseData.icon, caseData.color, i);
    
    fs.writeFileSync(filepath, svg, 'utf8');
    console.log(`✓ Generated: ${filename}`);
    count++;
  }
}

console.log(`\n✅ Complete! Generated ${count} placeholder images.`);
console.log(`\nImages saved to: ${outputDir}`);
console.log('\nNote: These are SVG placeholders. Replace them with actual AI-generated JPG images for production use.');
