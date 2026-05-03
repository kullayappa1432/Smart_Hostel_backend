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
} from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto, CheckOutVisitorDto, GetVisitorsQueryDto } from './dto/visitor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('visitors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  @Roles('ADMIN', 'WARDEN', 'ATTENDER')
  create(@Body() createVisitorDto: CreateVisitorDto) {
    return this.visitorsService.create(createVisitorDto);
  }

  @Get()
  @Roles('ADMIN', 'WARDEN', 'ATTENDER', 'STUDENT')
  findAll(@Query() query: GetVisitorsQueryDto, @CurrentUser() user: any) {
    // Students can only see their own visitors
    if (user.role === 'STUDENT') {
      query.student_id = user.student_id;
    }
    return this.visitorsService.findAll(query);
  }

  @Get('active')
  @Roles('ADMIN', 'WARDEN', 'ATTENDER')
  getActiveVisitors() {
    return this.visitorsService.getActiveVisitors();
  }

  @Get('history/:studentId')
  @Roles('ADMIN', 'WARDEN')
  getVisitorHistory(@Param('studentId') studentId: string) {
    return this.visitorsService.getVisitorHistory(BigInt(studentId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(BigInt(id));
  }

  @Patch(':id/checkout')
  @Roles('ADMIN', 'WARDEN', 'ATTENDER')
  checkOut(@Param('id') id: string, @Body() checkOutVisitorDto: CheckOutVisitorDto) {
    return this.visitorsService.checkOut(BigInt(id), checkOutVisitorDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.visitorsService.remove(BigInt(id));
  }
}
