import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiProperty({ example: 'HTN2024001', description: 'Unique hall ticket number' })
  @IsString()
  @IsNotEmpty()
  hall_ticket_number: string;

  @ApiProperty({ example: 'Ravi Kumar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'B.Tech' })
  @IsString()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: 1, description: 'Department ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  department_id: number;

  @ApiProperty({ example: 1, description: 'Semester ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  semester_id: number;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
