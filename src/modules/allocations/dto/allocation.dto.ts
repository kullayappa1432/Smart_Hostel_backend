import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAllocationDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  student_id: number;

  @ApiProperty({ example: 1, description: 'Room ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  room_id: number;
}

export class StudentSelfAllocateDto {
  @ApiProperty({ example: 1, description: 'Room ID to allocate' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  room_id: number;
}
