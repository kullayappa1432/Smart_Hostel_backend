import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeePaymentDto, GetFeePaymentsQueryDto } from './dto/fee-payment.dto';
import * as crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');

@Injectable()
export class FeePaymentsService {
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_key',
      key_secret: this.config.get<string>('RAZORPAY_KEY_SECRET') || 'secret',
    });
  }

  // ─── Create Razorpay Order ────────────────────────────────────────────────────
  async createRazorpayOrder(feeId: number, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    const studentId = user?.student_id;
    if (!studentId) throw new BadRequestException('No student profile linked');

    const fee = await this.prisma.fee.findUnique({
      where: { id: BigInt(feeId) },
      include: { student: { select: { name: true, email: true, phone: true } } },
    });

    if (!fee) throw new NotFoundException('Fee not found');
    if (fee.student_id !== studentId) throw new BadRequestException('Unauthorized');
    if (Number(fee.balance_amount) <= 0) throw new BadRequestException('No balance due');

    const keyId = this.config.get<string>('RAZORPAY_KEY_ID') || '';
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET') || '';

    // Check if real Razorpay keys are configured
    const hasRealKeys =
      keyId.startsWith('rzp_') &&
      !keyId.includes('your_key') &&
      keySecret.length > 10 &&
      !keySecret.includes('your_razorpay');

    if (!hasRealKeys) {
      // Return a mock order for development/testing without real Razorpay keys
      return {
        order_id: `mock_order_${Date.now()}`,
        amount: Math.round(Number(fee.balance_amount) * 100),
        currency: 'INR',
        key_id: 'rzp_test_mock',
        fee_id: feeId.toString(),
        student_name: fee.student.name,
        student_email: fee.student.email,
        student_phone: fee.student.phone,
        is_mock: true,
        message: 'Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env',
      };
    }

    const amountInPaise = Math.round(Number(fee.balance_amount) * 100);

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `fee_${feeId}_${Date.now()}`,
        notes: {
          fee_id: feeId.toString(),
          student_id: studentId.toString(),
          student_name: fee.student.name,
        },
      });

      return {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
        fee_id: feeId.toString(),
        student_name: fee.student.name,
        student_email: fee.student.email,
        student_phone: fee.student.phone,
        is_mock: false,
      };
    } catch (err: any) {
      const message = err?.error?.description || err?.message || 'Razorpay order creation failed';
      throw new BadRequestException(`Payment gateway error: ${message}`);
    }
  }

  // ─── Verify & Record Razorpay Payment ────────────────────────────────────────
  async verifyAndRecord(
    feeId: number,
    userId: number,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    const studentId = user?.student_id;
    if (!studentId) throw new BadRequestException('No student profile linked');

    // Verify Razorpay signature
    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET') || '';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const fee = await this.prisma.fee.findUnique({ where: { id: BigInt(feeId) } });
    if (!fee) throw new NotFoundException('Fee not found');

    const amount = Number(fee.balance_amount);

    // Record payment
    await this.prisma.feePayment.create({
      data: {
        fee_id: BigInt(feeId),
        student_id: studentId,
        amount,
        payment_method: 'RAZORPAY',
        transaction_id: razorpay_payment_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paid_on: new Date(),
        remarks: 'Paid via Razorpay',
      },
    });

    // Update fee to PAID
    await this.prisma.fee.update({
      where: { id: BigInt(feeId) },
      data: {
        paid_amount: Number(fee.paid_amount) + amount,
        balance_amount: 0,
        payment_status: 'PAID',
      },
    });

    return { success: true, payment_id: razorpay_payment_id, amount };
  }

  // ─── Manual payment (admin) ───────────────────────────────────────────────────
  async create(createFeePaymentDto: CreateFeePaymentDto) {
    const fee = await this.prisma.fee.findUnique({
      where: { id: BigInt(createFeePaymentDto.fee_id) },
    });

    if (!fee) throw new NotFoundException('Fee not found');

    if (createFeePaymentDto.amount > Number(fee.balance_amount)) {
      throw new BadRequestException('Payment amount exceeds balance amount');
    }

    const payment = await this.prisma.feePayment.create({
      data: {
        ...createFeePaymentDto,
        fee_id: BigInt(createFeePaymentDto.fee_id),
        student_id: BigInt(createFeePaymentDto.student_id),
      },
      include: {
        student: {
          select: { id: true, hall_ticket_number: true, name: true, email: true, phone: true },
        },
        fee: true,
      },
    });

    const newPaidAmount = Number(fee.paid_amount) + createFeePaymentDto.amount;
    const newBalanceAmount = Number(fee.total_amount) - newPaidAmount;

    await this.prisma.fee.update({
      where: { id: BigInt(createFeePaymentDto.fee_id) },
      data: {
        paid_amount: newPaidAmount,
        balance_amount: newBalanceAmount,
        payment_status: newBalanceAmount === 0 ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING',
      },
    });

    return payment;
  }

  // ─── List all payments ────────────────────────────────────────────────────────
  async findAll(query: GetFeePaymentsQueryDto) {
    const where: any = {};
    if (query.student_id) where.student_id = BigInt(query.student_id);
    if (query.fee_id) where.fee_id = BigInt(query.fee_id);
    if (query.payment_method) where.payment_method = query.payment_method;

    return this.prisma.feePayment.findMany({
      where,
      include: {
        student: {
          select: { id: true, hall_ticket_number: true, name: true, email: true, phone: true },
        },
        fee: {
          select: { id: true, month: true, year: true, total_amount: true, balance_amount: true },
        },
      },
      orderBy: { paid_on: 'desc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.feePayment.findUnique({
      where: { id: BigInt(id) },
      include: {
        student: {
          select: { id: true, hall_ticket_number: true, name: true, email: true, phone: true },
        },
        fee: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    const fee = await this.prisma.fee.findUnique({ where: { id: payment.fee_id } });

    if (fee) {
      const newPaidAmount = Number(fee.paid_amount) - Number(payment.amount);
      const newBalanceAmount = Number(fee.total_amount) - newPaidAmount;
      await this.prisma.fee.update({
        where: { id: payment.fee_id },
        data: {
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          payment_status: newBalanceAmount === Number(fee.total_amount) ? 'PENDING' : 'PARTIAL',
        },
      });
    }

    return this.prisma.feePayment.delete({ where: { id: BigInt(id) } });
  }

  // ─── Payment history for a student (by user id) ───────────────────────────────
  async getPaymentHistory(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    const studentId = user?.student_id;
    if (!studentId) return [];

    return this.prisma.feePayment.findMany({
      where: { student_id: studentId },
      include: {
        fee: { select: { id: true, month: true, year: true, total_amount: true } },
      },
      orderBy: { paid_on: 'desc' },
    });
  }
}
