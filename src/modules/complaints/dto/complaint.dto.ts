import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ComplaintStatus, ComplaintType, ComplaintPriority } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateComplaintDto {
  @ApiProperty({ example: 'AC not working' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ComplaintType, example: ComplaintType.ROOM })
  @IsEnum(ComplaintType)
  type: ComplaintType;

  @ApiProperty({ example: 'The air conditioner in room 101 is not cooling properly' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: ComplaintPriority, example: ComplaintPriority.MEDIUM })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  room_id?: number;

  @ApiPropertyOptional({ example: 'https://storage.example.com/complaint-photo.jpg' })
  @IsOptional()
  @IsString()
  file_url?: string;
}

export class UpdateComplaintStatusDto {
  @ApiProperty({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;
}

