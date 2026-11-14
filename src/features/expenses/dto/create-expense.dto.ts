import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsIn(['PLN', 'EUR', 'USD'])
  @IsNotEmpty()
  currency: 'PLN' | 'EUR' | 'USD';

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
