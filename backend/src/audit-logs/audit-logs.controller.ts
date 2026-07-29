import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @RequirePermissions(PermissionCode.VIEW_AUDIT_LOGS)
  @Get()
  async findAll(@Query() query: AuditLogQueryDto) {
    const data = await this.auditLogService.findAll(query);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.VIEW_AUDIT_LOGS)
  @Get('export')
  async export(
    @Query() query: AuditLogQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer | string> {
    const rows = await this.auditLogService.exportRows(query);
    const timestamp = new Date().toISOString().slice(0, 10);

    if (query.format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Audit Logs');
      sheet.columns = [
        { header: 'Created At', key: 'createdAt', width: 22 },
        { header: 'Module', key: 'module', width: 20 },
        { header: 'Entity', key: 'entity', width: 20 },
        { header: 'Entity ID', key: 'entityId', width: 36 },
        { header: 'Action', key: 'action', width: 20 },
        { header: 'User', key: 'user', width: 30 },
        { header: 'Old Value', key: 'oldValue', width: 40 },
        { header: 'New Value', key: 'newValue', width: 40 },
      ];
      rows.forEach((log) => {
        sheet.addRow({
          createdAt: log.createdAt,
          module: log.module,
          entity: log.entity,
          entityId: log.entityId,
          action: log.action,
          user: log.user
            ? (log.user.email ?? `${log.user.first_name} ${log.user.last_name}`)
            : null,
          oldValue: log.oldValue ? JSON.stringify(log.oldValue) : null,
          newValue: log.newValue ? JSON.stringify(log.newValue) : null,
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="audit-logs-${timestamp}.xlsx"`,
      });
      return Buffer.from(buffer);
    }

    const csv = stringify(
      rows.map((log) => [
        log.createdAt?.toISOString(),
        log.module,
        log.entity,
        log.entityId,
        log.action,
        log.user
          ? (log.user.email ?? `${log.user.first_name} ${log.user.last_name}`)
          : '',
        log.oldValue ? JSON.stringify(log.oldValue) : '',
        log.newValue ? JSON.stringify(log.newValue) : '',
      ]),
      {
        header: true,
        columns: [
          'Created At',
          'Module',
          'Entity',
          'Entity ID',
          'Action',
          'User',
          'Old Value',
          'New Value',
        ],
      },
    );

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="audit-logs-${timestamp}.csv"`,
    });
    return csv;
  }

  @RequirePermissions(PermissionCode.VIEW_AUDIT_LOGS)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.auditLogService.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
