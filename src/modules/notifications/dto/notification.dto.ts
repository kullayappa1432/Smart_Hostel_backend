import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'Target user ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  user_id: number;

  @ApiProperty({ example: 'Room Allocated' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your room 101 in Block A has been allocated.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'Hostel Closed Tomorrow' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The hostel will be closed for maintenance on 30th April.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Target role (ADMIN/STUDENT). Omit for all users.' })
  @IsOptional()
  @IsString()
  role?: string;
}
