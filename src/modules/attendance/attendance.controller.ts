import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, BulkAttendanceDto, AttendanceFilterDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Mark attendance for a student' })
  markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }

  @Post('bulk')
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Mark bulk attendance' })
  markBulk(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulk(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ATTENDER, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/ATTENDER] Get attendance records with filters' })
  findAll(@Query() filter: AttendanceFilterDto) {
    return this.attendanceService.findAll(filter);
  }

  @Get('my-attendance')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '[STUDENT] Get my attendance with summary' })
  @ApiQuery({ name: 'semesterId', required: false, type: Number })
  getMyAttendance(
    @CurrentUser() user: any,
    @Query('semesterId') semesterId?: number,
  ) {
    return this.attendanceService.getMyAttendance(user.id, semesterId ? +semesterId : undefined);
  }
}
