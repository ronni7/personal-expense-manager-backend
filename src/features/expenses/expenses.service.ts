import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { Expense } from './model/expense.model.js';

import { InjectModel } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types, type Model } from 'mongoose';
import { CategoriesService } from '../categories/categories.service.js';
import { ExpenseRecord } from './schemas/expense.schema.js';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(ExpenseRecord.name)
    private readonly expenseModel: Model<ExpenseRecord>,
    private readonly categoriesService: CategoriesService,
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
    if (expenseDTO.amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }

    if (expenseDTO.categoryId != undefined) {
      const exists = await this.categoriesService.exists(expenseDTO.categoryId);

      if (!exists) {
        throw new BadRequestException('Category does not exist');
      }
    }
    const categoryExists = await this.categoriesService.exists(
      expenseDTO.categoryId,
    );

    if (!categoryExists) {
      throw new BadRequestException('Category does not exist');
    }

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

    if (updateExpenseDto.categoryId != undefined) {
      const exists = await this.categoriesService.exists(
        updateExpenseDto.categoryId,
      );

      if (!exists) {
        throw new BadRequestException('Category does not exist');
      }
    }

    const update: Partial<ExpenseRecord> =
      this.mapPayloadToExpenseRecord(updateExpenseDto);

    if (Object.keys(updateExpenseDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
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

    if (dto.description != undefined) {
      update.description = dto.description;
    }

    if (dto.amount != undefined) {
      update.amount = Types.Decimal128.fromString(dto.amount.toString());
    }

    if (dto.currency != undefined) {
      update.currency = dto.currency;
    }

    if (dto.categoryId != undefined) {
      update.categoryId = new Types.ObjectId(dto.categoryId);
    }

    return update;
  }
}
