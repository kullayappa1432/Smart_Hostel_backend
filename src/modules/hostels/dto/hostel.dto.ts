import { ApiProperty, PartialType } from '@nestjs/swagger';
import { HostelGenderType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateHostelDto {
  @ApiProperty({ example: 'Boys Hostel Block A' })
  @IsString()
  @IsNotEmpty()
  hostel_name: string;

  @ApiProperty({ enum: HostelGenderType, example: HostelGenderType.BOYS })
  @IsEnum(HostelGenderType)
  gender_type: HostelGenderType;
}

export class UpdateHostelDto extends PartialType(CreateHostelDto) {}
