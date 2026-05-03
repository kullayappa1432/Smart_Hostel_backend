import { Module } from '@nestjs/common';
import { FeePaymentsService } from './fee-payments.service';
import { FeePaymentsController } from './fee-payments.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FeePaymentsController],
  providers: [FeePaymentsService],
  exports: [FeePaymentsService],
})
export class FeePaymentsModule {}
