import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintStatusDto } from './dto/complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateComplaintDto) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user?.student_id) throw new ForbiddenException('No student profile linked');

    const complaint = await this.prisma.complaint.create({
      data: {
        student_id: user.student_id,
        title: dto.title,
        type: dto.type,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        room_id: dto.room_id ? BigInt(dto.room_id) : undefined,
        file_url: dto.file_url,
        status: 'OPEN',
      },
      include: { student: { select: { name: true, hall_ticket_number: true } } },
    });

    return { message: 'Complaint submitted successfully', data: complaint };
  }

  async findAll(page = 1, limit = 10, type?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: { select: { name: true, hall_ticket_number: true, department: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      message: 'Complaints fetched',
      data: { complaints, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: BigInt(id) },
      include: { student: { include: { department: true } } },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return { message: 'Complaint fetched', data: complaint };
  }

  async getMyComplaints(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user?.student_id) throw new ForbiddenException('No student profile linked');

    const complaints = await this.prisma.complaint.findMany({
      where: { student_id: user.student_id },
      orderBy: { created_at: 'desc' },
    });

    return { message: 'My complaints fetched', data: complaints };
  }

  async updateStatus(id: number, dto: UpdateComplaintStatusDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id: BigInt(id) } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const updated = await this.prisma.complaint.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolved_at: dto.status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    return { message: 'Complaint status updated', data: updated };
  }
}
