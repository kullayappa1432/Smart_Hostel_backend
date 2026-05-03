import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class CreateFeeDto {
  @IsNotEmpty()
  @Type(() => BigInt)
  student_id: bigint;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2020)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  room_rent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  food_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricity_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  water_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenance_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fine?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  previous_due?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsNotEmpty()
  @IsDateString()
  due_date: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateFeeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  room_rent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  food_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricity_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  water_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenance_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fine?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  previous_due?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class GetFeesQueryDto {
  @IsOptional()
  @Type(() => BigInt)
  student_id?: bigint;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;
}
