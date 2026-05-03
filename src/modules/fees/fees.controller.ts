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
import { FeesService } from './fees.service';
import { CreateFeeDto, UpdateFeeDto, GetFeesQueryDto } from './dto/fee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post()
  @Roles('ADMIN', 'ACCOUNTANT')
  create(@Body() createFeeDto: CreateFeeDto) {
    return this.feesService.create(createFeeDto);
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT', 'WARDEN')
  findAll(@Query() query: GetFeesQueryDto) {
    return this.feesService.findAll(query);
  }

  @Get('my-fees')
  @Roles('STUDENT')
  getMyFees(@CurrentUser() user: any) {
    return this.feesService.findAll({ student_id: user.student_id });
  }

  @Get('my-summary')
  @Roles('STUDENT')
  getMySummary(@CurrentUser() user: any) {
    return this.feesService.getFeeSummary(user.student_id);
  }

  @Get('pending/:studentId')
  @Roles('ADMIN', 'ACCOUNTANT', 'WARDEN')
  getPendingFees(@Param('studentId') studentId: string) {
    return this.feesService.getPendingFees(BigInt(studentId));
  }

  @Get('summary/:studentId')
  @Roles('ADMIN', 'ACCOUNTANT', 'WARDEN')
  getFeeSummary(@Param('studentId') studentId: string) {
    return this.feesService.getFeeSummary(BigInt(studentId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feesService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles('ADMIN', 'ACCOUNTANT')
  update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feesService.update(BigInt(id), updateFeeDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.feesService.remove(BigInt(id));
  }
}
