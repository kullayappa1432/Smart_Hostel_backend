import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHostelDto, UpdateHostelDto } from './dto/hostel.dto';

@Injectable()
export class HostelsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHostelDto) {
    const hostel = await this.prisma.hostel.create({ data: dto });
    return { message: 'Hostel created', data: hostel };
  }

  async findAll() {
    const hostels = await this.prisma.hostel.findMany({
      include: { _count: { select: { rooms: true } } },
      orderBy: { hostel_name: 'asc' },
    });
    return { message: 'Hostels fetched', data: hostels };
  }

  async findOne(id: number) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id },
      include: {
        rooms: {
          include: { department: true, semester: true },
          orderBy: [{ block_name: 'asc' }, { floor_number: 'asc' }, { room_number: 'asc' }],
        },
      },
    });
    if (!hostel) throw new NotFoundException('Hostel not found');
    return { message: 'Hostel fetched', data: hostel };
  }

  async update(id: number, dto: UpdateHostelDto) {
    const hostel = await this.prisma.hostel.findUnique({ where: { id } });
    if (!hostel) throw new NotFoundException('Hostel not found');

    const updated = await this.prisma.hostel.update({ where: { id }, data: dto });
    return { message: 'Hostel updated', data: updated };
  }

  async remove(id: number) {
    const hostel = await this.prisma.hostel.findUnique({ where: { id } });
    if (!hostel) throw new NotFoundException('Hostel not found');

    await this.prisma.hostel.delete({ where: { id } });
    return { message: 'Hostel deleted' };
  }
}
