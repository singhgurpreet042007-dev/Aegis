import { Controller, Post, Get, Body } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ClaimTrialDto, CheckoutDto, VerifyPaymentDto } from './dto/billing.dto';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('claim-trial')
  claimTrial(@Body() dto: ClaimTrialDto) {
    return this.billingService.claimTrial(dto);
  }

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto) {
    return this.billingService.checkout(dto);
  }

  @Post('verify-payment')
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.billingService.verifyPayment(dto);
  }

  @Get('status')
  getStatus() {
    return this.billingService.getStatus();
  }
}

