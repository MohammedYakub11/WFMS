import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { EmployeeRole } from '../roles/entities/employee-role.entity';
import { EmployeesService } from '../employees/employees.service';
import { seedPermissions } from './seed-permissions';
import { seedRoles } from './seed-roles';
import { seedRolePermissions } from './seed-role-permissions';
import { seedAdminRole } from './seed-admin-role';

const logger = new Logger('SeedAll');

// Runs the full RBAC seed in the required order, in a single application
// context: permissions -> roles -> role-permission mappings -> admin role
// assignment. Each step is independently idempotent, so this is safe to
// re-run at any time (e.g. on every deploy).
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    const permissionRepository = app.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
    const rolePermissionRepository = app.get<Repository<RolePermission>>(
      getRepositoryToken(RolePermission),
    );
    const employeeRoleRepository = app.get<Repository<EmployeeRole>>(
      getRepositoryToken(EmployeeRole),
    );
    const employeesService = app.get(EmployeesService);

    logger.log('Starting full RBAC seed...');

    await seedPermissions(permissionRepository);
    await seedRoles(roleRepository);
    await seedRolePermissions(
      roleRepository,
      permissionRepository,
      rolePermissionRepository,
    );
    await seedAdminRole(
      employeesService,
      roleRepository,
      employeeRoleRepository,
    );

    logger.log('Full RBAC seed complete.');
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  bootstrap()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error running full RBAC seed:', err);
      process.exit(1);
    });
}
