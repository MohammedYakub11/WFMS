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
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Roles('admin', 'manager')
  @Post()
  async create(@Body() createSkillDto: CreateSkillDto) {
    const data = await this.skillsService.create(createSkillDto);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('categoryId') categoryId: string,
    @Query('search') search: string,
  ) {
    const data = await this.skillsService.findAll(+page || 1, +limit || 10, categoryId, search);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.skillsService.findOne(id);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Roles('admin', 'manager')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    const data = await this.skillsService.update(id, updateSkillDto);
    return { success: true, message: 'Operation completed successfully.', data, errors: null };
  }

  @Roles('admin', 'manager')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.skillsService.remove(id);
    return { success: true, message: 'Operation completed successfully.', data: {}, errors: null };
  }
}
