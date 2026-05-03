import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

@Injectable()
export class SemestersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSemesterDto) {
    const exists = await this.prisma.semester.findUnique({
      where: {
        semester_number_academic_year: {
          semester_number: dto.semester_number,
          academic_year: dto.academic_year,
        },
      },
    });
    if (exists) throw new ConflictException('Semester already exists for this academic year');

    const semester = await this.prisma.semester.create({ data: dto });
    return { message: 'Semester created', data: semester };
  }

  async findAll() {
    const semesters = await this.prisma.semester.findMany({
      orderBy: [{ academic_year: 'desc' }, { semester_number: 'asc' }],
    });
    return { message: 'Semesters fetched', data: semesters };
  }

  async findActive() {
    const semester = await this.prisma.semester.findFirst({ where: { is_active: true } });
    if (!semester) throw new NotFoundException('No active semester found');
    return { message: 'Active semester fetched', data: semester };
  }

  async findOne(id: number) {
    const semester = await this.prisma.semester.findUnique({ where: { id: BigInt(id) } });
    if (!semester) throw new NotFoundException('Semester not found');
    return { message: 'Semester fetched', data: semester };
  }

  async update(id: number, dto: UpdateSemesterDto) {
    const semester = await this.prisma.semester.findUnique({ where: { id: BigInt(id) } });
    if (!semester) throw new NotFoundException('Semester not found');

    // If setting active, deactivate others first
    if (dto.is_active) {
      await this.prisma.semester.updateMany({ data: { is_active: false } });
    }

    const updated = await this.prisma.semester.update({ where: { id: BigInt(id) }, data: dto });
    return { message: 'Semester updated', data: updated };
  }

  async remove(id: number) {
    const semester = await this.prisma.semester.findUnique({ where: { id: BigInt(id) } });
    if (!semester) throw new NotFoundException('Semester not found');

    await this.prisma.semester.delete({ where: { id: BigInt(id) } });
    return { message: 'Semester deleted' };
  }
}
