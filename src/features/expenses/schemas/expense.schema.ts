import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

export type ExpenseDocument = HydratedDocument<ExpenseRecord>;

@Schema({
  collection: 'expenses',
  timestamps: true,
  versionKey: false,
})
export class ExpenseRecord {
  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  })
  description!: string;

  @Prop({
    type: MongooseSchema.Types.Decimal128,
    required: true,
  })
  amount!: Types.Decimal128;

  @Prop({
    type: String,
    required: true,
    enum: ['PLN', 'EUR', 'USD'],
  })
  currency!: 'PLN' | 'EUR' | 'USD';

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  categoryId!: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(ExpenseRecord);
