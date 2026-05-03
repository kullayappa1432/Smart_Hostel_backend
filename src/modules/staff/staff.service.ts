import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStaffDto) {
    const exists = await this.prisma.staff.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Staff email already exists');

    const staff = await this.prisma.staff.create({ data: dto });
    return { message: 'Staff created', data: staff };
  }

  async findAll() {
    const staff = await this.prisma.staff.findMany({ orderBy: { name: 'asc' } });
    return { message: 'Staff fetched', data: staff };
  }

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({ where: { id: BigInt(id) } });
    if (!staff) throw new NotFoundException('Staff not found');
    return { message: 'Staff fetched', data: staff };
  }

  async update(id: number, dto: UpdateStaffDto) {
    const staff = await this.prisma.staff.findUnique({ where: { id: BigInt(id) } });
    if (!staff) throw new NotFoundException('Staff not found');

    const updated = await this.prisma.staff.update({ where: { id: BigInt(id) }, data: dto });
    return { message: 'Staff updated', data: updated };
  }

  async remove(id: number) {
    const staff = await this.prisma.staff.findUnique({ where: { id: BigInt(id) } });
    if (!staff) throw new NotFoundException('Staff not found');

    await this.prisma.staff.delete({ where: { id: BigInt(id) } });
    return { message: 'Staff deleted' };
  }
}
