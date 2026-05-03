import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto, UpdateUserStatusDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, role?: string) {
    const skip = (page - 1) * limit;
    const where = role ? { role: role as any } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          uuid: true,
          role: true,
          full_name: true,
          email: true,
          phone: true,
          is_active: true,
          last_login_at: true,
          created_at: true,
          student: { select: { hall_ticket_number: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      message: 'Users fetched',
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        student: { include: { department: true, semester: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { password_hash, reset_token_hash, ...safeUser } = user;
    return { message: 'User fetched', data: safeUser };
  }

  async createAdmin(dto: CreateAdminDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        uuid: uuidv4(),
        role: 'ADMIN',
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password_hash,
      },
    });

    const { password_hash: _, reset_token_hash, ...safeUser } = user;
    return { message: 'Admin created successfully', data: safeUser };
  }

  async updateStatus(id: bigint, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { is_active: dto.is_active },
    });

    return {
      message: `User ${dto.is_active ? 'activated' : 'deactivated'} successfully`,
      data: { id: updated.id, is_active: updated.is_active },
    };
  }

  async remove(id: bigint) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
