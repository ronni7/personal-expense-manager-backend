import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { Category } from './model/category.model.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  createCategory(
    @Body() createCategoryDTO: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDTO);
  }
}
