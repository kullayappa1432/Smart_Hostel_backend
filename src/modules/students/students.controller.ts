import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Create a student record' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Get all students with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'semesterId', required: false, type: Number })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('departmentId') departmentId?: number,
    @Query('semesterId') semesterId?: number,
  ) {
    return this.studentsService.findAll(+page, +limit, departmentId ? +departmentId : undefined, semesterId ? +semesterId : undefined);
  }

  @Get('hall-ticket/:hallTicket')
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Find student by hall ticket number' })
  findByHallTicket(@Param('hallTicket') hallTicket: string) {
    return this.studentsService.findByHallTicket(hallTicket);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Get student by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Update student details' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN only] Delete a student record' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(BigInt(id));
  }
}
