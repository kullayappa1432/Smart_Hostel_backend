import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science Engineering' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department_name: string;

  @ApiProperty({ example: 'CSE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  department_code: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
