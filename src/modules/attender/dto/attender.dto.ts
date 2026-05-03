import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min, IsEmail, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpenseType {
  FOOD = 'FOOD',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

// ─── Attender Staff Management DTOs ───────────────────────────────────────────

export class CreateAttenderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateAttenderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class GetAttendersQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

// ─── Expense Management DTOs ──────────────────────────────────────────────────

export class CreateExpenseDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsEnum(ExpenseType)
  expense_type: ExpenseType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class GetExpensesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @IsOptional()
  @IsEnum(ExpenseType)
  expense_type?: ExpenseType;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class AttenderDashboardQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
