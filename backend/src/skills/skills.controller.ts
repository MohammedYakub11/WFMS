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
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillListQueryDto } from './dto/skill-list-query.dto';
import { BulkSkillActionDto } from './dto/bulk-skill-action.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { ExportSkillQueryDto } from './dto/export-skill-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

interface AuthedRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @RequirePermissions(PermissionCode.SKILL_CREATE)
  @Post()
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.create(createSkillDto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_VIEW)
  @Get()
  async findAll(@Query() query: SkillListQueryDto) {
    const data = await this.skillsService.findAll(query);
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
    @Query() query: ExportSkillQueryDto,
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer | string> {
    const actorId = req.user?.sub || req.user?.id;
    const rows = await this.skillsService.exportRows(
      query,
      query.format,
      actorId,
    );
    const timestamp = new Date().toISOString().slice(0, 10);

    if (query.format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Skills');
      sheet.columns = [
        { header: 'Skill Code', key: 'skillCode', width: 20 },
        { header: 'Skill Name', key: 'skillName', width: 30 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Description', key: 'description', width: 40 },
        {
          header: 'Required Certification',
          key: 'requiredCertification',
          width: 30,
        },
        { header: 'Active', key: 'isActive', width: 10 },
        { header: 'Created At', key: 'createdAt', width: 22 },
      ];
      rows.forEach((skill) => {
        sheet.addRow({
          skillCode: skill.skillCode,
          skillName: skill.skillName,
          category: skill.category?.categoryName,
          description: skill.description,
          requiredCertification: skill.requiredCertification,
          isActive: skill.isActive,
          createdAt: skill.createdAt,
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="skills-${timestamp}.xlsx"`,
      });
      return Buffer.from(buffer);
    }

    const csv = stringify(
      rows.map((skill) => [
        skill.skillCode,
        skill.skillName,
        skill.category?.categoryName,
        skill.description,
        skill.requiredCertification,
        skill.isActive ? 'true' : 'false',
        skill.createdAt?.toISOString(),
      ]),
      {
        header: true,
        columns: [
          'Skill Code',
          'Skill Name',
          'Category',
          'Description',
          'Required Certification',
          'Active',
          'Created At',
        ],
      },
    );

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="skills-${timestamp}.csv"`,
    });
    return csv;
  }

  @RequirePermissions(PermissionCode.SKILL_UPDATE)
  @Post('bulk-status')
  async bulkStatus(@Body() dto: BulkSkillActionDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.bulkSetStatus(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_DELETE)
  @Post('bulk-delete')
  async bulkDelete(@Body() dto: BulkDeleteDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.bulkDelete(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_VIEW)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.skillsService.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_UPDATE)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.update(id, updateSkillDto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_DELETE)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    await this.skillsService.remove(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data: {},
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_UPDATE)
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.restore(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_UPDATE)
  @Patch(':id/activate')
  async activate(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.setStatus(id, true, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.SKILL_UPDATE)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.skillsService.setStatus(id, false, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
