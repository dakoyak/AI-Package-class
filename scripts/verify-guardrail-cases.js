/**
 * Verification script for guardrail cases
 * 
 * This script validates that all guardrail cases are properly defined
 * and meet the requirements for Mission 2.
 */

import { 
  guardrailCases, 
  getAllGuardrailCases, 
  getGuardrailCase,
  getGuardrailCasesByCategory,
  getGuardrailCasesByApiType
} from '../src/core/guardrailCases.ts';

console.log('🔍 Verifying Guardrail Cases...\n');

// Check total number of cases
const allCases = getAllGuardrailCases();
console.log(`✓ Total cases defined: ${allCases.length}`);

if (allCases.length < 3) {
  console.error('❌ ERROR: At least 3 guardrail cases are required');
  process.exit(1);
}

// Check categories
const categories = ['copyright', 'harmful', 'illegal'];
const categoryCounts = {};

categories.forEach(category => {
  const cases = getGuardrailCasesByCategory(category);
  categoryCounts[category] = cases.length;
  console.log(`✓ ${category} cases: ${cases.length}`);
});

// Verify at least one case per required category
const requiredCategories = ['copyright', 'harmful', 'illegal'];
const missingCategories = requiredCategories.filter(cat => categoryCounts[cat] === 0);

if (missingCategories.length > 0) {
  console.error(`❌ ERROR: Missing cases for categories: ${missingCategories.join(', ')}`);
  process.exit(1);
}

// Check API types
const apiTypes = ['dalle', 'gpt'];
apiTypes.forEach(apiType => {
  const cases = getGuardrailCasesByApiType(apiType);
  console.log(`✓ ${apiType} cases: ${cases.length}`);
});

console.log('\n📋 Validating case structure...\n');

// Validate each case
let hasErrors = false;

allCases.forEach((guardrailCase, index) => {
  const caseNum = index + 1;
  console.log(`Case ${caseNum}: ${guardrailCase.id} - ${guardrailCase.title}`);
  
  // Check required fields
  const requiredFields = [
    'id', 'title', 'category', 'prompt', 'apiType', 
    'expectedBehavior', 'discussionPrompt', 'learningPoint'
  ];
  
  const missingFields = requiredFields.filter(field => !guardrailCase[field]);
  
  if (missingFields.length > 0) {
    console.error(`  ❌ Missing fields: ${missingFields.join(', ')}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ All required fields present`);
  }
  
  // Check field types
  if (typeof guardrailCase.prompt !== 'string' || guardrailCase.prompt.length === 0) {
    console.error(`  ❌ Invalid prompt`);
    hasErrors = true;
  }
  
  if (guardrailCase.expectedBehavior !== 'reject') {
    console.error(`  ❌ Expected behavior must be 'reject'`);
    hasErrors = true;
  }
  
  if (!['dalle', 'gpt'].includes(guardrailCase.apiType)) {
    console.error(`  ❌ Invalid API type: ${guardrailCase.apiType}`);
    hasErrors = true;
  }
  
  if (!['copyright', 'harmful', 'illegal'].includes(guardrailCase.category)) {
    console.error(`  ❌ Invalid category: ${guardrailCase.category}`);
    hasErrors = true;
  }
  
  // Check Korean text
  if (!/[가-힣]/.test(guardrailCase.title)) {
    console.warn(`  ⚠️  Warning: Title should be in Korean`);
  }
  
  if (!/[가-힣]/.test(guardrailCase.discussionPrompt)) {
    console.warn(`  ⚠️  Warning: Discussion prompt should be in Korean`);
  }
  
  if (!/[가-힣]/.test(guardrailCase.learningPoint)) {
    console.warn(`  ⚠️  Warning: Learning point should be in Korean`);
  }
  
  console.log('');
});

// Test getter functions
console.log('🧪 Testing getter functions...\n');

const testCaseId = allCases[0].id;
const retrievedCase = getGuardrailCase(testCaseId);

if (retrievedCase && retrievedCase.id === testCaseId) {
  console.log(`✓ getGuardrailCase() works correctly`);
} else {
  console.error(`❌ getGuardrailCase() failed`);
  hasErrors = true;
}

const nonExistentCase = getGuardrailCase('non_existent_case');
if (nonExistentCase === undefined) {
  console.log(`✓ getGuardrailCase() returns undefined for non-existent cases`);
} else {
  console.error(`❌ getGuardrailCase() should return undefined for non-existent cases`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ VALIDATION FAILED - Please fix the errors above');
  process.exit(1);
} else {
  console.log('✅ ALL VALIDATIONS PASSED');
  console.log(`\n📊 Summary:`);
  console.log(`   - Total cases: ${allCases.length}`);
  console.log(`   - Copyright cases: ${categoryCounts.copyright}`);
  console.log(`   - Harmful content cases: ${categoryCounts.harmful}`);
  console.log(`   - Illegal activity cases: ${categoryCounts.illegal}`);
  console.log(`\n✨ Guardrail cases are ready for Mission 2!`);
}
