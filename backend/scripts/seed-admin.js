#!/usr/bin/env node

/**
 * Admin User Seed Script
 * Creates a default admin user if none exists
 * 
 * Usage:
 *   node scripts/seed-admin.js
 *   NODE_ENV=production node scripts/seed-admin.js (for production)
 * 
 * Environment Variables:
 *   ADMIN_EMAIL - Email for admin account (default: admin@mohit.in)
 *   ADMIN_PASSWORD - Password for admin account (default: admin123)
 *   ADMIN_NAME - Name for admin account (default: Admin User)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = 'admin@mohit.in';
const DEFAULT_ADMIN_NAME = 'Admin User';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

/**
 * Generate a secure random password
 */
function generatePassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@$!%*?&';
  
  const all = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one char from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill rest with random chars
  for (let i = password.length; i < 16; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Seed admin user
 */
async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seed...\n');
    
    const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
    const adminName = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;
    let adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, name: true, email: true, role: true }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      if (existingAdmin.role !== 'ADMIN') {
        console.log('\n⚠️  User exists but is not an ADMIN. Updating role...');
        const updated = await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        });
        console.log(`✅ Role updated to ADMIN\n`);
      } else {
        console.log('');
      }
      return;
    }
    
    // Generate password if not provided
    if (!adminPassword) {
      adminPassword = 'admin123';  // Default password for your account
      console.log('🔑 Using default password');
      console.log(`   Password: ${adminPassword}\n`);
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        college: 'SkillBridge',
        year: 'Admin'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📊 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt}`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log('   1. Save the password in a secure location');
    console.log('   2. Change the password after first login');
    console.log('   3. Set SUPER_ADMIN_EMAILS in .env to allow this account to promote others');
    console.log(`\n   SUPER_ADMIN_EMAILS=admin@skillbridge.co.in\n`);
    
  } catch (error) {
    console.error('❌ Error seeding admin user:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
