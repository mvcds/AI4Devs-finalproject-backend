import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../domain/entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new Category(
      createCategoryDto.name,
      createCategoryDto.flow,
      createCategoryDto.color,
      createCategoryDto.description,
      createCategoryDto.parentId,
    )
    return this.categoryRepository.save(category)
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    })
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } })
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }
    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)
    
    if (updateCategoryDto.name !== undefined) {
      category.updateName(updateCategoryDto.name)
    }
    if (updateCategoryDto.flow !== undefined) {
      category.updateFlow(updateCategoryDto.flow)
    }
    if (updateCategoryDto.color !== undefined) {
      category.updateColor(updateCategoryDto.color)
    }
    if (updateCategoryDto.description !== undefined) {
      category.updateDescription(updateCategoryDto.description)
    }
    if (updateCategoryDto.parentId !== undefined) {
      category.updateParent(updateCategoryDto.parentId)
    }

    return this.categoryRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)
    await this.categoryRepository.remove(category)
  }
}
