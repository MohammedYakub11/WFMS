import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  DashboardSummaryDto,
  TopSkillDto,
  TrendInfoDto,
} from './dto/dashboard-summary.dto';
import {
  ApprovalBreakdownItemDto,
  CategoryBreakdownItemDto,
  DashboardAnalyticsDto,
  ProficiencyBreakdownItemDto,
} from './dto/dashboard-analytics.dto';
import { DashboardActivityItemDto } from './dto/dashboard-activity.dto';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Runs a metric query in isolation so one failing aggregation can't take down the whole dashboard response.
  private async safe<T>(
    metricName: string,
    fallback: T,
    fn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to compute dashboard metric "${metricName}": ${err.message}`,
        err.stack,
      );
      return fallback;
    }
  }

  async getSummary(user?: Employee) {
    const [
      totalEmployees,
      totalSkills,
      departments,
      topSkills,
      profileCompletion,
      notificationCount,
      employeeTrend,
      skillTrend,
    ] = await Promise.all([
      this.safe('totalEmployees', 0, () => this.getTotalEmployees()),
      this.safe('totalSkills', 0, () => this.getTotalSkills()),
      this.safe('departments', 0, () => this.getDepartmentCount()),
      this.safe<TopSkillDto[]>('topSkills', [], () => this.getTopSkills()),
      this.safe('profileCompletion', 0, () =>
        this.getProfileCompletion(user?.id),
      ),
      this.safe('notificationCount', 0, () =>
        this.notificationsService.countUnread(user?.id),
      ),
      this.safe<TrendInfoDto>(
        'employeeTrend',
        { percentage: 0, positive: true },
        () => this.getEmployeeTrend(),
      ),
      this.safe<TrendInfoDto>(
        'skillTrend',
        { percentage: 0, positive: true },
        () => this.getSkillTrend(),
      ),
    ]);

    const data: DashboardSummaryDto = {
      totalEmployees,
      totalSkills,
      departments,
      openRoles: 0, // No Job/Role/Opening entity exists yet — Phase 3.10 decision, revisit once that schema exists
      topSkills,
      profileCompletion,
      notificationCount,
      employeeTrend,
      skillTrend,
    };

    return {
      success: true,
      message: 'Dashboard summary fetched successfully',
      data,
      errors: null,
    };
  }

  async getAnalytics() {
    const [
      skillsByCategory,
      approvalStatusBreakdown,
      proficiencyDistribution,
      recentActivity,
    ] = await Promise.all([
      this.safe<CategoryBreakdownItemDto[]>('skillsByCategory', [], () =>
        this.getSkillsByCategory(),
      ),
      this.safe<ApprovalBreakdownItemDto[]>('approvalStatusBreakdown', [], () =>
        this.getApprovalStatusBreakdown(),
      ),
      this.safe<ProficiencyBreakdownItemDto[]>(
        'proficiencyDistribution',
        [],
        () => this.getProficiencyDistribution(),
      ),
      this.safe<DashboardActivityItemDto[]>('recentActivity', [], () =>
        this.getRecentActivity(),
      ),
    ]);

    const data: DashboardAnalyticsDto = {
      skillsByCategory,
      approvalStatusBreakdown,
      proficiencyDistribution,
      recentActivity,
    };

    return {
      success: true,
      message: 'Dashboard analytics fetched successfully',
      data,
      errors: null,
    };
  }

  private async getTotalEmployees(): Promise<number> {
    return this.employeeRepository.count({ where: { status: 'active' } });
  }

  private async getTotalSkills(): Promise<number> {
    return this.employeeSkillRepository.count({
      where: { approvalStatus: 'approved' },
    });
  }

  private async getDepartmentCount(): Promise<number> {
    const result = await this.employeeRepository
      .createQueryBuilder('e')
      .select('DISTINCT e.department', 'value')
      .where('e.department IS NOT NULL')
      .getRawMany<{ value: string }>();
    return result.length;
  }

  private async getTopSkills(): Promise<TopSkillDto[]> {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .leftJoin('es.skill', 'skill')
      .select('skill.skillName', 'name')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.approvalStatus = :status', { status: 'approved' })
      .groupBy('skill.skillName')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany<{ name: string; count: string }>();

    return rows.map((r) => ({ name: r.name, count: parseInt(r.count, 10) }));
  }

  private async getProfileCompletion(employeeId?: string): Promise<number> {
    if (!employeeId) return 0;

    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['profile_metadata'],
    });
    if (!employee) return 0;

    const fields = [
      employee.designation,
      employee.department,
      employee.location,
      employee.profile_image,
      employee.profile_metadata?.about_me,
      employee.profile_metadata?.address,
      employee.profile_metadata?.emergency_contact,
      employee.profile_metadata?.linkedin_url,
      employee.profile_metadata?.github_url,
      employee.profile_metadata?.portfolio_url,
    ];
    const filled = fields.filter(
      (f) => !!f && String(f).trim().length > 0,
    ).length;
    return Math.round((filled / fields.length) * 100);
  }

  private async getEmployeeTrend(): Promise<TrendInfoDto> {
    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
    const [total, newLast30] = await Promise.all([
      this.employeeRepository.count({ where: { status: 'active' } }),
      this.employeeRepository.count({
        where: { status: 'active', created_at: MoreThan(thirtyDaysAgo) },
      }),
    ]);
    return this.toTrend(total, newLast30);
  }

  private async getSkillTrend(): Promise<TrendInfoDto> {
    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
    const [total, newLast30] = await Promise.all([
      this.employeeSkillRepository.count({
        where: { approvalStatus: 'approved' },
      }),
      this.employeeSkillRepository.count({
        where: {
          approvalStatus: 'approved',
          createdAt: MoreThan(thirtyDaysAgo),
        },
      }),
    ]);
    return this.toTrend(total, newLast30);
  }

  // Growth-only trend: measures new records in the last 30 days against the prior baseline.
  // There is no deletion/attrition timestamp in the schema, so this cannot express negative trends.
  private toTrend(total: number, newInLast30Days: number): TrendInfoDto {
    const baseline = total - newInLast30Days;
    const percentage =
      baseline > 0
        ? Math.round((newInLast30Days / baseline) * 100)
        : newInLast30Days > 0
          ? 100
          : 0;
    return { percentage, positive: true };
  }

  private async getSkillsByCategory(): Promise<CategoryBreakdownItemDto[]> {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .leftJoin('es.skill', 'skill')
      .leftJoin('skill.category', 'category')
      .select('category.categoryName', 'categoryName')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.approvalStatus = :status', { status: 'approved' })
      .groupBy('category.categoryName')
      .orderBy('count', 'DESC')
      .getRawMany<{ categoryName: string; count: string }>();

    return rows.map((r) => ({
      categoryName: r.categoryName,
      count: parseInt(r.count, 10),
    }));
  }

  private async getApprovalStatusBreakdown(): Promise<
    ApprovalBreakdownItemDto[]
  > {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select('es.approvalStatus', 'status')
      .addSelect('COUNT(es.id)', 'count')
      .groupBy('es.approvalStatus')
      .getRawMany<{ status: string; count: string }>();

    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  private async getProficiencyDistribution(): Promise<
    ProficiencyBreakdownItemDto[]
  > {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select('es.proficiencyRating', 'rating')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.approvalStatus = :status', { status: 'approved' })
      .groupBy('es.proficiencyRating')
      .orderBy('es.proficiencyRating', 'ASC')
      .getRawMany<{ rating: number; count: string }>();

    return rows.map((r) => ({
      rating: Number(r.rating),
      count: parseInt(r.count, 10),
    }));
  }

  private async getRecentActivity(): Promise<DashboardActivityItemDto[]> {
    const [recentSkillChanges, recentEmployees] = await Promise.all([
      this.employeeSkillRepository.find({
        where: {
          approvalStatus: In(['approved', 'rejected', 'changes_requested']),
        },
        relations: ['employee', 'skill'],
        order: { updatedAt: 'DESC' },
        take: 10,
      }),
      this.employeeRepository.find({
        order: { created_at: 'DESC' },
        take: 10,
      }),
    ]);

    const skillActivity: DashboardActivityItemDto[] = recentSkillChanges.map(
      (es) => ({
        type: 'skill_status_change',
        title: `${es.skill?.skillName ?? 'Skill'} ${es.approvalStatus}`,
        subtitle: es.employee
          ? `${es.employee.first_name} ${es.employee.last_name}`
          : undefined,
        timestamp: es.updatedAt.toISOString(),
        status: es.approvalStatus,
      }),
    );

    const employeeActivity: DashboardActivityItemDto[] = recentEmployees.map(
      (emp) => ({
        type: 'new_employee',
        title: 'New employee joined',
        subtitle: `${emp.first_name} ${emp.last_name}`,
        timestamp: emp.created_at.toISOString(),
      }),
    );

    return [...skillActivity, ...employeeActivity]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);
  }
}
