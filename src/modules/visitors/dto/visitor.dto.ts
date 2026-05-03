import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVisitorDto {
  @IsNotEmpty()
  @Type(() => BigInt)
  student_id: bigint;

  @IsOptional()
  @Type(() => BigInt)
  room_id?: bigint;

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
  @Type(() => BigInt)
  student_id?: bigint;

  @IsOptional()
  @Type(() => BigInt)
  room_id?: bigint;

  @IsOptional()
  checked_out?: string; // 'true' or 'false'
}
