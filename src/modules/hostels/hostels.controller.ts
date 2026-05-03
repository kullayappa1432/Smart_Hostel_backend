import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostelsService } from './hostels.service';
import { CreateHostelDto, UpdateHostelDto } from './dto/hostel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Hostels')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hostels')
export class HostelsController {
  constructor(private readonly hostelsService: HostelsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Create hostel' })
  create(@Body() dto: CreateHostelDto) {
    return this.hostelsService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all hostels' })
  findAll() {
    return this.hostelsService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get hostel with rooms (block/floor grouped)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hostelsService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Update hostel' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHostelDto) {
    return this.hostelsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Delete hostel' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hostelsService.remove(BigInt(id));
  }
}
