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
    return this.dashboardService.getSummary(req.user as unknown as Employee);
  }

  @RequirePermissions(PermissionCode.VIEW_ANALYTICS)
  @Get('analytics')
  async getAnalytics() {
    return this.dashboardService.getAnalytics();
  }
}
