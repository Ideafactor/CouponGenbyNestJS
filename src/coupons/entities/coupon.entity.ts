import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type CouponDocument = Coupon & Document;

@Schema()
export class Coupon {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  group: string;

  @Prop()
  usedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  usedBy: User;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon); 