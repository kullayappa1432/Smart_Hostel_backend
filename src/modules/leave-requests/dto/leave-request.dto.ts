import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveStatus } from '@prisma/client';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @Type(() => BigInt)
  student_id: bigint;

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
  @Type(() => BigInt)
  student_id?: bigint;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;
}
