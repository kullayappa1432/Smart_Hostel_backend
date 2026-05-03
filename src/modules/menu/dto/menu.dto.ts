import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: '2026-04-29' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Idli, Sambar, Chutney' })
  @IsString()
  @IsNotEmpty()
  breakfast: string;

  @ApiProperty({ example: 'Rice, Dal, Sabzi, Roti' })
  @IsString()
  @IsNotEmpty()
  lunch: string;

  @ApiProperty({ example: 'Chapati, Paneer Curry, Salad' })
  @IsString()
  @IsNotEmpty()
  dinner: string;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
