import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { ProfileMetadata } from './entities/profile-metadata.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeListQueryDto } from './dto/employee-list-query.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { RolesService } from '../roles/roles.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

const MAX_REPORTING_CHAIN_DEPTH = 50;

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(ProfileMetadata)
    private readonly profileMetadataRepository: Repository<ProfileMetadata>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
    private readonly auditLogService: AuditLogService,
    private readonly rolesService: RolesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByEmail(email: string): Promise<Employee | null> {
    // We need to add select: ['password'] because it's excluded by default in entity
    return this.employeeRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        first_name: true,
        last_name: true,
        employee_code: true,
        designation: true,
        department: true,
        status: true,
      },
    });
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  // Helper method for initial setup or testing
  async create(employeeData: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    return this.employeeRepository.save(employee);
  }

  async updateProfile(id: string, updateData: Partial<Employee>) {
    // In a real app, we would validate updateData via DTOs and handle profile metadata
    // For now, we update the base Employee fields
    await this.employeeRepository.update(id, updateData);
    return this.findById(id);
  }

  // --- Employee Administration (Phase 4.1) ---

  async createEmployee(
    dto: CreateEmployeeDto,
    actorId?: string,
  ): Promise<Employee> {
    const [existingEmail, existingCode] = await Promise.all([
      this.employeeRepository.findOne({
        where: { email: dto.email },
        withDeleted: true,
      }),
      this.employeeRepository.findOne({
        where: { employee_code: dto.employee_code },
        withDeleted: true,
      }),
    ]);
    if (existingEmail) {
      throw new ConflictException('An employee with this email already exists');
    }
    if (existingCode) {
      throw new ConflictException(
        'An employee with this employee code already exists',
      );
    }
    if (dto.reportingManagerId) {
      await this.assertNoReportingCycle(dto.reportingManagerId, null);
    }

    const { reportingManagerId, roleId, ...rest } = dto;
    const employee = this.employeeRepository.create({
      ...rest,
      reportingManagerId: reportingManagerId ?? null,
    });
    const saved = await this.employeeRepository.save(employee);

    await this.rolesService.assignRole(
      saved.id,
      roleId ?? (await this.getDefaultRoleId()),
      actorId,
    );

    await this.auditLogService.record({
      userId: actorId,
      module: 'EMPLOYEES',
      entity: 'Employee',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { employee_code: saved.employee_code, email: saved.email },
    });

    try {
      await this.notificationsService.create({
        employeeId: saved.id,
        title: 'Welcome',
        message: 'Your employee account has been created.',
        type: NotificationType.EMPLOYEE_UPDATE,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send welcome notification for employee ${saved.id}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return saved;
  }

  async findAllPaginated(query: EmployeeListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'DESC';

    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    if (query.includeDeleted) {
      queryBuilder.withDeleted();
    }

    if (query.keyword) {
      const term = `%${query.keyword}%`;
      queryBuilder.andWhere(
        '(employee.first_name ILIKE :term OR employee.last_name ILIKE :term OR employee.email ILIKE :term OR employee.employee_code ILIKE :term)',
        { term },
      );
    }
    if (query.department) {
      queryBuilder.andWhere('employee.department = :department', {
        department: query.department,
      });
    }
    if (query.designation) {
      queryBuilder.andWhere('employee.designation = :designation', {
        designation: query.designation,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('employee.status = :status', {
        status: query.status,
      });
    }
    if (query.location) {
      queryBuilder.andWhere('employee.location = :location', {
        location: query.location,
      });
    }

    queryBuilder
      .orderBy(`employee.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneDetailed(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['profile_metadata', 'reportingManager'],
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const [role, employeeSkills] = await Promise.all([
      this.rolesService.getActiveRoleForEmployee(id),
      this.employeeSkillRepository.find({
        where: { employeeId: id, approvalStatus: 'approved' },
        relations: ['skill'],
      }),
    ]);

    const totalSkills = employeeSkills.length;
    const averageProficiency =
      totalSkills > 0
        ? employeeSkills.reduce(
            (acc, es) => acc + (es.proficiencyRating || 0),
            0,
          ) / totalSkills
        : 0;
    const certifiedSkills = employeeSkills.filter((es) => es.isCertified);

    return {
      ...employee,
      role: role ? { id: role.id, name: role.name } : null,
      skillsSummary: {
        totalSkills,
        certifiedCount: certifiedSkills.length,
        averageProficiency: Math.round(averageProficiency * 10) / 10,
        topSkills: employeeSkills
          .slice()
          .sort((a, b) => b.proficiencyRating - a.proficiencyRating)
          .slice(0, 5)
          .map((es) => ({
            skillName: es.skill?.skillName,
            proficiencyRating: es.proficiencyRating,
          })),
      },
      certifications: certifiedSkills.map((es) => ({
        skillName: es.skill?.skillName,
        certificationName: es.certificationName,
        issuingOrganization: es.issuingOrganization,
        issueDate: es.issueDate,
        expiryDate: es.expiryDate,
      })),
    };
  }

  async updateEmployee(
    id: string,
    dto: UpdateEmployeeDto,
    actorId?: string,
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.email && dto.email !== employee.email) {
      const existingEmail = await this.employeeRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(
          'An employee with this email already exists',
        );
      }
    }
    if (dto.reportingManagerId) {
      await this.assertNoReportingCycle(dto.reportingManagerId, id);
    }

    const oldValue = {
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      status: employee.status,
    };

    Object.assign(employee, dto);
    const saved = await this.employeeRepository.save(employee);

    await this.auditLogService.record({
      userId: actorId,
      module: 'EMPLOYEES',
      entity: 'Employee',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: {
        first_name: saved.first_name,
        last_name: saved.last_name,
        email: saved.email,
        department: saved.department,
        designation: saved.designation,
        status: saved.status,
      },
    });

    try {
      await this.notificationsService.create({
        employeeId: id,
        title: 'Profile Updated',
        message: 'Your employee profile was updated.',
        type: NotificationType.EMPLOYEE_UPDATE,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send profile-updated notification for employee ${id}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return saved;
  }

  async softDeleteEmployee(id: string, actorId?: string): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeRepository.softRemove(employee);

    try {
      await this.rolesService.revokeRole(id, actorId);
    } catch {
      // No active role assignment to revoke — not an error condition for delete.
    }

    await this.auditLogService.record({
      userId: actorId,
      module: 'EMPLOYEES',
      entity: 'Employee',
      entityId: id,
      action: 'DELETE',
      oldValue: {
        employee_code: employee.employee_code,
        email: employee.email,
      },
    });
  }

  async restoreEmployee(id: string, actorId?: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    if (!employee.deletedAt) {
      throw new ConflictException('Employee is not deleted');
    }

    await this.employeeRepository.restore(id);

    await this.auditLogService.record({
      userId: actorId,
      module: 'EMPLOYEES',
      entity: 'Employee',
      entityId: id,
      action: 'RESTORE',
      newValue: {
        employee_code: employee.employee_code,
        email: employee.email,
      },
    });

    return this.findById(id) as Promise<Employee>;
  }

  async setStatus(
    id: string,
    status: 'active' | 'inactive',
    actorId?: string,
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const oldStatus = employee.status;
    employee.status = status;
    const saved = await this.employeeRepository.save(employee);

    await this.auditLogService.record({
      userId: actorId,
      module: 'EMPLOYEES',
      entity: 'Employee',
      entityId: id,
      action: status === 'active' ? 'ACTIVATE' : 'DEACTIVATE',
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    return saved;
  }

  private async getDefaultRoleId(): Promise<string> {
    const roles = await this.rolesService.findAll();
    const employeeRole = roles.find((r) => r.name === 'Employee');
    if (!employeeRole) {
      throw new NotFoundException('Default Employee role is not seeded');
    }
    return employeeRole.id;
  }

  private async assertNoReportingCycle(
    managerId: string,
    employeeId: string | null,
  ): Promise<void> {
    if (employeeId && managerId === employeeId) {
      throw new ConflictException('An employee cannot report to themselves');
    }

    let currentId: string | null = managerId;
    for (let depth = 0; depth < MAX_REPORTING_CHAIN_DEPTH; depth += 1) {
      if (!currentId) return;
      if (employeeId && currentId === employeeId) {
        throw new ConflictException(
          'This reporting-manager assignment would create a cycle',
        );
      }
      const manager: Pick<Employee, 'reportingManagerId'> | null =
        await this.employeeRepository.findOne({
          where: { id: currentId },
          select: { reportingManagerId: true },
        });
      currentId = manager?.reportingManagerId ?? null;
    }
  }
}
