import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitorDto, CheckOutVisitorDto, GetVisitorsQueryDto } from './dto/visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitorDto: CreateVisitorDto) {
    return this.prisma.visitor.create({
      data: createVisitorDto,
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            room_number: true,
            block_name: true,
            floor_number: true,
          },
        },
      },
    });
  }

  async findAll(query: GetVisitorsQueryDto) {
    const where: any = {};

    if (query.student_id) {
      where.student_id = query.student_id;
    }

    if (query.room_id) {
      where.room_id = query.room_id;
    }

    if (query.checked_out === 'true') {
      where.check_out_time = { not: null };
    } else if (query.checked_out === 'false') {
      where.check_out_time = null;
    }

    return this.prisma.visitor.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            room_number: true,
            block_name: true,
            floor_number: true,
          },
        },
      },
      orderBy: { check_in_time: 'desc' },
    });
  }

  async findOne(id: bigint) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            room_number: true,
            block_name: true,
            floor_number: true,
            hostel: {
              select: {
                hostel_name: true,
              },
            },
          },
        },
      },
    });

    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }

    return visitor;
  }

  async checkOut(id: bigint, checkOutVisitorDto: CheckOutVisitorDto) {
    await this.findOne(id);

    return this.prisma.visitor.update({
      where: { id },
      data: {
        check_out_time: new Date(checkOutVisitorDto.check_out_time),
      },
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            room_number: true,
            block_name: true,
            floor_number: true,
          },
        },
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);
    return this.prisma.visitor.delete({ where: { id } });
  }

  // Get active visitors (not checked out)
  async getActiveVisitors() {
    return this.prisma.visitor.findMany({
      where: { check_out_time: null },
      include: {
        student: {
          select: {
            id: true,
            hall_ticket_number: true,
            name: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            room_number: true,
            block_name: true,
            floor_number: true,
            hostel: {
              select: {
                hostel_name: true,
              },
            },
          },
        },
      },
      orderBy: { check_in_time: 'asc' },
    });
  }

  // Get visitor history for a student
  async getVisitorHistory(studentId: bigint) {
    return this.prisma.visitor.findMany({
      where: { student_id: studentId },
      include: {
        room: {
          select: {
            id: true,
            room_number: true,
            block_name: true,
            floor_number: true,
          },
        },
      },
      orderBy: { check_in_time: 'desc' },
    });
  }
}
