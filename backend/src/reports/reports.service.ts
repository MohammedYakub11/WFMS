import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportHistory, ReportType } from './entities/report-history.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { Skill } from '../skills/entities/skill.entity';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { ReportHistoryQueryDto } from './dto/report-history-query.dto';
import { GenerateReportDto, PreviewReportDto } from './dto/generate-report.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  ColumnDef,
  exportTabular,
  TabularExportFormat,
} from '../common/utils/tabular-export.util';

export interface ReportData {
  columns: ColumnDef[];
  rows: Array<Record<string, unknown>>;
}

const PREVIEW_ROW_CAP = 100;
const EXPORT_ROW_CAP = 50000;

const REPORT_TITLES: Record<ReportType, string> = {
  employees: 'Employees Report',
  skills: 'Skills Report',
  departments: 'Departments Workforce Report',
  designations: 'Designations Workforce Report',
  locations: 'Locations Workforce Report',
  workforce_analytics: 'Workforce Analytics Report',
  audit_logs: 'Audit Logs Report',
  skill_approvals: 'Skill Approvals Report',
  certifications: 'Certifications Report',
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportHistory)
    private readonly historyRepository: Repository<ReportHistory>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async fetchData(
    reportType: ReportType,
    filters: ReportFiltersDto,
    cap: number,
  ): Promise<ReportData> {
    switch (reportType) {
      case 'employees':
        return this.fetchEmployees(filters, cap);
      case 'skills':
        return this.fetchSkills(filters, cap);
      case 'departments':
        return this.fetchDepartments(filters);
      case 'designations':
        return this.fetchDesignations(filters);
      case 'locations':
        return this.fetchLocations(filters);
      case 'workforce_analytics':
        return this.fetchWorkforceAnalytics(filters);
      case 'audit_logs':
        return this.fetchAuditLogs(filters, cap);
      case 'skill_approvals':
        return this.fetchSkillApprovals(filters, cap);
      case 'certifications':
        return this.fetchCertifications(filters, cap);
      default:
        throw new NotFoundException(
          `Unknown report type: ${String(reportType)}`,
        );
    }
  }

  async preview(dto: PreviewReportDto): Promise<{
    columns: ColumnDef[];
    rows: Array<Record<string, unknown>>;
    total: number;
  }> {
    const { columns, rows } = await this.fetchData(
      dto.reportType,
      dto.filters,
      PREVIEW_ROW_CAP,
    );
    return { columns, rows, total: rows.length };
  }

  async generate(
    dto: GenerateReportDto,
    actorId?: string,
  ): Promise<ReportHistory> {
    const { rows } = await this.fetchData(
      dto.reportType,
      dto.filters,
      EXPORT_ROW_CAP,
    );
    const history = this.historyRepository.create({
      reportType: dto.reportType,
      format: dto.format,
      filters: dto.filters as unknown as Record<string, unknown>,
      generatedBy: actorId ?? null,
      status: 'completed',
      rowCount: rows.length,
    });
    return this.historyRepository.save(history);
  }

  async findHistory(query: ReportHistoryQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.generator', 'generator');

    if (query.reportType) {
      queryBuilder.andWhere('history.reportType = :reportType', {
        reportType: query.reportType,
      });
    }
    if (query.format) {
      queryBuilder.andWhere('history.format = :format', {
        format: query.format,
      });
    }
    if (query.generatedBy) {
      queryBuilder.andWhere('history.generatedBy = :generatedBy', {
        generatedBy: query.generatedBy,
      });
    }
    queryBuilder.orderBy('history.generatedAt', 'DESC');

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findHistoryOne(id: string): Promise<ReportHistory> {
    const entity = await this.historyRepository.findOne({
      where: { id },
      relations: ['generator'],
    });
    if (!entity)
      throw new NotFoundException(`Report history entry ${id} not found`);
    return entity;
  }

  async download(
    id: string,
    format: TabularExportFormat,
  ): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const history = await this.findHistoryOne(id);
    const filters = history.filters as ReportFiltersDto;
    const { columns, rows } = await this.fetchData(
      history.reportType,
      filters,
      EXPORT_ROW_CAP,
    );

    const { buffer, contentType } = await exportTabular(
      rows,
      columns,
      format,
      REPORT_TITLES[history.reportType],
    );

    history.downloadCount += 1;
    history.lastDownloadedAt = new Date();
    await this.historyRepository.save(history);

    const timestamp = new Date().toISOString().slice(0, 10);
    return {
      buffer,
      contentType,
      filename: `${history.reportType}-${timestamp}.${format}`,
    };
  }

  async generateAndDownload(
    dto: GenerateReportDto,
    actorId?: string,
  ): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const history = await this.generate(dto, actorId);
    return this.download(history.id, dto.format);
  }

  async removeHistory(id: string, actorId?: string): Promise<void> {
    const history = await this.findHistoryOne(id);
    await this.historyRepository.softRemove(history);
    await this.auditLogService.record({
      userId: actorId,
      module: 'REPORTS',
      entity: 'ReportHistory',
      entityId: id,
      action: 'DELETE',
      oldValue: { reportType: history.reportType, format: history.format },
    });
  }

  // --- Data fetchers: each reuses existing entities/query patterns rather than
  // duplicating logic. Departments/Designations/Locations report on employee
  // workforce data grouped by those Employee string fields, not the Organization
  // module's separate master-data tables (per product decision).

  private async fetchEmployees(
    filters: ReportFiltersDto,
    cap: number,
  ): Promise<ReportData> {
    const qb = this.employeeRepository.createQueryBuilder('e');
    if (filters.department)
      qb.andWhere('e.department = :department', {
        department: filters.department,
      });
    if (filters.designation)
      qb.andWhere('e.designation = :designation', {
        designation: filters.designation,
      });
    if (filters.location)
      qb.andWhere('e.location = :location', { location: filters.location });
    if (filters.dateFrom)
      qb.andWhere('e.created_at >= :dateFrom', { dateFrom: filters.dateFrom });
    if (filters.dateTo)
      qb.andWhere('e.created_at <= :dateTo', { dateTo: filters.dateTo });
    qb.orderBy('e.created_at', 'DESC').take(cap);

    const employees = await qb.getMany();
    const columns: ColumnDef[] = [
      { header: 'Employee Code', key: 'employeeCode', width: 16 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Designation', key: 'designation', width: 18 },
      { header: 'Location', key: 'location', width: 16 },
      { header: 'Experience (yrs)', key: 'experience', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Joined Date', key: 'joinedDate', width: 16 },
    ];
    const rows = employees.map((e) => ({
      employeeCode: e.employee_code,
      name: `${e.first_name} ${e.last_name}`,
      email: e.email,
      department: e.department,
      designation: e.designation,
      location: e.location,
      experience: e.experience,
      status: e.status,
      joinedDate: e.created_at?.toISOString().slice(0, 10),
    }));
    return { columns, rows };
  }

  private async fetchSkills(
    filters: ReportFiltersDto,
    cap: number,
  ): Promise<ReportData> {
    const qb = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category');
    if (filters.skillCategoryId) {
      qb.andWhere('skill.categoryId = :categoryId', {
        categoryId: filters.skillCategoryId,
      });
    }
    if (filters.dateFrom)
      qb.andWhere('skill.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    if (filters.dateTo)
      qb.andWhere('skill.createdAt <= :dateTo', { dateTo: filters.dateTo });
    qb.orderBy('skill.skillName', 'ASC').take(cap);

    const skills = await qb.getMany();
    const columns: ColumnDef[] = [
      { header: 'Skill Name', key: 'skillName', width: 24 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Skill Code', key: 'skillCode', width: 16 },
      {
        header: 'Required Certification',
        key: 'requiredCertification',
        width: 24,
      },
      { header: 'Active', key: 'isActive', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 16 },
    ];
    const rows = skills.map((s) => ({
      skillName: s.skillName,
      category: s.category?.categoryName,
      skillCode: s.skillCode,
      requiredCertification: s.requiredCertification,
      isActive: s.isActive,
      createdAt: s.createdAt?.toISOString().slice(0, 10),
    }));
    return { columns, rows };
  }

  private async fetchDepartments(
    filters: ReportFiltersDto,
  ): Promise<ReportData> {
    const qb = this.employeeRepository
      .createQueryBuilder('e')
      .select('e.department', 'department')
      .addSelect('COUNT(e.id)', 'headcount')
      .addSelect('AVG(e.experience)', 'avgExperience')
      .where('e.department IS NOT NULL');
    if (filters.department)
      qb.andWhere('e.department = :department', {
        department: filters.department,
      });
    if (filters.location)
      qb.andWhere('e.location = :location', { location: filters.location });
    qb.groupBy('e.department').orderBy('headcount', 'DESC');

    const rows = await qb.getRawMany<{
      department: string;
      headcount: string;
      avgExperience: string | null;
    }>();
    const columns: ColumnDef[] = [
      { header: 'Department', key: 'department', width: 22 },
      { header: 'Headcount', key: 'headcount', width: 12 },
      { header: 'Avg Experience (yrs)', key: 'avgExperience', width: 18 },
    ];
    return {
      columns,
      rows: rows.map((r) => ({
        department: r.department,
        headcount: parseInt(r.headcount, 10),
        avgExperience: r.avgExperience
          ? Math.round(Number(r.avgExperience) * 100) / 100
          : 0,
      })),
    };
  }

  private async fetchDesignations(
    filters: ReportFiltersDto,
  ): Promise<ReportData> {
    const qb = this.employeeRepository
      .createQueryBuilder('e')
      .select('e.designation', 'designation')
      .addSelect('COUNT(e.id)', 'headcount')
      .addSelect('AVG(e.experience)', 'avgExperience')
      .where('e.designation IS NOT NULL');
    if (filters.designation)
      qb.andWhere('e.designation = :designation', {
        designation: filters.designation,
      });
    if (filters.department)
      qb.andWhere('e.department = :department', {
        department: filters.department,
      });
    qb.groupBy('e.designation').orderBy('headcount', 'DESC');

    const rows = await qb.getRawMany<{
      designation: string;
      headcount: string;
      avgExperience: string | null;
    }>();
    const columns: ColumnDef[] = [
      { header: 'Designation', key: 'designation', width: 22 },
      { header: 'Headcount', key: 'headcount', width: 12 },
      { header: 'Avg Experience (yrs)', key: 'avgExperience', width: 18 },
    ];
    return {
      columns,
      rows: rows.map((r) => ({
        designation: r.designation,
        headcount: parseInt(r.headcount, 10),
        avgExperience: r.avgExperience
          ? Math.round(Number(r.avgExperience) * 100) / 100
          : 0,
      })),
    };
  }

  private async fetchLocations(filters: ReportFiltersDto): Promise<ReportData> {
    const qb = this.employeeRepository
      .createQueryBuilder('e')
      .select('e.location', 'location')
      .addSelect('COUNT(e.id)', 'headcount')
      .where('e.location IS NOT NULL');
    if (filters.location)
      qb.andWhere('e.location = :location', { location: filters.location });
    if (filters.department)
      qb.andWhere('e.department = :department', {
        department: filters.department,
      });
    qb.groupBy('e.location').orderBy('headcount', 'DESC');

    const rows = await qb.getRawMany<{ location: string; headcount: string }>();
    const columns: ColumnDef[] = [
      { header: 'Location', key: 'location', width: 22 },
      { header: 'Headcount', key: 'headcount', width: 12 },
    ];
    return {
      columns,
      rows: rows.map((r) => ({
        location: r.location,
        headcount: parseInt(r.headcount, 10),
      })),
    };
  }

  private async fetchWorkforceAnalytics(
    filters: ReportFiltersDto,
  ): Promise<ReportData> {
    const qb = this.employeeRepository
      .createQueryBuilder('e')
      .select('e.department', 'department')
      .addSelect('e.designation', 'designation')
      .addSelect('e.location', 'location')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.department IS NOT NULL')
      .andWhere('e.designation IS NOT NULL');
    if (filters.department)
      qb.andWhere('e.department = :department', {
        department: filters.department,
      });
    if (filters.designation)
      qb.andWhere('e.designation = :designation', {
        designation: filters.designation,
      });
    if (filters.location)
      qb.andWhere('e.location = :location', { location: filters.location });
    qb.groupBy('e.department')
      .addGroupBy('e.designation')
      .addGroupBy('e.location')
      .orderBy('count', 'DESC');

    const rows = await qb.getRawMany<{
      department: string;
      designation: string;
      location: string;
      count: string;
    }>();
    const columns: ColumnDef[] = [
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Location', key: 'location', width: 18 },
      { header: 'Headcount', key: 'count', width: 12 },
    ];
    return {
      columns,
      rows: rows.map((r) => ({
        department: r.department,
        designation: r.designation,
        location: r.location,
        count: parseInt(r.count, 10),
      })),
    };
  }

  private async fetchAuditLogs(
    filters: ReportFiltersDto,
    cap: number,
  ): Promise<ReportData> {
    const logs = await this.auditLogService.exportRows({
      userId: filters.employeeId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page: 1,
      limit: cap,
    });
    const columns: ColumnDef[] = [
      { header: 'Date', key: 'date', width: 18 },
      { header: 'Module', key: 'module', width: 16 },
      { header: 'Entity', key: 'entity', width: 16 },
      { header: 'Action', key: 'action', width: 12 },
      { header: 'User', key: 'user', width: 20 },
    ];
    const rows = logs.slice(0, cap).map((log) => ({
      date: log.createdAt?.toISOString(),
      module: log.module,
      entity: log.entity,
      action: log.action,
      user: log.user
        ? `${log.user.first_name} ${log.user.last_name}`
        : log.userId,
    }));
    return { columns, rows };
  }

  private async fetchSkillApprovals(
    filters: ReportFiltersDto,
    cap: number,
  ): Promise<ReportData> {
    const qb = this.employeeSkillRepository
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.employee', 'employee')
      .leftJoinAndSelect('es.skill', 'skill');
    if (filters.approvalStatus)
      qb.andWhere('es.approvalStatus = :status', {
        status: filters.approvalStatus,
      });
    if (filters.employeeId)
      qb.andWhere('es.employeeId = :employeeId', {
        employeeId: filters.employeeId,
      });
    if (filters.skillId)
      qb.andWhere('es.skillId = :skillId', { skillId: filters.skillId });
    if (filters.dateFrom)
      qb.andWhere('es.submittedAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    if (filters.dateTo)
      qb.andWhere('es.submittedAt <= :dateTo', { dateTo: filters.dateTo });
    qb.orderBy('es.submittedAt', 'DESC').take(cap);

    const rows = await qb.getMany();
    const columns: ColumnDef[] = [
      { header: 'Employee', key: 'employee', width: 24 },
      { header: 'Skill', key: 'skill', width: 20 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Submitted At', key: 'submittedAt', width: 18 },
      { header: 'Reviewed At', key: 'reviewedAt', width: 18 },
    ];
    return {
      columns,
      rows: rows.map((es) => ({
        employee: es.employee
          ? `${es.employee.first_name} ${es.employee.last_name}`
          : '',
        skill: es.skill?.skillName,
        status: es.approvalStatus,
        submittedAt: es.submittedAt?.toISOString(),
        reviewedAt: es.reviewedAt?.toISOString(),
      })),
    };
  }

  private async fetchCertifications(
    filters: ReportFiltersDto,
    cap: number,
  ): Promise<ReportData> {
    const qb = this.employeeSkillRepository
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.employee', 'employee')
      .leftJoinAndSelect('es.skill', 'skill')
      .where('es.approvalStatus = :status', { status: 'approved' });
    const wantCertified = filters.certificationStatus !== 'not_certified';
    qb.andWhere('es.isCertified = :isCertified', {
      isCertified: wantCertified,
    });
    if (filters.employeeId)
      qb.andWhere('es.employeeId = :employeeId', {
        employeeId: filters.employeeId,
      });
    if (filters.skillId)
      qb.andWhere('es.skillId = :skillId', { skillId: filters.skillId });
    qb.orderBy('es.expiryDate', 'ASC').take(cap);

    const rows = await qb.getMany();
    const columns: ColumnDef[] = [
      { header: 'Employee', key: 'employee', width: 24 },
      { header: 'Skill', key: 'skill', width: 20 },
      { header: 'Certification', key: 'certificationName', width: 24 },
      { header: 'Issuing Organization', key: 'issuingOrganization', width: 24 },
      { header: 'Issue Date', key: 'issueDate', width: 14 },
      { header: 'Expiry Date', key: 'expiryDate', width: 14 },
    ];
    return {
      columns,
      rows: rows.map((es) => ({
        employee: es.employee
          ? `${es.employee.first_name} ${es.employee.last_name}`
          : '',
        skill: es.skill?.skillName,
        certificationName: es.certificationName,
        issuingOrganization: es.issuingOrganization,
        issueDate: es.issueDate,
        expiryDate: es.expiryDate,
      })),
    };
  }
}
