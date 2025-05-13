import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  private generateCouponCode(prefix: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 13; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async generateCoupons(prefix: string, count: number = 100000) {
    if (prefix.length !== 3) {
      throw new BadRequestException('Prefix must be exactly 3 characters');
    }

    // Get the latest group letter
    const latestCoupon = await this.couponModel.findOne().sort({ group: -1 });
    const currentGroup = latestCoupon ? 
      String.fromCharCode(latestCoupon.group.charCodeAt(0) + 1) : 
      'A';

    const coupons = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateCouponCode(prefix);
      coupons.push({
        code,
        group: currentGroup,
      });
    }

    return this.couponModel.insertMany(coupons);
  }

  async getCoupons(page: number = 1, group?: string) {
    const limit = 100;
    const skip = (page - 1) * limit;
    
    const query = group ? { group } : {};
    const [coupons, total] = await Promise.all([
      this.couponModel.find(query)
        .populate('usedBy', 'username')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.couponModel.countDocuments(query)
    ]);

    return {
      coupons,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async validateAndUseCoupon(code: string, userId: string) {
    const coupon = await this.couponModel.findOne({ code });
    
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (coupon.usedAt) {
      throw new BadRequestException('Coupon has already been used');
    }

    if (coupon.usedBy) {
      throw new BadRequestException('Coupon has already been used by another user');
    }

    // Update coupon with usage information
    coupon.usedAt = new Date();
    coupon.usedBy = userId;
    await coupon.save();

    return {
      message: 'Coupon used successfully',
      coupon: {
        code: coupon.code,
        group: coupon.group,
        usedAt: coupon.usedAt
      }
    };
  }

  async checkCouponValidity(code: string) {
    const coupon = await this.couponModel.findOne({ code });
    
    if (!coupon) {
      return {
        isValid: false,
        message: 'Coupon not found'
      };
    }

    if (coupon.usedAt) {
      return {
        isValid: false,
        message: 'Coupon has already been used'
      };
    }

    if (coupon.usedBy) {
      return {
        isValid: false,
        message: 'Coupon has already been used by another user'
      };
    }

    return {
      isValid: true,
      message: 'Coupon is valid and can be used'
    };
  }
} 