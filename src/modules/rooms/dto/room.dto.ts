import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  room_number: string;

  @ApiProperty({ example: 1, description: 'Hostel ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  hostel_id: number;

  @ApiProperty({ example: 'A', description: 'Block name (A/B/C)' })
  @IsString()
  @IsNotEmpty()
  block_name: string;

  @ApiProperty({ example: 1, description: 'Floor number (0 = ground)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  floor_number: number;

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

  @ApiProperty({ example: 4, description: 'Max capacity' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  capacity: number;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class RoomFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  department_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semester_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hostel_id?: number;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  block_name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor_number?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
