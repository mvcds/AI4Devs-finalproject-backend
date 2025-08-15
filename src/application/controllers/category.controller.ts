import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { CategoryService } from '../services/category.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { CategoryResponseDto } from '../dto/category-response.dto'

@ApiTags('categories')
@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  async create(
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id)
  }
}
