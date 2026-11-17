import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { Category } from './model/category.model.js';
import { CategoryRecord } from './schemas/category.schema.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategoryRecord.name)
    private readonly categoryModel: Model<CategoryRecord>,
  ) {}

  async findAll(): Promise<Category[]> {
    const documents = await this.categoryModel.find().sort({ name: 1 }).exec();

    return documents.map((document) => this.toCategory(document));
  }

  async create(createCategoryDTO: CreateCategoryDto): Promise<Category> {
    const document = await this.categoryModel.create({
      name: createCategoryDTO.name,
      color: createCategoryDTO.color,
      icon: createCategoryDTO.icon,
    });

    return this.toCategory(document);
  }

  private toCategory(document: HydratedDocument<CategoryRecord>): Category {
    return {
      id: document._id.toString(),
      name: document.name,
      color: document.color,
      icon: document.icon,
    };
  }

  async exists(id: string): Promise<boolean> {
    const category = await this.categoryModel.exists({ _id: id }).exec();

    return category != null;
  }
}
