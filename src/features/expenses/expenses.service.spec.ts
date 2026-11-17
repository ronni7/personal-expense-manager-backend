import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HydratedDocument, Types } from 'mongoose';
import { vi } from 'vitest';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { ExpensesService } from './expenses.service.js';
import { ExpenseRecord } from './schemas/expense.schema.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { CategoriesService } from '../categories/categories.service.js';

const createMockExpense = () =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    description: 'Lunch',
    amount: Types.Decimal128.fromString('15'),
    currency: 'PLN',
    categoryId: new Types.ObjectId('507f1f77bcf86cd799439012'),
  }) as unknown as HydratedDocument<ExpenseRecord>;

const mockCategoriesService = {
  exists: vi.fn().mockResolvedValue(true),
};

let expenseModelMock = {
  find: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
};
const mockQuery = (result: unknown) => ({
  exec: vi.fn().mockResolvedValue(result),
});
describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    mockCategoriesService.exists.mockReset();
    mockCategoriesService.exists.mockResolvedValue(true);
    expenseModelMock = {
      find: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getModelToken(ExpenseRecord.name),
          useValue: expenseModelMock,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should return empty array when no expenses exist', async () => {
    expenseModelMock.find.mockReturnValue(mockQuery([]));

    await expect(service.findAll()).resolves.toEqual([]);
  });
  it('should propagate database errors', async () => {
    expenseModelMock.find.mockReturnValue({
      exec: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    });

    await expect(service.findAll()).rejects.toThrow(
      'Database connection failed',
    );
  });
  it('should return mapped expenses', async () => {
    const document = createMockExpense();

    expenseModelMock.find.mockReturnValue(mockQuery([document]));

    const result = await service.findAll();

    expect(expenseModelMock.find).toHaveBeenCalledOnce();

    expect(result).toEqual([
      {
        id: document._id.toString(),
        description: 'Lunch',
        amount: 15,
        currency: 'PLN',
        categoryId: document.categoryId.toString(),
      },
    ]);
  });

  it('should return expense by ID', async () => {
    const document = createMockExpense();

    expenseModelMock.findById.mockReturnValue(mockQuery(document));

    const result = await service.findOne(document._id.toString());

    expect(result.id).toBe(document._id.toString());
    expect(result.description).toBe('Lunch');
  });

  it('should throw NotFoundException when expense does not exist', async () => {
    expenseModelMock.findById.mockReturnValue(mockQuery(null));

    await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should reject invalid ObjectId', async () => {
    await expect(service.findOne('not-an-object-id')).rejects.toThrow(
      BadRequestException,
    );

    expect(expenseModelMock.findById).not.toHaveBeenCalled();
  });

  it('should create an expense', async () => {
    const dto = {
      description: 'Dinner',
      amount: 25,
      currency: 'USD' as const,
      categoryId: '507f1f77bcf86cd799439012',
    };

    const document = {
      _id: new Types.ObjectId(),
      description: dto.description,
      amount: Types.Decimal128.fromString(dto.amount.toString()),
      currency: dto.currency,
      categoryId: new Types.ObjectId(dto.categoryId),
    } as unknown as HydratedDocument<ExpenseRecord>;

    expenseModelMock.create.mockResolvedValue(document);

    const result = await service.createExpense(dto);

    expect(expenseModelMock.create).toHaveBeenCalledOnce();

    expect(expenseModelMock.create).toHaveBeenCalledWith({
      description: dto.description,
      amount: Types.Decimal128.fromString('25'),
      currency: 'USD',
      categoryId: new Types.ObjectId(dto.categoryId),
    });

    expect(result).toEqual({
      id: document._id.toString(),
      description: 'Dinner',
      amount: 25,
      currency: 'USD',
      categoryId: dto.categoryId,
    });
  });

  it('should not create expense when category does not exist', async () => {
    const dto: CreateExpenseDto = {
      description: 'Dinner',
      amount: 25,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439012',
    };

    mockCategoriesService.exists.mockResolvedValue(false);

    await expect(service.createExpense(dto)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockCategoriesService.exists).toHaveBeenCalledWith(dto.categoryId);
    expect(expenseModelMock.create).not.toHaveBeenCalled();
  });

  it('should reject non-positive expense amount', async () => {
    const dto: CreateExpenseDto = {
      description: 'Dinner',
      amount: 0,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439012',
    };

    await expect(service.createExpense(dto)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockCategoriesService.exists).not.toHaveBeenCalled();
    expect(expenseModelMock.create).not.toHaveBeenCalled();
  });

  it('should update an expense', async () => {
    const id = '507f1f77bcf86cd799439011';

    const dto: UpdateExpenseDto = {
      description: 'Updated lunch',
    };
    const document = {
      ...createMockExpense(),
      description: dto.description,
    };

    expenseModelMock.findByIdAndUpdate.mockReturnValue(mockQuery(document));

    const result = await service.update(id, dto);

    expect(expenseModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      {
        $set: {
          description: 'Updated lunch',
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    expect(result.description).toBe('Updated lunch');
    expect(mockCategoriesService.exists).not.toHaveBeenCalled();
    expect(result.id).toBe(id);
  });

  it('should not update expense when category does not exist', async () => {
    const expenseId = '507f1f77bcf86cd799439011';
    const categoryId = '507f1f77bcf86cd799439012';

    mockCategoriesService.exists.mockResolvedValue(false);

    await expect(service.update(expenseId, { categoryId })).rejects.toThrow(
      BadRequestException,
    );

    expect(mockCategoriesService.exists).toHaveBeenCalledWith(categoryId);
    expect(expenseModelMock.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating non-existing expense', async () => {
    expenseModelMock.findByIdAndUpdate.mockReturnValue(mockQuery(null));

    await expect(
      service.update('507f1f77bcf86cd799439011', {
        description: 'Updated',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject empty update DTO', async () => {
    await expect(
      service.update('507f1f77bcf86cd799439011', {}),
    ).rejects.toThrow(BadRequestException);

    expect(expenseModelMock.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should delete an expense', async () => {
    const document = createMockExpense();

    expenseModelMock.findByIdAndDelete.mockReturnValue(mockQuery(document));

    await expect(
      service.delete(document._id.toString()),
    ).resolves.toBeUndefined();

    expect(expenseModelMock.findByIdAndDelete).toHaveBeenCalledWith(
      document._id.toString(),
    );
  });

  it('should throw NotFoundException when deleting non-existing expense', async () => {
    expenseModelMock.findByIdAndDelete.mockReturnValue(mockQuery(null));

    await expect(service.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
      NotFoundException,
    );
  });
  it('should update expense category when category exists', async () => {
    const id = '507f1f77bcf86cd799439011';
    const categoryId = '507f1f77bcf86cd799439099';

    const document = {
      ...createMockExpense(),
      categoryId: new Types.ObjectId(categoryId),
    };

    expenseModelMock.findByIdAndUpdate.mockReturnValue(mockQuery(document));

    const result = await service.update(id, { categoryId });

    expect(mockCategoriesService.exists).toHaveBeenCalledWith(categoryId);

    expect(expenseModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      {
        $set: {
          categoryId: new Types.ObjectId(categoryId),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    expect(result.categoryId).toBe(categoryId);
  });
});
