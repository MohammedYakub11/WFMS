import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
