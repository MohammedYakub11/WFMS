import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThan, Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { SkillCategory } from '../skill-categories/entities/skill-category.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  DashboardSummaryDto,
  MySkillsSummaryDto,
  TopSkillDto,
  TrendInfoDto,
} from './dto/dashboard-summary.dto';
import { PermissionCode } from '../common/enums/permission-code.enum';
import {
  ApprovalBreakdownItemDto,
  CategoryBreakdownItemDto,
  DashboardAnalyticsDto,
  ProficiencyBreakdownItemDto,
} from './dto/dashboard-analytics.dto';
import { DashboardActivityItemDto } from './dto/dashboard-activity.dto';
import { DepartmentKpiDto } from './dto/dashboard-department-kpi.dto';
import { SkillGapDto } from './dto/dashboard-skill-gap.dto';
import {
  CertificationAnalyticsDto,
  TopIssuingOrganizationDto,
} from './dto/dashboard-certification-analytics.dto';
import {
  ApprovalsAnalyticsDto,
  TopReviewerDto,
} from './dto/dashboard-approvals-analytics.dto';
import {
  DepartmentDesignationCountDto,
  LocationCountDto,
  WorkforceDistributionDto,
} from './dto/dashboard-workforce-distribution.dto';
import { MonthlyCountDto, TrendsDto } from './dto/dashboard-trends.dto';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
    @InjectRepository(SkillCategory)
    private readonly skillCategoryRepository: Repository<SkillCategory>,
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

  // Org-wide aggregates are gated on VIEW_ANALYTICS so an Employee's response never carries
  // data about the wider organization — only their own profile/skill/notification figures.
  async getSummary(user?: Employee, permissions: string[] = []) {
    const canViewAnalytics = permissions.includes(PermissionCode.VIEW_ANALYTICS);

    const [
      totalEmployees,
      totalSkills,
      departments,
      topSkills,
      profileCompletion,
      notificationCount,
      employeeTrend,
      skillTrend,
      mySkills,
    ] = await Promise.all([
      canViewAnalytics
        ? this.safe('totalEmployees', 0, () => this.getTotalEmployees())
        : Promise.resolve(0),
      canViewAnalytics
        ? this.safe('totalSkills', 0, () => this.getTotalSkills())
        : Promise.resolve(0),
      canViewAnalytics
        ? this.safe('departments', 0, () => this.getDepartmentCount())
        : Promise.resolve(0),
      canViewAnalytics
        ? this.safe<TopSkillDto[]>('topSkills', [], () => this.getTopSkills())
        : Promise.resolve([]),
      this.safe('profileCompletion', 0, () =>
        this.getProfileCompletion(user?.id),
      ),
      this.safe('notificationCount', 0, () =>
        this.notificationsService.countUnread(user?.id),
      ),
      canViewAnalytics
        ? this.safe<TrendInfoDto>(
            'employeeTrend',
            { percentage: 0, positive: true },
            () => this.getEmployeeTrend(),
          )
        : Promise.resolve({ percentage: 0, positive: true }),
      canViewAnalytics
        ? this.safe<TrendInfoDto>(
            'skillTrend',
            { percentage: 0, positive: true },
            () => this.getSkillTrend(),
          )
        : Promise.resolve({ percentage: 0, positive: true }),
      this.safe<MySkillsSummaryDto>(
        'mySkills',
        {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          changesRequested: 0,
          completionPercentage: 0,
        },
        () => this.getMySkillsSummary(user?.id),
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
      mySkills,
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

  async getDepartmentKpis() {
    const data = await this.safe<DepartmentKpiDto[]>('departmentKpis', [], () =>
      this.computeDepartmentKpis(),
    );

    return {
      success: true,
      message: 'Department KPIs fetched successfully',
      data,
      errors: null,
    };
  }

  async getSkillGap() {
    const data = await this.safe<SkillGapDto[]>('skillGap', [], () =>
      this.computeSkillGap(),
    );

    return {
      success: true,
      message: 'Skill gap analytics fetched successfully',
      data,
      errors: null,
    };
  }

  async getCertificationAnalytics() {
    const [certifiedBreakdown, topIssuingOrganizations, expiringSoonCount] =
      await Promise.all([
        this.safe<{ certifiedCount: number; notCertifiedCount: number }>(
          'certificationBreakdown',
          { certifiedCount: 0, notCertifiedCount: 0 },
          () => this.getCertificationBreakdown(),
        ),
        this.safe<TopIssuingOrganizationDto[]>(
          'topIssuingOrganizations',
          [],
          () => this.getTopIssuingOrganizations(),
        ),
        this.safe('expiringSoonCount', 0, () => this.getExpiringSoonCount()),
      ]);

    const data: CertificationAnalyticsDto = {
      certifiedCount: certifiedBreakdown.certifiedCount,
      notCertifiedCount: certifiedBreakdown.notCertifiedCount,
      topIssuingOrganizations,
      expiringSoonCount,
    };

    return {
      success: true,
      message: 'Certification analytics fetched successfully',
      data,
      errors: null,
    };
  }

  async getApprovalsAnalytics() {
    const [statusBreakdown, avgReviewHours, topReviewers] = await Promise.all([
      this.safe<ApprovalBreakdownItemDto[]>('approvalStatusBreakdown', [], () =>
        this.getApprovalStatusBreakdown(),
      ),
      this.safe('avgReviewHours', 0, () => this.getAvgReviewHours()),
      this.safe<TopReviewerDto[]>('topReviewers', [], () =>
        this.getTopReviewers(),
      ),
    ]);

    const data: ApprovalsAnalyticsDto = {
      statusBreakdown,
      avgReviewHours,
      topReviewers,
    };

    return {
      success: true,
      message: 'Approvals analytics fetched successfully',
      data,
      errors: null,
    };
  }

  async getWorkforceDistribution() {
    const [byDepartmentDesignation, byLocation] = await Promise.all([
      this.safe<DepartmentDesignationCountDto[]>(
        'byDepartmentDesignation',
        [],
        () => this.getWorkforceByDepartmentDesignation(),
      ),
      this.safe<LocationCountDto[]>('byLocation', [], () =>
        this.getWorkforceByLocation(),
      ),
    ]);

    const data: WorkforceDistributionDto = {
      byDepartmentDesignation,
      byLocation,
    };

    return {
      success: true,
      message: 'Workforce distribution fetched successfully',
      data,
      errors: null,
    };
  }

  async getTrends() {
    const [employeeGrowth, skillSubmissions] = await Promise.all([
      this.safe<MonthlyCountDto[]>('employeeGrowth', [], () =>
        this.getEmployeeGrowthTrend(),
      ),
      this.safe<MonthlyCountDto[]>('skillSubmissions', [], () =>
        this.getSkillSubmissionTrend(),
      ),
    ]);

    const data: TrendsDto = {
      employeeGrowth,
      skillSubmissions,
    };

    return {
      success: true,
      message: 'Trends fetched successfully',
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

  private async getMySkillsSummary(
    employeeId?: string,
  ): Promise<MySkillsSummaryDto> {
    const empty: MySkillsSummaryDto = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      changesRequested: 0,
      completionPercentage: 0,
    };
    if (!employeeId) return empty;

    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select('es.approvalStatus', 'status')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.employeeId = :employeeId', { employeeId })
      .groupBy('es.approvalStatus')
      .getRawMany<{ status: string; count: string }>();

    const counts = rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = parseInt(r.count, 10);
      return acc;
    }, {});

    const approved = counts['approved'] ?? 0;
    const pending = counts['pending'] ?? 0;
    const rejected = counts['rejected'] ?? 0;
    const changesRequested = counts['changes_requested'] ?? 0;
    const total = approved + pending + rejected + changesRequested;

    return {
      total,
      approved,
      pending,
      rejected,
      changesRequested,
      completionPercentage:
        total > 0 ? Math.round((approved / total) * 100) : 0,
    };
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

  private async computeDepartmentKpis(): Promise<DepartmentKpiDto[]> {
    const headcountRows = await this.employeeRepository
      .createQueryBuilder('e')
      .select('e.department', 'department')
      .addSelect('COUNT(e.id)', 'headcount')
      .addSelect('AVG(e.experience)', 'avgExperience')
      .where('e.department IS NOT NULL')
      .groupBy('e.department')
      .getRawMany<{
        department: string;
        headcount: string;
        avgExperience: string | null;
      }>();

    const skillRows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .leftJoin('es.employee', 'employee')
      .select('employee.department', 'department')
      .addSelect('COUNT(es.id)', 'approvedSkillCount')
      .addSelect('AVG(es.proficiencyRating)', 'avgProficiency')
      .where('es.approvalStatus = :status', { status: 'approved' })
      .andWhere('employee.department IS NOT NULL')
      .groupBy('employee.department')
      .getRawMany<{
        department: string;
        approvedSkillCount: string;
        avgProficiency: string | null;
      }>();

    const skillsByDepartment = new Map(
      skillRows.map((r) => [
        r.department,
        {
          approvedSkillCount: parseInt(r.approvedSkillCount, 10),
          avgProficiency: r.avgProficiency ? Number(r.avgProficiency) : 0,
        },
      ]),
    );

    return headcountRows.map((r) => {
      const skillStats = skillsByDepartment.get(r.department);
      return {
        department: r.department,
        headcount: parseInt(r.headcount, 10),
        avgExperience: r.avgExperience
          ? Math.round(Number(r.avgExperience) * 100) / 100
          : 0,
        approvedSkillCount: skillStats?.approvedSkillCount ?? 0,
        avgProficiency: skillStats
          ? Math.round(skillStats.avgProficiency * 100) / 100
          : 0,
      };
    });
  }

  private async computeSkillGap(): Promise<SkillGapDto[]> {
    const rows = await this.skillCategoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.skills', 'skill')
      .leftJoin('skill.employeeSkills', 'es', 'es.approvalStatus = :status', {
        status: 'approved',
      })
      .select('category.categoryName', 'categoryName')
      .addSelect('COUNT(es.id)', 'totalCount')
      .addSelect(
        'SUM(CASE WHEN es.proficiencyRating < 3 THEN 1 ELSE 0 END)',
        'belowCount',
      )
      .addSelect(
        'SUM(CASE WHEN skill.requiredCertification IS NOT NULL AND es.isCertified = false THEN 1 ELSE 0 END)',
        'certGapCount',
      )
      .groupBy('category.categoryName')
      .getRawMany<{
        categoryName: string;
        totalCount: string;
        belowCount: string | null;
        certGapCount: string | null;
      }>();

    return rows.map((r) => {
      const total = parseInt(r.totalCount, 10);
      const below = r.belowCount ? parseInt(r.belowCount, 10) : 0;
      return {
        categoryName: r.categoryName,
        belowProficiencyPct:
          total > 0 ? Math.round((below / total) * 10000) / 100 : 0,
        certificationGapCount: r.certGapCount
          ? parseInt(r.certGapCount, 10)
          : 0,
      };
    });
  }

  private async getCertificationBreakdown(): Promise<{
    certifiedCount: number;
    notCertifiedCount: number;
  }> {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select('es.isCertified', 'isCertified')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.approvalStatus = :status', { status: 'approved' })
      .groupBy('es.isCertified')
      .getRawMany<{ isCertified: boolean | string; count: string }>();

    let certifiedCount = 0;
    let notCertifiedCount = 0;
    for (const r of rows) {
      const isCertified = r.isCertified === true || r.isCertified === 'true';
      const count = parseInt(r.count, 10);
      if (isCertified) {
        certifiedCount += count;
      } else {
        notCertifiedCount += count;
      }
    }
    return { certifiedCount, notCertifiedCount };
  }

  private async getTopIssuingOrganizations(): Promise<
    TopIssuingOrganizationDto[]
  > {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select('es.issuingOrganization', 'name')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.issuingOrganization IS NOT NULL')
      .andWhere("es.issuingOrganization != ''")
      .groupBy('es.issuingOrganization')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany<{ name: string; count: string }>();

    return rows.map((r) => ({ name: r.name, count: parseInt(r.count, 10) }));
  }

  private async getExpiringSoonCount(): Promise<number> {
    const now = new Date();
    const in90Days = new Date(now.getTime() + NINETY_DAYS_MS);
    return this.employeeSkillRepository.count({
      where: { expiryDate: Between(now, in90Days) },
    });
  }

  private async getAvgReviewHours(): Promise<number> {
    const row = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select(
        'AVG(EXTRACT(EPOCH FROM (es.reviewedAt - es.submittedAt)))',
        'avgSeconds',
      )
      .where('es.reviewedAt IS NOT NULL')
      .andWhere('es.submittedAt IS NOT NULL')
      .getRawOne<{ avgSeconds: string | null }>();

    if (!row?.avgSeconds) return 0;
    return Math.round((Number(row.avgSeconds) / 3600) * 100) / 100;
  }

  private async getTopReviewers(): Promise<TopReviewerDto[]> {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select('es.reviewedBy', 'employeeId')
      .addSelect('COUNT(es.id)', 'count')
      .where('es.reviewedBy IS NOT NULL')
      .groupBy('es.reviewedBy')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany<{ employeeId: string; count: string }>();

    if (rows.length === 0) return [];

    const employeeIds = rows.map((r) => r.employeeId);
    const employees = await this.employeeRepository.find({
      where: { id: In(employeeIds) },
    });
    const nameMap = new Map(
      employees.map((e) => [e.id, `${e.first_name} ${e.last_name}`]),
    );

    return rows.map((r) => ({
      employeeId: r.employeeId,
      name: nameMap.get(r.employeeId) ?? 'Unknown',
      count: parseInt(r.count, 10),
    }));
  }

  private async getWorkforceByDepartmentDesignation(): Promise<
    DepartmentDesignationCountDto[]
  > {
    const rows = await this.employeeRepository
      .createQueryBuilder('e')
      .select('e.department', 'department')
      .addSelect('e.designation', 'designation')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.department IS NOT NULL')
      .andWhere('e.designation IS NOT NULL')
      .groupBy('e.department')
      .addGroupBy('e.designation')
      .getRawMany<{ department: string; designation: string; count: string }>();

    return rows.map((r) => ({
      department: r.department,
      designation: r.designation,
      count: parseInt(r.count, 10),
    }));
  }

  private async getWorkforceByLocation(): Promise<LocationCountDto[]> {
    const rows = await this.employeeRepository
      .createQueryBuilder('e')
      .select('e.location', 'location')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.location IS NOT NULL')
      .groupBy('e.location')
      .getRawMany<{ location: string; count: string }>();

    return rows.map((r) => ({
      location: r.location,
      count: parseInt(r.count, 10),
    }));
  }

  private getSixMonthsAgo(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }

  private async getEmployeeGrowthTrend(): Promise<MonthlyCountDto[]> {
    const rows = await this.employeeRepository
      .createQueryBuilder('employee')
      .select("date_trunc('month', employee.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('employee.created_at >= :from', { from: this.getSixMonthsAgo() })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<{ month: Date; count: string }>();

    return rows.map((r) => ({
      month: new Date(r.month).toISOString().slice(0, 10),
      count: parseInt(r.count, 10),
    }));
  }

  private async getSkillSubmissionTrend(): Promise<MonthlyCountDto[]> {
    const rows = await this.employeeSkillRepository
      .createQueryBuilder('es')
      .select("date_trunc('month', es.createdAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('es.createdAt >= :from', { from: this.getSixMonthsAgo() })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<{ month: Date; count: string }>();

    return rows.map((r) => ({
      month: new Date(r.month).toISOString().slice(0, 10),
      count: parseInt(r.count, 10),
    }));
  }
}
