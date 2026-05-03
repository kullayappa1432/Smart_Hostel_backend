import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, RoomFilterDto } from './dto/room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Rooms')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Create a room' })
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Get all rooms with filters (block/floor grouped)' })
  @ApiQuery({ name: 'hostel_id', required: false, type: Number })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'semester_id', required: false, type: Number })
  @ApiQuery({ name: 'block_name', required: false, type: String })
  @ApiQuery({ name: 'floor_number', required: false, type: Number })
  @ApiQuery({ name: 'available', required: false, type: Boolean })
  findAll(@Query() filter: RoomFilterDto) {
    return this.roomsService.findAll(filter);
  }

  @Get('available/for-me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '[STUDENT] Get available rooms matching my dept/semester/gender' })
  findAvailableForMe(@CurrentUser() user: any) {
    return this.roomsService.findAvailableForStudent(user.student_id);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Get room details with current occupants' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Update room' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Delete room' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(BigInt(id));
  }
}
