import {
  Controller, Get, Post, Patch,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintStatusDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, ComplaintType, ComplaintStatus } from '@prisma/client';

@ApiTags('Complaints')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '[STUDENT] Submit a complaint (ragging/room/bathroom)' })
  create(@CurrentUser() user: any, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.WARDEN, Role.ATTENDER)
  @ApiOperation({ summary: '[ADMIN/WARDEN/ATTENDER] Get all complaints with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ComplaintType })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.complaintsService.findAll(+page, +limit, type, status);
  }

  @Get('my-complaints')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '[STUDENT] Get my complaints' })
  getMyComplaints(@CurrentUser() user: any) {
    return this.complaintsService.getMyComplaints(user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.WARDEN, Role.ATTENDER)
  @ApiOperation({ summary: '[ADMIN/WARDEN/ATTENDER] Get complaint by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.WARDEN)
  @ApiOperation({ summary: '[ADMIN/WARDEN] Update complaint status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(id, dto);
  }
}
