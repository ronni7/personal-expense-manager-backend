import { Test, TestingModule } from '@nestjs/testing';

import { ExpensesService } from './expenses/expenses.service.js';
import { ExpensesController } from './expenses/expenses.controller.js';
import { CreateExpenseDto } from './expenses/dto/create-expense.dto.js';
import { Mock } from 'vitest';

describe('ExpensesController', () => {
  let expensesController: ExpensesController;
  let expensesService: { findAll: Mock; createExpense: Mock };

  const mockExpenses = [
    {
      id: '1',
      description: 'Groceries',
      amount: 10,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439011',
    },
    {
      id: '2',
      description: 'Train ticket',
      amount: 15,
      currency: 'USD',
      categoryId: 'transport',
    },
  ];

  beforeEach(async () => {
    expensesService = {
      findAll: vi.fn().mockReturnValue(mockExpenses),
      createExpense: vi.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: expensesService,
        },
      ],
    }).compile();

    expensesController = app.get<ExpensesController>(ExpensesController);
  });

  describe('Expenses', () => {
    it('should call ExpensesService.findAll and return expenses', () => {
      const result = expensesController.findAll();

      expect(expensesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockExpenses);
    });

    it('should pass DTO to ExpensesService.create and return created Expense', () => {
      const newExpense: CreateExpenseDto = {
        description: 'Dinner',
        amount: 25,
        currency: 'USD',
        categoryId: '507f1f77bcf86cd799439011',
      };
      const createdExpense = { id: '3', ...newExpense };
      expensesService.createExpense.mockReturnValue(createdExpense);

      expect(expensesController.create(newExpense)).toEqual(createdExpense);
      expect(expensesService.createExpense).toHaveBeenCalledWith(newExpense);
      expect(expensesService.createExpense).toHaveBeenCalledTimes(1);
    });
  });
});
