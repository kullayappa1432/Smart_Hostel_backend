import { IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVisitorDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  student_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  room_id?: number;

  @IsNotEmpty()
  @IsString()
  visitor_name: string;

  @IsNotEmpty()
  @IsString()
  relation: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  id_proof_type?: string;

  @IsOptional()
  @IsString()
  id_proof_number?: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class CheckOutVisitorDto {
  @IsNotEmpty()
  @IsDateString()
  check_out_time: string;
}

export class GetVisitorsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  room_id?: number;

  @IsOptional()
  checked_out?: string; // 'true' or 'false'
}
