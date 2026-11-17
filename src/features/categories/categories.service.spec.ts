import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service.js';
import { CategoryRecord } from './schemas/category.schema.js';
import { getModelToken } from '@nestjs/mongoose';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const mockCategoryModel = {
    find: vi.fn(),
    create: vi.fn(),
    exists: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(CategoryRecord.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true when category exists', async () => {
    const query = {
      exec: vi.fn().mockResolvedValue({ _id: 'category-id' }),
    };

    mockCategoryModel.exists.mockReturnValue(query);

    await expect(service.exists('category-id')).resolves.toBe(true);

    expect(mockCategoryModel.exists).toHaveBeenCalledWith({
      _id: 'category-id',
    });
  });

  it('should return false when category does not exist', async () => {
    const query = {
      exec: vi.fn().mockResolvedValue(null),
    };

    mockCategoryModel.exists.mockReturnValue(query);

    await expect(service.exists('category-id')).resolves.toBe(false);
  });
});
