import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveDto,
  GetLeaveRequestsQueryDto,
} from './dto/leave-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('leave-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
  @Roles('STUDENT', 'ADMIN')
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto, @CurrentUser() user: any) {
    // Students can only create leave requests for themselves
    if (user.role === 'STUDENT') {
      createLeaveRequestDto.student_id = user.student_id;
    }
    return this.leaveRequestsService.create(createLeaveRequestDto);
  }

  @Get()
  @Roles('ADMIN', 'WARDEN', 'STUDENT')
  findAll(@Query() query: GetLeaveRequestsQueryDto, @CurrentUser() user: any) {
    // Students can only see their own leave requests
    if (user.role === 'STUDENT') {
      query.student_id = user.student_id;
    }
    return this.leaveRequestsService.findAll(query);
  }

  @Get('pending')
  @Roles('ADMIN', 'WARDEN')
  getPendingRequests() {
    return this.leaveRequestsService.getPendingRequests();
  }

  @Get('active')
  @Roles('ADMIN', 'WARDEN', 'ATTENDER')
  getActiveLeaves() {
    return this.leaveRequestsService.getActiveLeaves();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.leaveRequestsService.findOne(id);
  }

  @Patch(':id')
  @Roles('STUDENT', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.leaveRequestsService.update(id, updateLeaveRequestDto);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'WARDEN')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @CurrentUser() user: any,
  ) {
    return this.leaveRequestsService.approve(id, approveLeaveDto, user.id);
  }

  @Delete(':id')
  @Roles('STUDENT', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestsService.remove(id);
  }
}
