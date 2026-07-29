import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';
import { Employee } from '../employees/entities/employee.entity';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @RequirePermissions(PermissionCode.VIEW_DASHBOARD)
  @Get('summary')
  async getSummary(@Req() req: Request & { user: AuthenticatedUser }) {
    // dashboard.service.ts's signature (user?: Employee) is untouched — only reads user?.id,
    // so the lean auth-chain user shape is safe to pass here via a type-only cast.
    return this.dashboardService.getSummary(
      req.user as unknown as Employee,
      req.user.permissions,
    );
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('analytics')
  async getAnalytics() {
    return this.dashboardService.getAnalytics();
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('department-kpis')
  async getDepartmentKpis() {
    return this.dashboardService.getDepartmentKpis();
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('skill-gap')
  async getSkillGap() {
    return this.dashboardService.getSkillGap();
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('certifications')
  async getCertificationAnalytics() {
    return this.dashboardService.getCertificationAnalytics();
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('approvals-analytics')
  async getApprovalsAnalytics() {
    return this.dashboardService.getApprovalsAnalytics();
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('workforce-distribution')
  async getWorkforceDistribution() {
    return this.dashboardService.getWorkforceDistribution();
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('trends')
  async getTrends() {
    return this.dashboardService.getTrends();
  }
}
