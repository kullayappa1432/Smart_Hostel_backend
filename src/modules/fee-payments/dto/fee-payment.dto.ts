import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateFeePaymentDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  fee_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  razorpay_order_id?: string;

  @IsOptional()
  @IsString()
  razorpay_payment_id?: string;

  @IsOptional()
  @IsString()
  razorpay_signature?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class GetFeePaymentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fee_id?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;
}
