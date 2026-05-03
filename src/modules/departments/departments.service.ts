import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    const exists = await this.prisma.department.findUnique({
      where: { department_code: dto.department_code },
    });
    if (exists) throw new ConflictException('Department code already exists');

    const dept = await this.prisma.department.create({ data: dto });
    return { message: 'Department created', data: dept };
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      orderBy: { department_name: 'asc' },
    });
    return { message: 'Departments fetched', data: departments };
  }

  async findOne(id: number) {
    const dept = await this.prisma.department.findUnique({ where: { id: BigInt(id) } });
    if (!dept) throw new NotFoundException('Department not found');
    return { message: 'Department fetched', data: dept };
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.prisma.department.findUnique({ where: { id: BigInt(id) } });
    if (!dept) throw new NotFoundException('Department not found');

    const updated = await this.prisma.department.update({ where: { id: BigInt(id) }, data: dto });
    return { message: 'Department updated', data: updated };
  }

  async remove(id: number) {
    const dept = await this.prisma.department.findUnique({ where: { id: BigInt(id) } });
    if (!dept) throw new NotFoundException('Department not found');

    await this.prisma.department.delete({ where: { id: BigInt(id) } });
    return { message: 'Department deleted' };
  }
}
