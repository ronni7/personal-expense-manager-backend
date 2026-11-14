import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service.js';
import type { Expense } from './model/expense.model.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
  @Get()
  findAll(): Expense[] {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Expense {
    return this.expensesService.findOne(id);
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto): CreateExpenseDto {
    return this.expensesService.createExpense(createExpenseDto as Expense);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Expense {
    // Implement the update logic here
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): void {
    this.expensesService.delete(id);
  }
}
