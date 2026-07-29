import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto, PreviewReportDto } from './dto/generate-report.dto';
import { ReportHistoryQueryDto } from './dto/report-history-query.dto';
import { DownloadReportQueryDto } from './dto/download-report-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

interface AuthedRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @RequirePermissions(PermissionCode.REPORT_VIEW)
  @Post('preview')
  async preview(@Body() dto: PreviewReportDto) {
    const data = await this.reportsService.preview(dto);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.REPORT_VIEW)
  @Post('generate')
  async generate(@Body() dto: GenerateReportDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const history = await this.reportsService.generate(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data: {
        id: history.id,
        rowCount: history.rowCount,
        generatedAt: history.generatedAt,
      },
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EXPORT_REPORTS)
  @Post('generate-and-download')
  async generateAndDownload(
    @Body() dto: GenerateReportDto,
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer> {
    const actorId = req.user?.sub || req.user?.id;
    const { buffer, contentType, filename } =
      await this.reportsService.generateAndDownload(dto, actorId);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return buffer;
  }

  @RequirePermissions(PermissionCode.REPORT_VIEW)
  @Get('history')
  async findHistory(@Query() query: ReportHistoryQueryDto) {
    const data = await this.reportsService.findHistory(query);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.REPORT_VIEW)
  @Get('history/:id')
  async findHistoryOne(@Param('id') id: string) {
    const data = await this.reportsService.findHistoryOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.REPORT_VIEW)
  @Delete('history/:id')
  async removeHistory(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    await this.reportsService.removeHistory(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data: {},
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EXPORT_REPORTS)
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Query() query: DownloadReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer> {
    const { buffer, contentType, filename } =
      await this.reportsService.download(id, query.format);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return buffer;
  }
}
