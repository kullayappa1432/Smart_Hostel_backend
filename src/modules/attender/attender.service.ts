import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateExpenseDto, 
  GetExpensesQueryDto, 
  ExpenseType,
  CreateAttenderDto,
  UpdateAttenderDto,
  GetAttendersQueryDto
} from './dto/attender.dto';

@Injectable()
export class AttenderService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTENDER STAFF MANAGEMENT (CRUD)
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Create Attender ──────────────────────────────────────────────────────
  async createAttender(dto: CreateAttenderDto) {
    // Check if email already exists
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email: dto.email },
    });

    if (existingStaff) {
      throw new ConflictException('Attender with this email already exists');
    }

    const attender = await this.prisma.staff.create({
      data: {
        name: dto.name,
        role: 'ATTENDER',
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        is_active: true,
      },
    });

    return {
      message: 'Attender created successfully',
      data: attender,
    };
  }

  // ─── Get All Attenders ────────────────────────────────────────────────────
  async getAllAttenders(query: GetAttendersQueryDto) {
    const where: any = { role: 'ATTENDER' };

    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }

    const attenders = await this.prisma.staff.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return {
      message: 'Attenders fetched successfully',
      data: attenders,
    };
  }

  // ─── Get Attender by ID ───────────────────────────────────────────────────
  async getAttenderById(id: number) {
    const attender = await this.prisma.staff.findFirst({
      where: {
        id: BigInt(id),
        role: 'ATTENDER',
      },
    });

    if (!attender) {
      throw new NotFoundException('Attender not found');
    }

    return {
      message: 'Attender fetched successfully',
      data: attender,
    };
  }

  // ─── Update Attender ──────────────────────────────────────────────────────
  async updateAttender(id: number, dto: UpdateAttenderDto) {
    // Check if attender exists
    const existingAttender = await this.prisma.staff.findFirst({
      where: {
        id: BigInt(id),
        role: 'ATTENDER',
      },
    });

    if (!existingAttender) {
      throw new NotFoundException('Attender not found');
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== existingAttender.email) {
      const emailExists = await this.prisma.staff.findUnique({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another staff member');
      }
    }

    const updatedAttender = await this.prisma.staff.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.email && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return {
      message: 'Attender updated successfully',
      data: updatedAttender,
    };
  }

  // ─── Delete Attender ──────────────────────────────────────────────────────
  async deleteAttender(id: number) {
    // Check if attender exists
    const existingAttender = await this.prisma.staff.findFirst({
      where: {
        id: BigInt(id),
        role: 'ATTENDER',
      },
    });

    if (!existingAttender) {
      throw new NotFoundException('Attender not found');
    }

    await this.prisma.staff.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: 'Attender deleted successfully',
    };
  }

  // ─── Toggle Attender Status ───────────────────────────────────────────────
  async toggleAttenderStatus(id: number) {
    const attender = await this.prisma.staff.findFirst({
      where: {
        id: BigInt(id),
        role: 'ATTENDER',
      },
    });

    if (!attender) {
      throw new NotFoundException('Attender not found');
    }

    const updatedAttender = await this.prisma.staff.update({
      where: { id: BigInt(id) },
      data: { is_active: !attender.is_active },
    });

    return {
      message: `Attender ${updatedAttender.is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedAttender,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPENSE TRACKING & DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Dashboard Summary ────────────────────────────────────────────────────────
  async getDashboardSummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Total students
    const totalStudents = await this.prisma.student.count({
      where: { status: 'ACTIVE' },
    });

    // Present today
    const presentToday = await this.prisma.attendance.count({
      where: {
        date: { gte: targetDate, lt: nextDay },
        status: 'PRESENT',
      },
    });

    // Total food cost today (from fee_payments with FOOD type)
    const foodExpenses = await this.prisma.feePayment.findMany({
      where: {
        paid_on: { gte: targetDate, lt: nextDay },
        remarks: { contains: 'FOOD' },
      },
    });
    const totalFoodToday = foodExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Pending fees count
    const pendingFees = await this.prisma.fee.count({
      where: { payment_status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
    });

    return {
      total_students: totalStudents,
      present_today: presentToday,
      absent_today: totalStudents - presentToday,
      total_food_today: totalFoodToday,
      pending_payments: pendingFees,
      date: targetDate.toISOString().split('T')[0],
    };
  }

  // ─── Record daily expense (food / maintenance) ────────────────────────────────
  async recordExpense(dto: CreateExpenseDto) {
    const expenseDate = dto.date ? new Date(dto.date) : new Date();

    // We store attender expenses as FeePayments with a special remark
    // This reuses the existing FeePayment model without schema changes
    const student = await this.prisma.student.findUnique({
      where: { id: BigInt(dto.student_id) },
    });
    if (!student) throw new Error('Student not found');

    // Find or create a fee for this month
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();
    const dueDate = new Date(year, month, 10);

    let fee = await this.prisma.fee.findUnique({
      where: {
        student_id_month_year: {
          student_id: BigInt(dto.student_id),
          month,
          year,
        },
      },
    });

    if (!fee) {
      fee = await this.prisma.fee.create({
        data: {
          student_id: BigInt(dto.student_id),
          month,
          year,
          room_rent: 0,
          food_fee: dto.expense_type === ExpenseType.FOOD ? dto.amount : 0,
          maintenance_fee: dto.expense_type === ExpenseType.MAINTENANCE ? dto.amount : 0,
          total_amount: dto.amount,
          paid_amount: 0,
          balance_amount: dto.amount,
          payment_status: 'PENDING',
          due_date: dueDate,
        },
      });
    } else {
      // Update the fee with the new expense
      const newTotal = Number(fee.total_amount) + dto.amount;
      const newBalance = Number(fee.balance_amount) + dto.amount;
      await this.prisma.fee.update({
        where: { id: fee.id },
        data: {
          food_fee: dto.expense_type === ExpenseType.FOOD
            ? Number(fee.food_fee) + dto.amount
            : fee.food_fee,
          maintenance_fee: dto.expense_type === ExpenseType.MAINTENANCE
            ? Number(fee.maintenance_fee) + dto.amount
            : fee.maintenance_fee,
          total_amount: newTotal,
          balance_amount: newBalance,
          payment_status: newBalance > 0 ? 'PENDING' : 'PAID',
        },
      });
    }

    // Record as a payment entry for tracking
    const record = await this.prisma.feePayment.create({
      data: {
        fee_id: fee.id,
        student_id: BigInt(dto.student_id),
        amount: dto.amount,
        payment_method: 'CASH',
        paid_on: expenseDate,
        remarks: `${dto.expense_type}${dto.remarks ? ': ' + dto.remarks : ''}`,
      },
      include: {
        student: { select: { id: true, name: true, hall_ticket_number: true } },
      },
    });

    return { message: 'Expense recorded successfully', data: record };
  }

  // ─── Get expenses list ────────────────────────────────────────────────────────
  async getExpenses(query: GetExpensesQueryDto) {
    const where: any = {};

    if (query.student_id) where.student_id = BigInt(query.student_id);

    if (query.expense_type) {
      where.remarks = { contains: query.expense_type };
    }

    if (query.from_date || query.to_date) {
      where.paid_on = {};
      if (query.from_date) where.paid_on.gte = new Date(query.from_date);
      if (query.to_date) {
        const to = new Date(query.to_date);
        to.setHours(23, 59, 59, 999);
        where.paid_on.lte = to;
      }
    }

    const records = await this.prisma.feePayment.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, hall_ticket_number: true } },
      },
      orderBy: { paid_on: 'desc' },
    });

    return { message: 'Expenses fetched', data: records };
  }

  // ─── Monthly food cost per student ───────────────────────────────────────────
  async getMonthlySummary(month: number, year: number) {
    const fees = await this.prisma.fee.findMany({
      where: { month, year },
      include: {
        student: { select: { id: true, name: true, hall_ticket_number: true } },
      },
      orderBy: { student: { name: 'asc' } },
    });

    return {
      message: 'Monthly summary fetched',
      data: fees.map((f) => ({
        student: f.student,
        food_fee: Number(f.food_fee),
        maintenance_fee: Number(f.maintenance_fee),
        total_amount: Number(f.total_amount),
        paid_amount: Number(f.paid_amount),
        balance_amount: Number(f.balance_amount),
        payment_status: f.payment_status,
        month: f.month,
        year: f.year,
      })),
    };
  }

  // ─── Pending payments per student ────────────────────────────────────────────
  async getPendingPayments() {
    const fees = await this.prisma.fee.findMany({
      where: { payment_status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
      include: {
        student: { select: { id: true, name: true, hall_ticket_number: true, phone: true } },
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    return { message: 'Pending payments fetched', data: fees };
  }

  // ─── Today's attendance list ──────────────────────────────────────────────────
  async getTodayAttendance(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await this.prisma.attendance.findMany({
      where: { date: { gte: targetDate, lt: nextDay } },
      include: {
        student: {
          select: {
            id: true, name: true, hall_ticket_number: true,
            department: { select: { department_code: true } },
          },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    return { message: 'Today attendance fetched', data: records };
  }
}
