import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkAttendanceDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  student_id: number;

  @ApiProperty({ example: 1, description: 'Semester ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  semester_id: number;

  @ApiProperty({ example: '2026-04-29', description: 'Date (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class BulkAttendanceDto {
  @ApiProperty({ type: [MarkAttendanceDto] })
  records: MarkAttendanceDto[];
}

export class AttendanceFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semester_id?: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
