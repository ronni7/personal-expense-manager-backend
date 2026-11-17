import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<CategoryRecord>;

@Schema({
  collection: 'categories',
  timestamps: true,
  versionKey: false,
})
export class CategoryRecord {
  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  })
  name!: string;

  @Prop({
    type: String,
    default: '#64748b',
    match: /^#[0-9a-fA-F]{6}$/, // Hex color code validation isHexColorCode
  })
  color!: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 40,
  })
  icon?: string;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryRecord);
