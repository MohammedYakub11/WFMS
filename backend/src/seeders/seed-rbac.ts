import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { EmployeeRole } from '../roles/entities/employee-role.entity';
import { EmployeesService } from '../employees/employees.service';
import { PERMISSION_CATALOG } from '../common/enums/permission-code.enum';
import {
  RoleName,
  ROLE_PERMISSION_MATRIX,
} from '../common/enums/role-name.enum';

// Idempotent — safe to re-run. Resets the RBAC catalog (roles/permissions/role-permission
// mappings) to the PRD defaults; does not touch any employee's existing role assignment
// unless they currently have none.
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

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

  console.log('Upserting permission catalog...');
  for (const p of PERMISSION_CATALOG) {
    const existing = await permissionRepository.findOne({
      where: { code: p.code },
    });
    if (!existing) {
      await permissionRepository.save(permissionRepository.create(p));
      console.log(`  created permission ${p.code}`);
    }
  }

  console.log('Upserting roles...');
  const roleEntities = new Map<string, Role>();
  for (const roleName of Object.values(RoleName)) {
    let role = await roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      role = await roleRepository.save(
        roleRepository.create({
          name: roleName,
          description: `System-seeded ${roleName} role`,
          isSystem: true,
        }),
      );
      console.log(`  created role ${roleName}`);
    }
    roleEntities.set(roleName, role);
  }

  console.log('Syncing role-permission mappings to PRD matrix...');
  for (const [roleName, codes] of Object.entries(ROLE_PERMISSION_MATRIX)) {
    const role = roleEntities.get(roleName);
    if (!role) continue;

    const existingMappings = await rolePermissionRepository.find({
      where: { roleId: role.id },
    });
    await rolePermissionRepository.remove(existingMappings);

    for (const code of codes) {
      const permission = await permissionRepository.findOne({
        where: { code },
      });
      if (!permission) continue;
      await rolePermissionRepository.save(
        rolePermissionRepository.create({
          roleId: role.id,
          permissionId: permission.id,
        }),
      );
    }
    console.log(`  ${roleName}: ${codes.length} permissions`);
  }

  console.log('Ensuring admin@wfms.com has an active role...');
  const admin = await employeesService.findByEmail('admin@wfms.com');
  if (admin) {
    const activeAssignment = await employeeRoleRepository.findOne({
      where: { employeeId: admin.id, deletedAt: IsNull() },
    });
    if (!activeAssignment) {
      const adminRole = roleEntities.get(RoleName.ADMINISTRATOR);
      if (adminRole) {
        await employeeRoleRepository.save(
          employeeRoleRepository.create({
            employeeId: admin.id,
            roleId: adminRole.id,
          }),
        );
        console.log('  assigned Administrator role to admin@wfms.com');
      }
    } else {
      console.log('  admin@wfms.com already has an active role assignment');
    }
  } else {
    console.log('  admin@wfms.com not found — skipping role assignment');
  }

  console.log('RBAC seed complete.');
  await app.close();
}

void bootstrap().catch((err) => {
  console.error('Error seeding RBAC catalog:', err);
  process.exit(1);
});
