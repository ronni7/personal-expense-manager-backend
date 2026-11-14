import { Test, TestingModule } from '@nestjs/testing';

import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { ExpensesService } from './expenses.service.js';
import { NotFoundException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpensesService],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should return expenses', () => {
    expect(service.findAll()).toHaveLength(3);
  });

  it('should add new expense to collection', () => {
    const newExpense = {
      description: 'Dinner',
      amount: 25,
      currency: 'USD' as const,
      categoryId: '507f1f77bcf86cd799439011',
    };

    const created = service.createExpense(newExpense);

    expect(service.findAll()).toContainEqual(created);
  });

  it('create() should generate unique UUID values for new expenses', () => {
    const firstExpense = service.createExpense({
      description: 'Coffee',
      amount: 6.5,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439011',
    } as CreateExpenseDto);

    const secondExpense = service.createExpense({
      description: 'Lunch',
      amount: 18,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439011',
    } as CreateExpenseDto);

    expect(firstExpense.id).toBeDefined();
    expect(secondExpense.id).toBeDefined();
    expect(typeof firstExpense.id).toBe('string');
    expect(typeof secondExpense.id).toBe('string');
    expect(firstExpense.id).not.toBe(secondExpense.id);
  });

  it('should reject negative amount', () => {
    const invalidExpense = {
      description: 'Taxi',
      amount: -10,
      currency: 'USD',
      categoryId: 'transport',
    } as CreateExpenseDto;

    expect(() => service.createExpense(invalidExpense)).toThrow(
      'Amount must be a positive number',
    );
  });
  it('should find an expense by id', () => {
    const expense = service.findOne('1');
    expect(expense).toBeDefined();
    expect(expense.id).toBe('1');
  });

  it('should throw NotFoundException for non-existing expense', () => {
    expect(() => service.findOne('non-existing-id')).toThrow(NotFoundException);
  });

  it('should update only provided fields', () => {
    const updated = service.update('1', {
      description: 'Updated lunch',
    });

    expect(updated).toMatchObject({
      id: '1',
      description: 'Updated lunch',
      amount: 15,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439011',
    });
  });

  it('should remove an expense', () => {
    service.delete('1');

    expect(service.findAll()).toHaveLength(2);

    expect(() => service.findOne('1')).toThrow(NotFoundException);
  });
});
