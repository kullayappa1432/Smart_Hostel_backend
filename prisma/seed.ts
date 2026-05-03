import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';

config(); // Load .env

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Departments ──────────────────────────────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { department_code: 'CSE' },
      update: {},
      create: { department_name: 'Computer Science Engineering', department_code: 'CSE' },
    }),
    prisma.department.upsert({
      where: { department_code: 'ECE' },
      update: {},
      create: { department_name: 'Electronics & Communication Engineering', department_code: 'ECE' },
    }),
    prisma.department.upsert({
      where: { department_code: 'MECH' },
      update: {},
      create: { department_name: 'Mechanical Engineering', department_code: 'MECH' },
    }),
    prisma.department.upsert({
      where: { department_code: 'CIVIL' },
      update: {},
      create: { department_name: 'Civil Engineering', department_code: 'CIVIL' },
    }),
  ]);
  console.log(`✅ ${departments.length} departments seeded`);

  // ─── Semesters ────────────────────────────────────────────────────────────────
  const semesters = await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8].map((num) =>
      prisma.semester.upsert({
        where: {
          semester_number_academic_year: {
            semester_number: num,
            academic_year: '2024-2025',
          },
        },
        update: {},
        create: {
          semester_number: num,
          academic_year: '2024-2025',
          is_active: num === 4, // Semester 4 is active
        },
      }),
    ),
  );
  console.log(`✅ ${semesters.length} semesters seeded`);

  // ─── Admin User ───────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hostel.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      uuid: uuidv4(),
      role: 'ADMIN',
      full_name: 'System Administrator',
      email: adminEmail,
      password_hash: passwordHash,
      is_active: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // ─── Attender User ────────────────────────────────────────────────────────────
  const attenderPassword = await bcrypt.hash('Attender@123', 12);
  const attender = await prisma.user.upsert({
    where: { email: 'attender@hostel.com' },
    update: {},
    create: {
      uuid: uuidv4(),
      role: 'ATTENDER',
      full_name: 'Hostel Attender',
      email: 'attender@hostel.com',
      password_hash: attenderPassword,
      is_active: true,
    },
  });
  console.log(`✅ Attender user seeded: ${attender.email}`);

  // ─── Hostels ──────────────────────────────────────────────────────────────────
  const boysHostel = await prisma.hostel.create({
    data: { hostel_name: 'Boys Hostel', gender_type: 'BOYS' },
  });

  const girlsHostel = await prisma.hostel.create({
    data: { hostel_name: 'Girls Hostel', gender_type: 'GIRLS' },
  });
  console.log('✅ Hostels seeded');

  // ─── Sample Students ──────────────────────────────────────────────────────────
  const cseDept = departments[0];
  const sem4 = semesters[3]; // semester 4

  const student1 = await prisma.student.upsert({
    where: { hall_ticket_number: 'HTN2024001' },
    update: {},
    create: {
      hall_ticket_number: 'HTN2024001',
      name: 'Ravi Kumar',
      gender: 'MALE',
      phone: '9876543210',
      email: 'ravi.kumar@student.com',
      college_name: 'ABC Engineering College',
      course: 'B.Tech',
      year: 2,
      department_id: cseDept.id,
      semester_id: sem4.id,
      parent_name: 'Rajesh Kumar',
      parent_phone: '9876543211',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      status: 'ACTIVE',
    },
  });

  const student2 = await prisma.student.upsert({
    where: { hall_ticket_number: 'HTN2024002' },
    update: {},
    create: {
      hall_ticket_number: 'HTN2024002',
      name: 'Priya Sharma',
      gender: 'FEMALE',
      phone: '9876543220',
      email: 'priya.sharma@student.com',
      college_name: 'ABC Engineering College',
      course: 'B.Tech',
      year: 2,
      department_id: cseDept.id,
      semester_id: sem4.id,
      parent_name: 'Suresh Sharma',
      parent_phone: '9876543221',
      address: '456, Brigade Road, Bangalore, Karnataka - 560002',
      status: 'ACTIVE',
    },
  });

  const student3 = await prisma.student.upsert({
    where: { hall_ticket_number: 'HTN2024003' },
    update: {},
    create: {
      hall_ticket_number: 'HTN2024003',
      name: 'Amit Patel',
      gender: 'MALE',
      phone: '9876543230',
      email: 'amit.patel@student.com',
      college_name: 'ABC Engineering College',
      course: 'B.Tech',
      year: 2,
      department_id: cseDept.id,
      semester_id: sem4.id,
      parent_name: 'Ramesh Patel',
      parent_phone: '9876543231',
      address: '789, Residency Road, Bangalore, Karnataka - 560003',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Sample students seeded');

  // ─── Sample Rooms ─────────────────────────────────────────────────────────────
  const room101 = await prisma.room.upsert({
    where: { hostel_id_room_number: { hostel_id: boysHostel.id, room_number: '101' } },
    update: {},
    create: {
      room_number: '101',
      hostel_id: boysHostel.id,
      block_name: 'A',
      floor_number: 1,
      department_id: cseDept.id,
      semester_id: sem4.id,
      capacity: 4,
      room_type: 'STANDARD',
      monthly_rent: 5000,
      status: 'OCCUPIED',
      occupied_count: 2,
      available: true,
    },
  });

  const room201 = await prisma.room.upsert({
    where: { hostel_id_room_number: { hostel_id: girlsHostel.id, room_number: '201' } },
    update: {},
    create: {
      room_number: '201',
      hostel_id: girlsHostel.id,
      block_name: 'A',
      floor_number: 2,
      department_id: cseDept.id,
      semester_id: sem4.id,
      capacity: 4,
      room_type: 'DELUXE',
      monthly_rent: 6000,
      status: 'OCCUPIED',
      occupied_count: 1,
      available: true,
    },
  });

  await prisma.room.upsert({
    where: { hostel_id_room_number: { hostel_id: boysHostel.id, room_number: '102' } },
    update: {},
    create: {
      room_number: '102',
      hostel_id: boysHostel.id,
      block_name: 'A',
      floor_number: 1,
      department_id: cseDept.id,
      semester_id: sem4.id,
      capacity: 4,
      room_type: 'AC',
      monthly_rent: 7500,
      status: 'AVAILABLE',
      occupied_count: 0,
      available: true,
    },
  });
  console.log('✅ Sample rooms seeded');

  // ─── Room Allocations ─────────────────────────────────────────────────────────
  await prisma.allocation.upsert({
    where: { student_id: student1.id },
    update: {},
    create: {
      student_id: student1.id,
      room_id: room101.id,
      bed_no: 1,
      check_in_date: new Date('2024-07-01'),
      is_current: true,
    },
  });

  await prisma.allocation.upsert({
    where: { student_id: student3.id },
    update: {},
    create: {
      student_id: student3.id,
      room_id: room101.id,
      bed_no: 2,
      check_in_date: new Date('2024-07-01'),
      is_current: true,
    },
  });

  await prisma.allocation.upsert({
    where: { student_id: student2.id },
    update: {},
    create: {
      student_id: student2.id,
      room_id: room201.id,
      bed_no: 1,
      check_in_date: new Date('2024-07-01'),
      is_current: true,
    },
  });
  console.log('✅ Room allocations seeded');

  console.log('\n🎉 Seeding complete!');
  console.log(`   Admin:    ${adminEmail} / ${adminPassword}`);
  console.log(`   Attender: attender@hostel.com / Attender@123`);
  console.log('   Students: HTN2024001 (Male), HTN2024002 (Female), HTN2024003 (Male)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
