import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { EmployeeRole } from './entities/employee-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { RoleName } from '../common/enums/role-name.enum';

export interface EffectivePermissions {
  roleName: string;
  permissionCodes: string[];
}

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(EmployeeRole)
    private readonly employeeRoleRepository: Repository<EmployeeRole>,
    private readonly auditLogService: AuditLogService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Called by AuthService when signing tokens — one query, no per-request DB hit thereafter.
  async getEffectivePermissions(
    employeeId: string,
  ): Promise<EffectivePermissions> {
    const activeAssignment = await this.employeeRoleRepository.findOne({
      where: { employeeId, deletedAt: IsNull() },
      relations: ['role'],
    });

    // An employee with no active role assignment (never assigned, or the
    // assignment was revoked/soft-deleted) still gets valid tokens — default
    // them to the baseline Employee role rather than leaving role/permissions
    // empty, which broke frontend role checks (`user.role === ''` reads as
    // "no role" everywhere instead of "least-privileged role").
    const roleId = activeAssignment
      ? activeAssignment.roleId
      : (await this.roleRepository.findOne({ where: { name: RoleName.EMPLOYEE } }))?.id;
    const roleName = activeAssignment ? activeAssignment.role.name : RoleName.EMPLOYEE;

    if (!roleId) {
      return { roleName, permissionCodes: [] };
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return {
      roleName,
      permissionCodes: rolePermissions.map((rp) => rp.permission.code),
    };
  }

  async create(dto: CreateRoleDto, actorId?: string): Promise<Role> {
    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
    });
    const saved = await this.roleRepository.save(role);

    if (dto.permissionCodes?.length) {
      await this.replacePermissions(saved.id, dto.permissionCodes);
    }

    await this.auditLogService.record({
      userId: actorId,
      module: 'ROLES',
      entity: 'Role',
      entityId: saved.id,
      action: 'CREATE',
      newValue: {
        name: saved.name,
        description: saved.description,
        permissionCodes: dto.permissionCodes ?? [],
      },
    });

    return this.findOne(saved.id);
  }

  async findAll(
    search?: string,
  ): Promise<Array<Role & { permissionCount: number; employeeCount: number }>> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');
    if (search) {
      queryBuilder.andWhere('role.name ILIKE :search', {
        search: `%${search}%`,
      });
    }
    const roles = await queryBuilder.orderBy('role.name', 'ASC').getMany();

    const results = await Promise.all(
      roles.map(async (role) => {
        const [permissionCount, employeeCount] = await Promise.all([
          this.rolePermissionRepository.count({ where: { roleId: role.id } }),
          this.employeeRoleRepository.count({
            where: { roleId: role.id, deletedAt: IsNull() },
          }),
        ]);
        return Object.assign(role, { permissionCount, employeeCount });
      }),
    );

    return results;
  }

  async findOne(id: string): Promise<Role & { permissions: Permission[] }> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: id },
      relations: ['permission'],
    });
    return Object.assign(role, {
      permissions: rolePermissions.map((rp) => rp.permission),
    });
  }

  async update(
    id: string,
    dto: UpdateRoleDto,
    actorId?: string,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem && dto.name && dto.name !== role.name) {
      throw new ForbiddenException('System roles cannot be renamed');
    }

    const oldValue = {
      name: role.name,
      description: role.description,
      isActive: role.isActive,
    };
    Object.assign(role, dto);
    const saved = await this.roleRepository.save(role);

    await this.auditLogService.record({
      userId: actorId,
      module: 'ROLES',
      entity: 'Role',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: {
        name: saved.name,
        description: saved.description,
        isActive: saved.isActive,
      },
    });

    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }
    const activeAssignments = await this.employeeRoleRepository.count({
      where: { roleId: id, deletedAt: IsNull() },
    });
    if (activeAssignments > 0) {
      throw new ConflictException(
        'Role is currently assigned to one or more employees',
      );
    }

    await this.roleRepository.softRemove(role);

    await this.auditLogService.record({
      userId: actorId,
      module: 'ROLES',
      entity: 'Role',
      entityId: id,
      action: 'DELETE',
      oldValue: { name: role.name },
    });
  }

  async replacePermissions(
    roleId: string,
    permissionCodes: string[],
    actorId?: string,
  ): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.permissionRepository.find({
      where: permissionCodes.map((code) => ({ code })),
    });

    const existing = await this.rolePermissionRepository.find({
      where: { roleId },
    });
    const oldCodes = await this.getPermissionCodesForRole(roleId);

    await this.rolePermissionRepository.manager.transaction(async (manager) => {
      if (existing.length) {
        await manager.remove(existing);
      }
      const newRows = permissions.map((permission) =>
        manager.create(RolePermission, { roleId, permissionId: permission.id }),
      );
      if (newRows.length) {
        await manager.save(newRows);
      }
    });

    await this.auditLogService.record({
      userId: actorId,
      module: 'ROLES',
      entity: 'Role',
      entityId: roleId,
      action: 'PERMISSIONS_UPDATED',
      oldValue: { permissionCodes: oldCodes },
      newValue: { permissionCodes: permissions.map((p) => p.code) },
    });

    return permissions;
  }

  private async getPermissionCodesForRole(roleId: string): Promise<string[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
    return rolePermissions.map((rp) => rp.permission.code);
  }

  async getRoleEmployees(roleId: string, page = 1, limit = 10) {
    const [items, total] = await this.employeeRoleRepository.findAndCount({
      where: { roleId, deletedAt: IsNull() },
      relations: ['employee'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map((er) => er.employee),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // `manager` lets a caller (e.g. EmployeesService.createEmployee) fold this assignment
  // into its own transaction — the insert then shares the caller's DB transaction instead
  // of committing separately, so a bad roleId rolls back the caller's insert too.
  async assignRole(
    employeeId: string,
    roleId: string,
    assignedBy?: string,
    manager?: EntityManager,
  ): Promise<EmployeeRole> {
    const roleRepo = manager
      ? manager.getRepository(Role)
      : this.roleRepository;
    const employeeRoleRepo = manager
      ? manager.getRepository(EmployeeRole)
      : this.employeeRoleRepository;

    const role = await roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const current = await employeeRoleRepo.findOne({
      where: { employeeId, deletedAt: IsNull() },
      relations: ['role'],
    });

    const doAssign = async (txManager: EntityManager) => {
      const txRepo = txManager.getRepository(EmployeeRole);
      if (current) {
        await txRepo.softRemove(current);
      }
      const newAssignment = txRepo.create({
        employeeId,
        roleId,
        assignedBy: assignedBy ?? null,
      });
      return txRepo.save(newAssignment);
    };

    const created = manager
      ? await doAssign(manager)
      : await this.employeeRoleRepository.manager.transaction(doAssign);

    // Best-effort audit + notification — never let a logging/notification failure
    // undo or fail an assignment that already committed successfully.
    try {
      await this.auditLogService.record({
        userId: assignedBy,
        module: 'EMPLOYEE_ROLES',
        entity: 'EmployeeRole',
        entityId: employeeId,
        action: 'ROLE_ASSIGNED',
        oldValue: current ? { roleName: current.role.name } : null,
        newValue: { roleName: role.name },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for role assignment (employee ${employeeId})`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    try {
      await this.notificationsService.create({
        employeeId,
        title: 'Role Assigned',
        message: `You have been assigned the ${role.name} role.`,
        type: NotificationType.ROLE_ASSIGNED,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send role-assigned notification for employee ${employeeId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return created;
  }

  async revokeRole(employeeId: string, actorId?: string): Promise<void> {
    const current = await this.employeeRoleRepository.findOne({
      where: { employeeId, deletedAt: IsNull() },
      relations: ['role'],
    });
    if (!current) {
      throw new NotFoundException('Employee has no active role assignment');
    }

    await this.employeeRoleRepository.softRemove(current);

    await this.auditLogService.record({
      userId: actorId,
      module: 'EMPLOYEE_ROLES',
      entity: 'EmployeeRole',
      entityId: employeeId,
      action: 'ROLE_REVOKED',
      oldValue: { roleName: current.role.name },
    });

    try {
      await this.notificationsService.create({
        employeeId,
        title: 'Role Revoked',
        message: `Your ${current.role.name} role has been revoked.`,
        type: NotificationType.ROLE_REVOKED,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send role-revoked notification for employee ${employeeId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async findAllPermissions(category?: string): Promise<Permission[]> {
    const where = category ? { category } : {};
    return this.permissionRepository.find({
      where,
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  // Used by EmployeesService to surface { id, name } on the Employee Details aggregate.
  async getActiveRoleForEmployee(employeeId: string): Promise<Role | null> {
    const activeAssignment = await this.employeeRoleRepository.findOne({
      where: { employeeId, deletedAt: IsNull() },
      relations: ['role'],
    });
    return activeAssignment?.role ?? null;
  }
}
