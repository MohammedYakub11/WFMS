import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { Response } from 'express';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import { SkillCategoriesService } from './skill-categories.service';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { SkillCategoryListQueryDto } from './dto/skill-category-list-query.dto';
import { ExportSkillCategoryQueryDto } from './dto/export-skill-category-query.dto';
import { BulkSkillActionDto } from '../skills/dto/bulk-skill-action.dto';
import { BulkDeleteDto } from '../skills/dto/bulk-delete.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

interface AuthedRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('skill-categories')
export class SkillCategoriesController {
  constructor(
    private readonly skillCategoriesService: SkillCategoriesService,
  ) {}

  @RequirePermissions(PermissionCode.CATEGORY_CREATE)
  @Post()
  async create(
    @Body() createSkillCategoryDto: CreateSkillCategoryDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.create(
      createSkillCategoryDto,
      actorId,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_VIEW)
  @Get()
  async findAll(@Query() query: SkillCategoryListQueryDto) {
    const data = await this.skillCategoriesService.findAll(query);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EXPORT_REPORTS)
  @Get('export')
  async export(
    @Query() query: ExportSkillCategoryQueryDto,
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer | string> {
    const actorId = req.user?.sub || req.user?.id;
    const rows = await this.skillCategoriesService.exportRows(
      query,
      query.format,
      actorId,
    );
    const timestamp = new Date().toISOString().slice(0, 10);

    if (query.format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Skill Categories');
      sheet.columns = [
        { header: 'Category Name', key: 'categoryName', width: 30 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Active', key: 'isActive', width: 10 },
        { header: 'Created At', key: 'createdAt', width: 22 },
      ];
      rows.forEach((category) => {
        sheet.addRow({
          categoryName: category.categoryName,
          description: category.description,
          isActive: category.isActive,
          createdAt: category.createdAt,
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="skill-categories-${timestamp}.xlsx"`,
      });
      return Buffer.from(buffer);
    }

    const csv = stringify(
      rows.map((category) => [
        category.categoryName,
        category.description,
        category.isActive ? 'true' : 'false',
        category.createdAt?.toISOString(),
      ]),
      {
        header: true,
        columns: ['Category Name', 'Description', 'Active', 'Created At'],
      },
    );

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="skill-categories-${timestamp}.csv"`,
    });
    return csv;
  }

  @RequirePermissions(PermissionCode.CATEGORY_UPDATE)
  @Post('bulk-status')
  async bulkStatus(@Body() dto: BulkSkillActionDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.bulkSetStatus(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_DELETE)
  @Post('bulk-delete')
  async bulkDelete(@Body() dto: BulkDeleteDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.bulkDelete(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_VIEW)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.skillCategoriesService.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_UPDATE)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSkillCategoryDto: UpdateSkillCategoryDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.update(
      id,
      updateSkillCategoryDto,
      actorId,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_DELETE)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    await this.skillCategoriesService.remove(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data: {},
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_UPDATE)
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.restore(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_UPDATE)
  @Patch(':id/activate')
  async activate(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.setStatus(id, true, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.CATEGORY_UPDATE)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillCategoriesService.setStatus(
      id,
      false,
      actorId,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
