import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveDto,
  GetLeaveRequestsQueryDto,
} from './dto/leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto) {
    const fromDate = new Date(createLeaveRequestDto.from_date);
    const toDate = new Date(createLeaveRequestDto.to_date);

    if (toDate < fromDate) {
      throw new BadRequestException('To date must be after from date');
    }

    return this.prisma.leaveRequest.create({
      data: {
        ...createLeaveRequestDto,
        from_date: fromDate,
        to_date: toDate,
        status: 'PENDING',
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

  async findAll(query: GetLeaveRequestsQueryDto) {
    const where: any = {};

    if (query.student_id) {
      where.student_id = query.student_id;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.leaveRequest.findMany({
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
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: bigint) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
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
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    return leaveRequest;
  }

  async update(id: bigint, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    await this.findOne(id);

    const data: any = { ...updateLeaveRequestDto };

    if (updateLeaveRequestDto.from_date) {
      data.from_date = new Date(updateLeaveRequestDto.from_date);
    }

    if (updateLeaveRequestDto.to_date) {
      data.to_date = new Date(updateLeaveRequestDto.to_date);
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data,
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
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  }

  async approve(id: bigint, approveLeaveDto: ApproveLeaveDto, approverId: bigint) {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== 'PENDING') {
      throw new BadRequestException('Leave request is not pending');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: approveLeaveDto.status,
        remarks: approveLeaveDto.remarks,
        approved_by: approverId,
        approved_at: new Date(),
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
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);
    return this.prisma.leaveRequest.delete({ where: { id } });
  }

  // Get pending leave requests
  async getPendingRequests() {
    return this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
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
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // Get active leaves (approved and current)
  async getActiveLeaves() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        from_date: { lte: today },
        to_date: { gte: today },
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
      orderBy: { from_date: 'asc' },
    });
  }
}
