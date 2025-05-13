import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async generateCoupons(@Body() body: { prefix: string }) {
    return this.couponsService.generateCoupons(body.prefix);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getCoupons(
    @Query('page') page: number = 1,
    @Query('group') group?: string,
  ) {
    return this.couponsService.getCoupons(page, group);
  }

  @Post('check')
  async checkCoupon(@Body() body: { code: string }) {
    return this.couponsService.checkCouponValidity(body.code);
  }

  @Post('use')
  async useCoupon(@Request() req, @Body() body: { code: string }) {
    return this.couponsService.validateAndUseCoupon(body.code, req.user.id);
  }
} 