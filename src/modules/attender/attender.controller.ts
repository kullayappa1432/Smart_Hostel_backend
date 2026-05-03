import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AttenderService } from './attender.service';
import { 
  CreateExpenseDto, 
  GetExpensesQueryDto, 
  AttenderDashboardQueryDto,
  CreateAttenderDto,
  UpdateAttenderDto,
  GetAttendersQueryDto
} from './dto/attender.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('attender')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttenderController {
  constructor(private readonly attenderService: AttenderService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTENDER STAFF MANAGEMENT (CRUD) - ADMIN ONLY
  // ═══════════════════════════════════════════════════════════════════════════

  // Create new attender
  @Post('staff')
  @Roles('ADMIN')
  createAttender(@Body() dto: CreateAttenderDto) {
    return this.attenderService.createAttender(dto);
  }

  // Get all attenders
  @Get('staff')
  @Roles('ADMIN', 'WARDEN')
  getAllAttenders(@Query() query: GetAttendersQueryDto) {
    return this.attenderService.getAllAttenders(query);
  }

  // Get attender by ID
  @Get('staff/:id')
  @Roles('ADMIN', 'WARDEN')
  getAttenderById(@Param('id', ParseIntPipe) id: number) {
    return this.attenderService.getAttenderById(id);
  }

  // Update attender
  @Put('staff/:id')
  @Roles('ADMIN')
  updateAttender(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttenderDto,
  ) {
    return this.attenderService.updateAttender(id, dto);
  }

  // Delete attender
  @Delete('staff/:id')
  @Roles('ADMIN')
  deleteAttender(@Param('id', ParseIntPipe) id: number) {
    return this.attenderService.deleteAttender(id);
  }

  // Toggle attender active status
  @Put('staff/:id/toggle-status')
  @Roles('ADMIN')
  toggleAttenderStatus(@Param('id', ParseIntPipe) id: number) {
    return this.attenderService.toggleAttenderStatus(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPENSE TRACKING & DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  // Dashboard summary
  @Get('dashboard')
  @Roles('ADMIN', 'ATTENDER', 'WARDEN')
  getDashboard(@Query('date') date?: string) {
    return this.attenderService.getDashboardSummary(date);
  }

  // Record food/maintenance expense
  @Post('expenses')
  @Roles('ADMIN', 'ATTENDER', 'WARDEN')
  recordExpense(@Body() dto: CreateExpenseDto) {
    return this.attenderService.recordExpense(dto);
  }

  // Get expense list with filters
  @Get('expenses')
  @Roles('ADMIN', 'ATTENDER', 'WARDEN')
  getExpenses(@Query() query: GetExpensesQueryDto) {
    return this.attenderService.getExpenses(query);
  }

  // Monthly food cost summary
  @Get('monthly-summary')
  @Roles('ADMIN', 'ATTENDER', 'WARDEN')
  getMonthlySummary(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.attenderService.getMonthlySummary(
      month ? Number(month) : now.getMonth() + 1,
      year ? Number(year) : now.getFullYear(),
    );
  }

  // Pending payments
  @Get('pending-payments')
  @Roles('ADMIN', 'ATTENDER', 'WARDEN')
  getPendingPayments() {
    return this.attenderService.getPendingPayments();
  }

  // Today's attendance
  @Get('today-attendance')
  @Roles('ADMIN', 'ATTENDER', 'WARDEN')
  getTodayAttendance(@Query('date') date?: string) {
    return this.attenderService.getTodayAttendance(date);
  }
}
