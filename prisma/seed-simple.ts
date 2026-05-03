import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';

config(); // Load .env

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with admin user...');

  try {
    // ─── Admin User ───────────────────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hostel.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
    } else {
      const admin = await prisma.user.create({
        data: {
          uuid: uuidv4(),
          role: 'ADMIN',
          full_name: 'System Administrator',
          email: adminEmail,
          password_hash: passwordHash,
          is_active: true,
        },
      });
      console.log(`✅ Admin user created: ${admin.email}`);
    }

    // ─── Attender User ────────────────────────────────────────────────────────────
    const attenderPassword = await bcrypt.hash('Attender@123', 12);
    const existingAttender = await prisma.user.findUnique({
      where: { email: 'attender@hostel.com' },
    });

    if (existingAttender) {
      console.log(`✅ Attender user already exists: attender@hostel.com`);
    } else {
      const attender = await prisma.user.create({
        data: {
          uuid: uuidv4(),
          role: 'ATTENDER',
          full_name: 'Hostel Attender',
          email: 'attender@hostel.com',
          password_hash: attenderPassword,
          is_active: true,
        },
      });
      console.log(`✅ Attender user created: ${attender.email}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   Admin:    ${adminEmail} / ${adminPassword}`);
    console.log(`   Attender: attender@hostel.com / Attender@123`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
