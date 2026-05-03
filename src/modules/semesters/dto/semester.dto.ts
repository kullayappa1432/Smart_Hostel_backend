import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty({ example: 1, description: 'Semester number (1-8)' })
  @IsInt()
  @Min(1)
  @Max(8)
  semester_number: number;

  @ApiProperty({ example: '2024-2025' })
  @IsString()
  @IsNotEmpty()
  academic_year: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateSemesterDto extends PartialType(CreateSemesterDto) {}
