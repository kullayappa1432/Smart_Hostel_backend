import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarkAttendanceDto, BulkAttendanceDto, AttendanceFilterDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(dto: MarkAttendanceDto) {
    const attendance = await this.prisma.attendance.upsert({
      where: {
        student_id_date: {
          student_id: BigInt(dto.student_id),
          date: new Date(dto.date),
        },
      },
      create: {
        student_id: BigInt(dto.student_id),
        semester_id: BigInt(dto.semester_id),
        date: new Date(dto.date),
        status: dto.status,
      },
      update: { status: dto.status },
      include: { student: true },
    });

    return { message: 'Attendance marked', data: attendance };
  }

  async markBulk(dto: BulkAttendanceDto) {
    const results = await Promise.all(dto.records.map((r) => this.markAttendance(r)));
    return { message: `${results.length} attendance records marked`, data: results };
  }

  async findAll(filter: AttendanceFilterDto) {
    const where: any = {};
    if (filter.student_id) where.student_id = BigInt(filter.student_id);
    if (filter.semester_id) where.semester_id = BigInt(filter.semester_id);
    if (filter.from_date || filter.to_date) {
      where.date = {};
      if (filter.from_date) where.date.gte = new Date(filter.from_date);
      if (filter.to_date) where.date.lte = new Date(filter.to_date);
    }

    const records = await this.prisma.attendance.findMany({
      where,
      include: { student: { select: { name: true, hall_ticket_number: true } } },
      orderBy: { date: 'desc' },
    });

    return { message: 'Attendance records fetched', data: records };
  }

  async getMyAttendance(userId: bigint, semesterId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.student_id) throw new ForbiddenException('No student profile linked');

    const where: any = { student_id: user.student_id };
    if (semesterId) where.semester_id = BigInt(semesterId);

    const records = await this.prisma.attendance.findMany({
      where,
      include: { semester: true },
      orderBy: { date: 'desc' },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

    return {
      message: 'Attendance fetched',
      data: { records, summary: { total, present, absent, percentage: `${percentage}%` } },
    };
  }
}
