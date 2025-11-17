/**
 * Verify canned bias data structure
 * Run with: node frontend/scripts/verify-canned-data.js
 */

import { cannedBiasData, getAllBiasCases, getBiasCasesByCategory } from '../src/core/cannedData.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Canned Bias Data...\n');

// Check total number of cases
const allCases = getAllBiasCases();
console.log(`✓ Total bias cases: ${allCases.length}`);

if (allCases.length < 6) {
  console.error('❌ ERROR: Less than 6 bias cases defined!');
  process.exit(1);
}

// Check categories
const occupationCases = getBiasCasesByCategory('occupation');
const cultureCases = getBiasCasesByCategory('culture');
const genderRoleCases = getBiasCasesByCategory('gender-role');

console.log(`✓ Occupation cases: ${occupationCases.length}`);
console.log(`✓ Culture cases: ${cultureCases.length}`);
console.log(`✓ Gender role cases: ${genderRoleCases.length}\n`);

// Verify each case has required fields
console.log('Verifying case structure...');
let hasErrors = false;

for (const biasCase of allCases) {
  const errors = [];
  
  if (!biasCase.id) errors.push('missing id');
  if (!biasCase.title) errors.push('missing title');
  if (!biasCase.category) errors.push('missing category');
  if (!biasCase.prompt) errors.push('missing prompt');
  if (!biasCase.type) errors.push('missing type');
  if (!biasCase.results || biasCase.results.length === 0) errors.push('missing results');
  if (!biasCase.discussionPrompt) errors.push('missing discussionPrompt');
  if (!biasCase.learningPoint) errors.push('missing learningPoint');
  
  if (errors.length > 0) {
    console.error(`❌ Case ${biasCase.id}: ${errors.join(', ')}`);
    hasErrors = true;
  } else {
    console.log(`✓ Case ${biasCase.id}: OK (${biasCase.results.length} images)`);
  }
}

// Verify image files exist
console.log('\nVerifying image files...');
const imageDir = path.join(__dirname, '../public/images/canned');
let missingImages = 0;

for (const biasCase of allCases) {
  for (const imagePath of biasCase.results) {
    const filename = imagePath.replace('/images/canned/', '');
    const fullPath = path.join(imageDir, filename);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing image: ${filename}`);
      missingImages++;
    }
  }
}

if (missingImages === 0) {
  console.log(`✓ All ${allCases.reduce((sum, c) => sum + c.results.length, 0)} image files exist`);
} else {
  console.error(`❌ ${missingImages} image files are missing`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Verification FAILED - Please fix the errors above');
  process.exit(1);
} else {
  console.log('✅ Verification PASSED - All canned data is ready!');
  console.log('\nSummary:');
  console.log(`  - ${allCases.length} bias cases defined`);
  console.log(`  - ${occupationCases.length} occupation stereotypes`);
  console.log(`  - ${cultureCases.length} cultural biases`);
  console.log(`  - ${genderRoleCases.length} gender role biases`);
  console.log(`  - ${allCases.reduce((sum, c) => sum + c.results.length, 0)} total images`);
}
