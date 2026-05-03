import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Mr. Ramesh Kumar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Warden' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ramesh@hostel.com' })
  @IsEmail()
  email: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
