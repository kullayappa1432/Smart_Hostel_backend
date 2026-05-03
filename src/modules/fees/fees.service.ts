import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeeDto, UpdateFeeDto, GetFeesQueryDto } from './dto/fee.dto';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async create(createFeeDto: CreateFeeDto) {
    // Check if fee already exists for this student, month, and year
    const existingFee = await this.prisma.fee.findUnique({
      where: {
        student_id_month_year: {
          student_id: createFeeDto.student_id,
          month: createFeeDto.month,
          year: createFeeDto.year,
        },
      },
    });

    if (existingFee) {
      throw new BadRequestException('Fee already exists for this student, month, and year');
    }

    // Calculate total amount
    const total_amount =
      createFeeDto.room_rent +
      (createFeeDto.food_fee || 0) +
      (createFeeDto.electricity_fee || 0) +
      (createFeeDto.water_fee || 0) +
      (createFeeDto.maintenance_fee || 0) +
      (createFeeDto.fine || 0) +
      (createFeeDto.previous_due || 0) -
      (createFeeDto.discount || 0);

    const balance_amount = total_amount;

    return this.prisma.fee.create({
      data: {
        ...createFeeDto,
        total_amount: total_amount,
        paid_amount: 0,
        balance_amount: balance_amount,
        payment_status: 'PENDING',
        due_date: new Date(createFeeDto.due_date),
      },
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(query: GetFeesQueryDto) {
    const where: any = {};

    if (query.student_id) {
      where.student_id = query.student_id;
    }

    if (query.month) {
      where.month = query.month;
    }

    if (query.year) {
      where.year = query.year;
    }

    if (query.payment_status) {
      where.payment_status = query.payment_status;
    }

    return this.prisma.fee.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: bigint) {
    const fee = await this.prisma.fee.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            email: true,
            phone: true,
            department: true,
            semester: true,
          },
        },
        payments: {
          orderBy: { paid_on: 'desc' },
        },
      },
    });

    if (!fee) {
      throw new NotFoundException('Fee not found');
    }

    return fee;
  }

  async update(id: bigint, updateFeeDto: UpdateFeeDto) {
    const fee = await this.findOne(id);

    // Recalculate total if any fee component is updated
    if (
      updateFeeDto.room_rent !== undefined ||
      updateFeeDto.food_fee !== undefined ||
      updateFeeDto.electricity_fee !== undefined ||
      updateFeeDto.water_fee !== undefined ||
      updateFeeDto.maintenance_fee !== undefined ||
      updateFeeDto.fine !== undefined ||
      updateFeeDto.previous_due !== undefined ||
      updateFeeDto.discount !== undefined
    ) {
      const total_amount_num =
        (updateFeeDto.room_rent !== undefined ? updateFeeDto.room_rent : Number(fee.room_rent)) +
        (updateFeeDto.food_fee !== undefined ? updateFeeDto.food_fee : Number(fee.food_fee)) +
        (updateFeeDto.electricity_fee !== undefined
          ? updateFeeDto.electricity_fee
          : Number(fee.electricity_fee)) +
        (updateFeeDto.water_fee !== undefined ? updateFeeDto.water_fee : Number(fee.water_fee)) +
        (updateFeeDto.maintenance_fee !== undefined
          ? updateFeeDto.maintenance_fee
          : Number(fee.maintenance_fee)) +
        (updateFeeDto.fine !== undefined ? updateFeeDto.fine : Number(fee.fine)) +
        (updateFeeDto.previous_due !== undefined
          ? updateFeeDto.previous_due
          : Number(fee.previous_due)) -
        (updateFeeDto.discount !== undefined ? updateFeeDto.discount : Number(fee.discount));

      const balance_amount = total_amount_num - Number(fee.paid_amount);

      return this.prisma.fee.update({
        where: { id },
        data: {
          ...updateFeeDto,
          total_amount: total_amount_num,
          balance_amount: balance_amount,
          due_date: updateFeeDto.due_date ? new Date(updateFeeDto.due_date) : undefined,
        },
        include: {
          student: {
            select: {
              id: true,
              hall_ticket_number: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          payments: true,
        },
      });
    }

    const balance_amount = Number(fee.total_amount) - Number(fee.paid_amount);

    return this.prisma.fee.update({
      where: { id },
      data: {
        ...updateFeeDto,
        balance_amount,
        due_date: updateFeeDto.due_date ? new Date(updateFeeDto.due_date) : undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);
    return this.prisma.fee.delete({ where: { id } });
  }

  // Get pending fees for a student
  async getPendingFees(studentId: bigint) {
    return this.prisma.fee.findMany({
      where: {
        student_id: studentId,
        payment_status: {
          in: ['PENDING', 'PARTIAL', 'OVERDUE'],
        },
      },
      include: {
        payments: true,
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
  }

  // Get fee summary for a student
  async getFeeSummary(studentId: bigint) {
    const fees = await this.prisma.fee.findMany({
      where: { student_id: studentId },
    });

    const totalDue = fees.reduce((sum, fee) => sum + Number(fee.balance_amount), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + Number(fee.paid_amount), 0);
    const totalAmount = fees.reduce((sum, fee) => sum + Number(fee.total_amount), 0);

    return {
      total_amount: totalAmount,
      total_paid: totalPaid,
      total_due: totalDue,
      pending_count: fees.filter((f) => f.payment_status === 'PENDING').length,
      overdue_count: fees.filter((f) => f.payment_status === 'OVERDUE').length,
    };
  }
}
