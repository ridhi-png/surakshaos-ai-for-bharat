#!/usr/bin/env node

/**
 * Setup verification script for SurakshaOS
 * Verifies that all required dependencies and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'eslint.config.js',
  '.prettierrc',
  'jest.config.js',
  '.env.example',
  '.gitignore',
  'README.md'
];

const requiredDirectories = [
  'src',
  'src/database',
  'src/models',
  'src/services',
  'src/routes',
  'src/middleware',
  'src/utils',
  'src/types',
  'src/test',
  'src/ai',
  'src/aws',
  'src/communication',
  'src/language',
  'data',
  'models'
];

const requiredDependencies = [
  'express',
  'sqlite3',
  'aws-sdk',
  'jest',
  'typescript',
  'fast-check'
];

console.log('🔍 Verifying SurakshaOS project setup...\n');

// Check required files
console.log('📁 Checking required files:');
let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file}`);
    missingFiles.push(file);
  }
});

// Check required directories
console.log('\n📂 Checking required directories:');
let missingDirs = [];
requiredDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/`);
    missingDirs.push(dir);
  }
});

// Check dependencies
console.log('\n📦 Checking required dependencies:');
let missingDeps = [];
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDependencies.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`  ✅ ${dep} (${allDeps[dep]})`);
    } else {
      console.log(`  ❌ ${dep}`);
      missingDeps.push(dep);
    }
  });
} catch (error) {
  console.log('  ❌ Could not read package.json');
  missingFiles.push('package.json');
}

// Summary
console.log('\n📊 Setup Summary:');
if (missingFiles.length === 0 && missingDirs.length === 0 && missingDeps.length === 0) {
  console.log('  🎉 All required files, directories, and dependencies are present!');
  console.log('  ✅ Project setup is complete.');
  console.log('\n🚀 Next steps:');
  console.log('  1. Run: npm install');
  console.log('  2. Copy: cp .env.example .env');
  console.log('  3. Run: npm run db:migrate');
  console.log('  4. Start development: npm run dev');
} else {
  console.log('  ⚠️  Some items are missing:');
  if (missingFiles.length > 0) {
    console.log(`    Missing files: ${missingFiles.join(', ')}`);
  }
  if (missingDirs.length > 0) {
    console.log(`    Missing directories: ${missingDirs.join(', ')}`);
  }
  if (missingDeps.length > 0) {
    console.log(`    Missing dependencies: ${missingDeps.join(', ')}`);
  }
}