import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, RoomFilterDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    const exists = await this.prisma.room.findUnique({
      where: {
        hostel_id_room_number: {
          hostel_id: BigInt(dto.hostel_id),
          room_number: dto.room_number,
        },
      },
    });
    if (exists) throw new ConflictException('Room number already exists in this hostel');

    const room = await this.prisma.room.create({
      data: {
        room_number: dto.room_number,
        hostel_id: BigInt(dto.hostel_id),
        block_name: dto.block_name,
        floor_number: dto.floor_number,
        department_id: BigInt(dto.department_id),
        semester_id: BigInt(dto.semester_id),
        capacity: dto.capacity,
      },
      include: { hostel: true, department: true, semester: true },
    });

    return { message: 'Room created', data: room };
  }

  async findAll(filter: RoomFilterDto) {
    const where: any = {};
    if (filter.hostel_id) where.hostel_id = BigInt(filter.hostel_id);
    if (filter.department_id) where.department_id = BigInt(filter.department_id);
    if (filter.semester_id) where.semester_id = BigInt(filter.semester_id);
    if (filter.block_name) where.block_name = filter.block_name;
    if (filter.floor_number !== undefined) where.floor_number = filter.floor_number;
    if (filter.available !== undefined) where.available = filter.available;

    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        hostel: true,
        department: true,
        semester: true,
        _count: { select: { allocations: true } },
      },
      orderBy: [{ block_name: 'asc' }, { floor_number: 'asc' }, { room_number: 'asc' }],
    });

    // Group by block → floor for display
    const grouped = this.groupByBlockAndFloor(rooms);

    return { message: 'Rooms fetched', data: { rooms, grouped } };
  }

  async findAvailableForStudent(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: BigInt(studentId) },
      include: { department: true, semester: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Apply allocation rules: gender match, dept match, semester match, available
    const genderType = student.gender === 'MALE' ? 'BOYS' : 'GIRLS';

    const rooms = await this.prisma.room.findMany({
      where: {
        available: true,
        department_id: student.department_id,
        semester_id: student.semester_id,
        hostel: { gender_type: genderType },
      },
      include: {
        hostel: true,
        department: true,
        semester: true,
      },
      orderBy: [{ block_name: 'asc' }, { floor_number: 'asc' }, { room_number: 'asc' }],
    });

    const grouped = this.groupByBlockAndFloor(rooms);
    return { message: 'Available rooms fetched', data: { rooms, grouped } };
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id: BigInt(id) },
      include: {
        hostel: true,
        department: true,
        semester: true,
        allocations: {
          include: { student: true },
        },
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    return { message: 'Room fetched', data: room };
  }

  async update(id: number, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id: BigInt(id) } });
    if (!room) throw new NotFoundException('Room not found');

    const updated = await this.prisma.room.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.room_number && { room_number: dto.room_number }),
        ...(dto.hostel_id && { hostel_id: BigInt(dto.hostel_id) }),
        ...(dto.block_name && { block_name: dto.block_name }),
        ...(dto.floor_number !== undefined && { floor_number: dto.floor_number }),
        ...(dto.department_id && { department_id: BigInt(dto.department_id) }),
        ...(dto.semester_id && { semester_id: BigInt(dto.semester_id) }),
        ...(dto.capacity && { capacity: dto.capacity }),
      },
      include: { hostel: true, department: true, semester: true },
    });

    return { message: 'Room updated', data: updated };
  }

  async remove(id: number) {
    const room = await this.prisma.room.findUnique({ where: { id: BigInt(id) } });
    if (!room) throw new NotFoundException('Room not found');

    await this.prisma.room.delete({ where: { id: BigInt(id) } });
    return { message: 'Room deleted' };
  }

  // ─── Helper: Group rooms by block → floor ────────────────────────────────────

  private groupByBlockAndFloor(rooms: any[]) {
    const grouped: Record<string, Record<number, any[]>> = {};

    for (const room of rooms) {
      if (!grouped[room.block_name]) grouped[room.block_name] = {};
      if (!grouped[room.block_name][room.floor_number]) {
        grouped[room.block_name][room.floor_number] = [];
      }
      grouped[room.block_name][room.floor_number].push(room);
    }

    return grouped;
  }
}
