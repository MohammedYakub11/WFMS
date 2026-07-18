import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkillCategoriesService } from './skill-categories.service';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skill-categories')
export class SkillCategoriesController {
  constructor(private readonly skillCategoriesService: SkillCategoriesService) {}

  @Roles('admin', 'manager')
  @Post()
  async create(@Body() createSkillCategoryDto: CreateSkillCategoryDto) {
    const data = await this.skillCategoriesService.create(createSkillCategoryDto);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    const data = await this.skillCategoriesService.findAll(+page || 1, +limit || 10, search);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.skillCategoriesService.findOne(id);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Roles('admin', 'manager')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSkillCategoryDto: UpdateSkillCategoryDto,
  ) {
    const data = await this.skillCategoriesService.update(id, updateSkillCategoryDto);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Roles('admin', 'manager')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.skillCategoriesService.remove(id);
    return { success: true, message: 'Operation completed successfully.', data: {}, errors: null };
  }
}
