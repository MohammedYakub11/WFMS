import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Employee } from '../employees/entities/employee.entity';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Req() req: Request & { user: Employee }) {
    // Pass user to determine role-based stats later
    return this.dashboardService.getSummary(req.user);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: Request & { user: Employee }) {
    return this.dashboardService.getAnalytics(req.user);
  }
}
