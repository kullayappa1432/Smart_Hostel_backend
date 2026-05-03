import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeePaymentsService } from './fee-payments.service';
import { CreateFeePaymentDto, GetFeePaymentsQueryDto } from './dto/fee-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('fee-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeePaymentsController {
  constructor(private readonly feePaymentsService: FeePaymentsService) {}

  // ─── Razorpay: Create order for a pending fee ─────────────────────────────
  @Post('create-order/:feeId')
  @Roles('STUDENT', 'ADMIN')
  createOrder(@Param('feeId') feeId: string, @CurrentUser() user: any) {
    return this.feePaymentsService.createRazorpayOrder(BigInt(feeId), user.id);
  }

  // ─── Razorpay: Verify payment and record ──────────────────────────────────
  @Post('verify')
  @Roles('STUDENT', 'ADMIN')
  verifyPayment(
    @Body() body: {
      fee_id: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.feePaymentsService.verifyAndRecord(
      BigInt(body.fee_id),
      user.id,
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );
  }

  @Post()
  @Roles('ADMIN', 'ACCOUNTANT', 'STUDENT')
  create(@Body() createFeePaymentDto: CreateFeePaymentDto, @CurrentUser() user: any) {
    return this.feePaymentsService.create(createFeePaymentDto);
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT', 'WARDEN')
  findAll(@Query() query: GetFeePaymentsQueryDto) {
    return this.feePaymentsService.findAll(query);
  }

  @Get('my-payments')
  @Roles('STUDENT')
  getMyPayments(@CurrentUser() user: any) {
    return this.feePaymentsService.getPaymentHistory(user.id);
  }

  @Get('history/:studentId')
  @Roles('ADMIN', 'ACCOUNTANT', 'WARDEN')
  getPaymentHistory(@Param('studentId') studentId: string) {
    return this.feePaymentsService.getPaymentHistory(BigInt(studentId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feePaymentsService.findOne(BigInt(id));
  }

  @Delete(':id')
  @Roles('ADMIN', 'ACCOUNTANT')
  remove(@Param('id') id: string) {
    return this.feePaymentsService.remove(BigInt(id));
  }
}
