import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveStatus } from '@prisma/client';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsDateString()
  from_date: string;

  @IsNotEmpty()
  @IsDateString()
  to_date: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class ApproveLeaveDto {
  @IsNotEmpty()
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class GetLeaveRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;
}
