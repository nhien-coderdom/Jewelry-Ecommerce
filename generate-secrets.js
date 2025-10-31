#!/usr/bin/env node

/**
 * Generate secure secrets for Strapi deployment
 * Run: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for Strapi...\n');

// Generate APP_KEYS (4 keys separated by commas)
const appKeys = [];
for (let i = 0; i < 4; i++) {
  appKeys.push(crypto.randomBytes(16).toString('base64'));
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Copy these to your Railway environment variables:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('APP_KEYS=');
console.log(appKeys.join(','));
console.log('');

console.log('API_TOKEN_SALT=');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('ADMIN_JWT_SECRET=');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('TRANSFER_TOKEN_SALT=');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('JWT_SECRET=');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  IMPORTANT: Keep these secrets secure!');
console.log('   - Never commit them to Git');
console.log('   - Store them in Railway environment variables');
console.log('   - Generate new ones for each environment');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
