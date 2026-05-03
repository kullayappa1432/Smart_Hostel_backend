import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAllocationDto, StudentSelfAllocateDto } from './dto/allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin: Allocate any student to any room ──────────────────────────────────

  async adminAllocate(dto: CreateAllocationDto) {
    const studentId = BigInt(dto.student_id);
    const roomId = BigInt(dto.room_id);

    await this.validateAllocation(studentId, roomId);

    const allocation = await this.prisma.$transaction(async (tx) => {
      const alloc = await tx.allocation.create({
        data: { student_id: studentId, room_id: roomId },
        include: { student: true, room: { include: { hostel: true } } },
      });

      await tx.room.update({
        where: { id: roomId },
        data: {
          occupied_count: { increment: 1 },
        },
      });

      // Update availability
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (room && room.occupied_count >= room.capacity) {
        await tx.room.update({ where: { id: roomId }, data: { available: false } });
      }

      return alloc;
    });

    return { message: 'Room allocated successfully', data: allocation };
  }

  // ─── Student: Self-allocate ───────────────────────────────────────────────────

  async studentSelfAllocate(userId: number, dto: StudentSelfAllocateDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: { student: true },
    });

    if (!user?.student_id) throw new ForbiddenException('No student profile linked to this account');

    const studentId = user.student_id;
    const roomId = BigInt(dto.room_id);

    await this.validateAllocation(studentId, roomId);

    const allocation = await this.prisma.$transaction(async (tx) => {
      const alloc = await tx.allocation.create({
        data: { student_id: studentId, room_id: roomId },
        include: { student: true, room: { include: { hostel: true } } },
      });

      await tx.room.update({
        where: { id: roomId },
        data: { occupied_count: { increment: 1 } },
      });

      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (room && room.occupied_count >= room.capacity) {
        await tx.room.update({ where: { id: roomId }, data: { available: false } });
      }

      return alloc;
    });

    return { message: 'Room allocated successfully', data: allocation };
  }

  // ─── Get all allocations ──────────────────────────────────────────────────────

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [allocations, total] = await Promise.all([
      this.prisma.allocation.findMany({
        skip,
        take: limit,
        include: {
          student: { include: { department: true, semester: true } },
          room: { include: { hostel: true } },
        },
        orderBy: { allocated_date: 'desc' },
      }),
      this.prisma.allocation.count(),
    ]);

    return {
      message: 'Allocations fetched',
      data: { allocations, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get my allocation (student) ─────────────────────────────────────────────

  async getMyAllocation(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user?.student_id) {
      return { message: 'No student profile found', data: null };
    }

    const allocation = await this.prisma.allocation.findUnique({
      where: { student_id: user.student_id },
      include: { room: { include: { hostel: true, department: true, semester: true } } },
    });

    // Return null data instead of throwing — frontend handles "not allocated" state
    return { message: allocation ? 'Allocation fetched' : 'No room allocated yet', data: allocation };
  }

  // ─── Deallocate ───────────────────────────────────────────────────────────────

  async deallocate(id: number) {
    const allocation = await this.prisma.allocation.findUnique({ where: { id: BigInt(id) } });
    if (!allocation) throw new NotFoundException('Allocation not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.allocation.delete({ where: { id: BigInt(id) } });

      await tx.room.update({
        where: { id: allocation.room_id },
        data: {
          occupied_count: { decrement: 1 },
          available: true,
        },
      });
    });

    return { message: 'Room deallocated successfully' };
  }

  // ─── Validation Logic ─────────────────────────────────────────────────────────

  private async validateAllocation(studentId: bigint, roomId: bigint) {
    // Check student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { department: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Check student not already allocated
    const existingAllocation = await this.prisma.allocation.findUnique({
      where: { student_id: studentId },
    });
    if (existingAllocation) throw new ConflictException('Student already has a room allocated');

    // Check room exists and is available
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { hostel: true, department: true, semester: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (!room.available) throw new BadRequestException('Room is not available');
    if (room.occupied_count >= room.capacity) throw new BadRequestException('Room is full');

    // Rule 1: Gender match
    const expectedGender = student.gender === 'MALE' ? 'BOYS' : 'GIRLS';
    if (room.hostel.gender_type !== expectedGender) {
      throw new BadRequestException(
        `Gender mismatch: Student is ${student.gender}, hostel is for ${room.hostel.gender_type}`,
      );
    }

    // Rule 2: Department match
    if (room.department_id !== student.department_id) {
      throw new BadRequestException('Room department does not match student department');
    }

    // Rule 3: Semester match
    if (room.semester_id !== student.semester_id) {
      throw new BadRequestException('Room semester does not match student semester');
    }
  }
}
