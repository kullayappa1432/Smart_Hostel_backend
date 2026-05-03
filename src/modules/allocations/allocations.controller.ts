import {
  Controller, Get, Post, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto, StudentSelfAllocateDto } from './dto/allocation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Allocations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Allocate a room to a student (enforces all rules)' })
  adminAllocate(@Body() dto: CreateAllocationDto) {
    return this.allocationsService.adminAllocate(dto);
  }

  @Post('self')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '[STUDENT] Self-allocate a room (enforces all rules)' })
  selfAllocate(@CurrentUser() user: any, @Body() dto: StudentSelfAllocateDto) {
    return this.allocationsService.studentSelfAllocate(user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Get all allocations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.allocationsService.findAll(+page, +limit);
  }

  @Get('my-room')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '[STUDENT] Get my current room allocation' })
  getMyAllocation(@CurrentUser() user: any) {
    return this.allocationsService.getMyAllocation(user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Deallocate a room (frees up the room)' })
  deallocate(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.deallocate(id);
  }
}
