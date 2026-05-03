import { Module } from '@nestjs/common';
import { AttenderService } from './attender.service';
import { AttenderController } from './attender.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttenderController],
  providers: [AttenderService],
  exports: [AttenderService],
})
export class AttenderModule {}
