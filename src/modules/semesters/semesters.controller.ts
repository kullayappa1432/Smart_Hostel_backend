import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SemestersService } from './semesters.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Semesters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Create semester' })
  create(@Body() dto: CreateSemesterDto) {
    return this.semestersService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all semesters' })
  findAll() {
    return this.semestersService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get current active semester' })
  findActive() {
    return this.semestersService.findActive();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get semester by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Update semester' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSemesterDto) {
    return this.semestersService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Delete semester' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.remove(BigInt(id));
  }
}
