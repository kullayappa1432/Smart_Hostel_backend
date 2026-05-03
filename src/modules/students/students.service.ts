import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const exists = await this.prisma.student.findUnique({
      where: { hall_ticket_number: dto.hall_ticket_number },
    });
    if (exists) throw new ConflictException('Hall ticket number already exists');

    const student = await this.prisma.student.create({
      data: {
        hall_ticket_number: dto.hall_ticket_number,
        name: dto.name,
        gender: dto.gender,
        course: dto.course,
        department_id: dto.department_id,
        semester_id: dto.semester_id,
      },
      include: { department: true, semester: true },
    });

    return { message: 'Student created successfully', data: student };
  }

  async findAll(page = 1, limit = 10, departmentId?: number, semesterId?: number) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (departmentId) where.department_id = departmentId;
    if (semesterId) where.semester_id = semesterId;

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: true,
          semester: true,
          user: { select: { email: true, is_active: true } },
          allocations: { include: { room: { include: { hostel: true } } } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      message: 'Students fetched',
      data: { students, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        department: true,
        semester: true,
        user: { select: { email: true, phone: true, is_active: true, last_login_at: true } },
        allocations: { include: { room: { include: { hostel: true } } } },
        fees: true,
        fee_payments: true,
        complaints: true,
      },
    });

    if (!student) throw new NotFoundException('Student not found');
    return { message: 'Student fetched', data: student };
  }

  async findByHallTicket(hallTicket: string) {
    const student = await this.prisma.student.findUnique({
      where: { hall_ticket_number: hallTicket },
      include: { department: true, semester: true },
    });

    if (!student) throw new NotFoundException('Student not found');
    return { message: 'Student fetched', data: student };
  }

  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.course && { course: dto.course }),
        ...(dto.department_id && { department_id: dto.department_id }),
        ...(dto.semester_id && { semester_id: dto.semester_id }),
      },
      include: { department: true, semester: true },
    });

    return { message: 'Student updated successfully', data: updated };
  }

  async remove(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }
}
