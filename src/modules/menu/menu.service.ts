import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuDto) {
    const exists = await this.prisma.menu.findUnique({ where: { date: new Date(dto.date) } });
    if (exists) throw new ConflictException('Menu already exists for this date');

    const menu = await this.prisma.menu.create({
      data: { ...dto, date: new Date(dto.date) },
    });
    return { message: 'Menu created', data: menu };
  }

  async findAll(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const menus = await this.prisma.menu.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    return { message: 'Menus fetched', data: menus };
  }

  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const menu = await this.prisma.menu.findUnique({ where: { date: today } });
    if (!menu) throw new NotFoundException('No menu found for today');
    return { message: "Today's menu fetched", data: menu };
  }

  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');

    const updated = await this.prisma.menu.update({
      where: { id },
      data: { ...dto, ...(dto.date && { date: new Date(dto.date) }) },
    });
    return { message: 'Menu updated', data: updated };
  }

  async remove(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');

    await this.prisma.menu.delete({ where: { id } });
    return { message: 'Menu deleted' };
  }
}
