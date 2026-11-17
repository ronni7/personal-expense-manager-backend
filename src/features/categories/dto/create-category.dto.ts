import { Transform } from 'class-transformer';
import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateCategoryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ValidateIf((_object, value) => value != undefined)
  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;
}
