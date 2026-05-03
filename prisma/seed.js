"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function createAdapter() {
    const url = new URL(process.env.DATABASE_URL);
    return new adapter_mariadb_1.PrismaMariaDb({
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
    });
}
const prisma = new client_1.PrismaClient({ adapter: createAdapter() });
async function main() {
    console.log('🌱 Seeding database...');
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
    const semesters = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map((num) => prisma.semester.upsert({
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
            is_active: num === 4,
        },
    })));
    console.log(`✅ ${semesters.length} semesters seeded`);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hostel.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            uuid: (0, uuid_1.v4)(),
            role: 'ADMIN',
            full_name: 'System Administrator',
            email: adminEmail,
            password_hash: passwordHash,
            is_active: true,
        },
    });
    console.log(`✅ Admin user seeded: ${admin.email}`);
    const boysHostel = await prisma.hostel.upsert({
        where: { id: BigInt(1) },
        update: {},
        create: { hostel_name: 'Boys Hostel', gender_type: 'BOYS' },
    });
    const girlsHostel = await prisma.hostel.upsert({
        where: { id: BigInt(2) },
        update: {},
        create: { hostel_name: 'Girls Hostel', gender_type: 'GIRLS' },
    });
    console.log('✅ Hostels seeded');
    const cseDept = departments[0];
    const sem4 = semesters[3];
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.menu.upsert({
        where: { date: today },
        update: {},
        create: {
            date: today,
            breakfast: 'Idli, Sambar, Coconut Chutney, Coffee/Tea',
            lunch: 'Rice, Dal Tadka, Mixed Vegetable Curry, Chapati, Curd, Pickle',
            dinner: 'Vegetable Fried Rice, Gobi Manchurian, Sweet Corn Soup',
        },
    });
    for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        futureDate.setHours(0, 0, 0, 0);
        const menus = [
            {
                breakfast: 'Poha, Tea, Banana',
                lunch: 'Biryani, Raita, Onion Salad, Papad',
                dinner: 'Roti, Paneer Butter Masala, Dal Makhani, Rice',
            },
            {
                breakfast: 'Upma, Coconut Chutney, Coffee',
                lunch: 'Sambar Rice, Rasam, Vegetable Poriyal, Curd',
                dinner: 'Chapati, Aloo Gobi, Dal, Jeera Rice',
            },
            {
                breakfast: 'Paratha, Curd, Pickle, Tea',
                lunch: 'Chole, Bhature, Onion Salad, Sweet',
                dinner: 'Fried Rice, Chilli Paneer, Manchow Soup',
            },
            {
                breakfast: 'Dosa, Sambar, Chutney, Coffee',
                lunch: 'Pulao, Raita, Papad, Pickle',
                dinner: 'Roti, Rajma Curry, Dal, Rice',
            },
            {
                breakfast: 'Bread Toast, Jam, Butter, Tea',
                lunch: 'Rice, Kadhi, Aloo Fry, Chapati',
                dinner: 'Noodles, Gobi 65, Spring Rolls',
            },
            {
                breakfast: 'Pongal, Vada, Sambar, Chutney',
                lunch: 'Lemon Rice, Curd Rice, Papad, Pickle',
                dinner: 'Chapati, Mixed Veg Curry, Dal, Rice',
            },
            {
                breakfast: 'Aloo Paratha, Curd, Pickle, Tea',
                lunch: 'Special Thali - Rice, Dal, 2 Sabzi, Roti, Sweet',
                dinner: 'Pasta, Garlic Bread, Soup',
            },
        ];
        const menu = menus[i % menus.length];
        await prisma.menu.upsert({
            where: { date: futureDate },
            update: {},
            create: {
                date: futureDate,
                breakfast: menu.breakfast,
                lunch: menu.lunch,
                dinner: menu.dinner,
            },
        });
    }
    console.log('✅ Sample menus seeded (today + 7 days)');
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const dueDate = new Date(currentYear, currentMonth, 10);
    const fee1 = await prisma.fee.create({
        data: {
            student_id: student1.id,
            month: currentMonth,
            year: currentYear,
            room_rent: 5000,
            food_fee: 3000,
            electricity_fee: 500,
            water_fee: 200,
            maintenance_fee: 300,
            fine: 0,
            previous_due: 0,
            discount: 0,
            total_amount: 9000,
            paid_amount: 0,
            balance_amount: 9000,
            payment_status: 'PENDING',
            due_date: dueDate,
        },
    });
    const fee2 = await prisma.fee.create({
        data: {
            student_id: student2.id,
            month: currentMonth,
            year: currentYear,
            room_rent: 6000,
            food_fee: 3000,
            electricity_fee: 500,
            water_fee: 200,
            maintenance_fee: 300,
            fine: 0,
            previous_due: 0,
            discount: 500,
            total_amount: 9500,
            paid_amount: 5000,
            balance_amount: 4500,
            payment_status: 'PARTIAL',
            due_date: dueDate,
        },
    });
    const fee3 = await prisma.fee.create({
        data: {
            student_id: student3.id,
            month: currentMonth,
            year: currentYear,
            room_rent: 5000,
            food_fee: 3000,
            electricity_fee: 500,
            water_fee: 200,
            maintenance_fee: 300,
            fine: 0,
            previous_due: 0,
            discount: 0,
            total_amount: 9000,
            paid_amount: 9000,
            balance_amount: 0,
            payment_status: 'PAID',
            due_date: dueDate,
        },
    });
    console.log('✅ Sample fees seeded');
    await prisma.feePayment.create({
        data: {
            fee_id: fee2.id,
            student_id: student2.id,
            amount: 5000,
            payment_method: 'UPI',
            transaction_id: 'UPI2024001',
            paid_on: new Date(),
            remarks: 'Partial payment via UPI',
        },
    });
    await prisma.feePayment.create({
        data: {
            fee_id: fee3.id,
            student_id: student3.id,
            amount: 9000,
            payment_method: 'RAZORPAY',
            transaction_id: 'RZP2024001',
            razorpay_order_id: 'order_123456',
            razorpay_payment_id: 'pay_123456',
            paid_on: new Date(),
            remarks: 'Full payment via Razorpay',
        },
    });
    console.log('✅ Sample fee payments seeded');
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    await prisma.attendance.create({
        data: {
            student_id: student1.id,
            semester_id: sem4.id,
            date: yesterday,
            status: 'PRESENT',
            check_in_time: new Date(yesterday.setHours(18, 30, 0, 0)),
            check_out_time: null,
        },
    });
    await prisma.attendance.create({
        data: {
            student_id: student2.id,
            semester_id: sem4.id,
            date: yesterday,
            status: 'PRESENT',
            check_in_time: new Date(yesterday.setHours(19, 0, 0, 0)),
            check_out_time: null,
        },
    });
    await prisma.attendance.create({
        data: {
            student_id: student3.id,
            semester_id: sem4.id,
            date: yesterday,
            status: 'LEAVE',
            remarks: 'On approved leave',
        },
    });
    console.log('✅ Sample attendance seeded');
    await prisma.complaint.create({
        data: {
            student_id: student1.id,
            room_id: room101.id,
            title: 'AC not working',
            type: 'MAINTENANCE',
            description: 'The air conditioner in room 101 is not cooling properly. Please fix it.',
            priority: 'HIGH',
            status: 'OPEN',
        },
    });
    await prisma.complaint.create({
        data: {
            student_id: student2.id,
            room_id: room201.id,
            title: 'Water leakage in bathroom',
            type: 'BATHROOM',
            description: 'There is water leakage from the bathroom ceiling.',
            priority: 'URGENT',
            status: 'IN_PROGRESS',
        },
    });
    await prisma.complaint.create({
        data: {
            student_id: student3.id,
            title: 'Food quality issue',
            type: 'FOOD',
            description: 'The food served yesterday was not fresh.',
            priority: 'MEDIUM',
            status: 'RESOLVED',
            resolved_by: admin.id,
            resolved_at: new Date(),
            resolution: 'Spoke with the mess manager. Quality will be improved.',
        },
    });
    console.log('✅ Sample complaints seeded');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 3);
    await prisma.leaveRequest.create({
        data: {
            student_id: student3.id,
            from_date: yesterday,
            to_date: today,
            reason: 'Going home for family function',
            status: 'APPROVED',
            approved_by: admin.id,
            approved_at: new Date(yesterday),
            remarks: 'Approved. Please return on time.',
        },
    });
    await prisma.leaveRequest.create({
        data: {
            student_id: student1.id,
            from_date: tomorrow,
            to_date: dayAfterTomorrow,
            reason: 'Medical checkup in hometown',
            status: 'PENDING',
        },
    });
    console.log('✅ Sample leave requests seeded');
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    await prisma.visitor.create({
        data: {
            student_id: student1.id,
            room_id: room101.id,
            visitor_name: 'Rajesh Kumar',
            relation: 'Father',
            phone: '9876543211',
            id_proof_type: 'Aadhar Card',
            id_proof_number: '1234-5678-9012',
            check_in_time: twoHoursAgo,
            check_out_time: oneHourAgo,
            purpose: 'Visiting son',
        },
    });
    await prisma.visitor.create({
        data: {
            student_id: student2.id,
            room_id: room201.id,
            visitor_name: 'Suresh Sharma',
            relation: 'Father',
            phone: '9876543221',
            id_proof_type: 'Driving License',
            id_proof_number: 'DL1234567890',
            check_in_time: new Date(),
            purpose: 'Visiting daughter',
        },
    });
    console.log('✅ Sample visitors seeded');
    await prisma.staff.create({
        data: {
            name: 'Mr. Ramesh Verma',
            role: 'Warden',
            phone: '9876543240',
            email: 'warden@hostel.com',
            address: 'Staff Quarters, Hostel Campus',
            salary: 35000,
            is_active: true,
        },
    });
    await prisma.staff.create({
        data: {
            name: 'Mr. Sunil Kumar',
            role: 'Security',
            phone: '9876543241',
            email: 'security@hostel.com',
            salary: 20000,
            is_active: true,
        },
    });
    console.log('✅ Sample staff seeded');
    console.log('\n🎉 Seeding complete!');
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
    console.log('   Students: HTN2024001 (Male), HTN2024002 (Female)');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map