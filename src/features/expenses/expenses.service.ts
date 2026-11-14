import { Injectable, NotFoundException } from '@nestjs/common';
import { Expense } from './model/expense.model.js';
import { randomUUID } from 'crypto';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

@Injectable()
export class ExpensesService {
  private expenses: Expense[] = [
    {
      id: '1',
      description: 'Lunch',
      amount: 15,
      currency: 'USD',
      categoryId: 'food',
    },
    {
      id: '2',
      description: 'Taxi',
      amount: 30,
      currency: 'EUR',
      categoryId: 'transport',
    },
    {
      id: '3',
      description: 'Groceries',
      amount: 50,
      currency: 'PLN',
      categoryId: 'food',
    },
  ];

  findAll(): Expense[] {
    return this.expenses;
  }

  findOne(id: string): Expense {
    const expense = this.expenses.find((expense) => expense.id === id);
    if (!expense) {
      throw new NotFoundException(`Expense not found`);
    }
    return expense;
  }

  createExpense(expenseDTO: CreateExpenseDto): Expense {
    if (expenseDTO?.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    const expenseId = randomUUID();
    const expense = { id: expenseId, ...expenseDTO } as Expense;
    this.expenses = [...this.expenses, expense];
    return expense;
  }

  update(id: string, updateExpenseDto: UpdateExpenseDto): Expense {
    const expenseIndex = this.expenses.findIndex(
      (expense) => expense.id === id,
    );
    if (expenseIndex === -1) {
      throw new NotFoundException(`Expense not found`);
    }

    const updatedExpense: Expense = {
      ...this.expenses[expenseIndex],
      ...updateExpenseDto,
    };
    this.expenses[expenseIndex] = updatedExpense;
    return updatedExpense;
  }

  delete(id: string): void {
    const expenseIndex = this.expenses.findIndex(
      (expense) => expense.id === id,
    );
    if (expenseIndex === -1) {
      throw new NotFoundException(`Expense not found`);
    }
    this.expenses.splice(expenseIndex, 1);
  }
}
