import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Expense } from './model/expense.model.js';
import { randomUUID } from 'crypto';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

import { InjectModel } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types, type Model } from 'mongoose';
import { ExpenseRecord } from './schemas/expense.schema.js';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(ExpenseRecord.name)
    private readonly expenseModel: Model<ExpenseRecord>,
  ) {}

  async findAll(): Promise<Expense[]> {
    const documents = await this.expenseModel.find().exec();

    return documents.map((document) => this.toExpense(document));
  }

  async findOne(id: string): Promise<Expense> {
    this.validateObjectId(id);

    const document = await this.expenseModel.findById(id).exec();

    if (!document) {
      throw new NotFoundException('Expense not found');
    }

    return this.toExpense(document);
  }

  async createExpense(expenseDTO: CreateExpenseDto): Promise<Expense> {
    if (expenseDTO?.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    // const expenseId = randomUUID(); ?

    const document = await this.expenseModel.create({
      description: expenseDTO.description,
      amount: Types.Decimal128.fromString(expenseDTO.amount.toString()),
      currency: expenseDTO.currency,
      categoryId: new Types.ObjectId(expenseDTO.categoryId),
    });

    return this.toExpense(document);
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    this.validateObjectId(id);

    if (Object.keys(updateExpenseDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const update: Partial<ExpenseRecord> =
      this.mapPayloadToExpenseRecord(updateExpenseDto);

    if (updateExpenseDto.amount !== undefined) {
      update.amount = Types.Decimal128.fromString(
        updateExpenseDto.amount.toString(),
      );
    }

    if (updateExpenseDto.currency !== undefined) {
      update.currency = updateExpenseDto.currency;
    }

    if (updateExpenseDto.categoryId !== undefined) {
      update.categoryId = new Types.ObjectId(updateExpenseDto.categoryId);
    }

    const document = await this.expenseModel
      .findByIdAndUpdate(
        id,
        { $set: update },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!document) {
      throw new NotFoundException('Expense not found');
    }

    return this.toExpense(document);
  }

  async delete(id: string): Promise<void> {
    this.validateObjectId(id);

    const document = await this.expenseModel.findByIdAndDelete(id).exec();

    if (!document) {
      throw new NotFoundException('Expense not found');
    }
  }

  private validateObjectId(id: string): void {
    if (!mongoose.isObjectIdOrHexString(id)) {
      throw new BadRequestException('Invalid expense ID');
    }
  }

  private toExpense(document: HydratedDocument<ExpenseRecord>): Expense {
    return {
      id: document._id.toString(),
      description: document.description,
      amount: Number(document.amount.toString()),
      currency: document.currency,
      categoryId: document.categoryId.toString(),
    };
  }

  private mapPayloadToExpenseRecord(
    dto: UpdateExpenseDto,
  ): Partial<ExpenseRecord> {
    const update: Partial<ExpenseRecord> = {};

    if (dto.description !== undefined) {
      update.description = dto.description;
    }

    if (dto.amount !== undefined) {
      update.amount = Types.Decimal128.fromString(dto.amount.toString());
    }

    if (dto.currency !== undefined) {
      update.currency = dto.currency;
    }

    if (dto.categoryId !== undefined) {
      update.categoryId = new Types.ObjectId(dto.categoryId);
    }

    return update;
  }
}
