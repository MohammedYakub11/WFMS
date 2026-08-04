import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { ROLE_PERMISSION_MATRIX } from '../common/enums/role-name.enum';

const logger = new Logger('SeedRolePermissions');

// Syncs role_permissions to ROLE_PERMISSION_MATRIX
// (src/common/enums/role-name.enum.ts), which maps every role to its list
// of PermissionCode values directly from the enum — nothing here is a
// hardcoded string. Administrator's entry is `Object.values(PermissionCode)`,
// i.e. every permission that exists.
//
// Idempotent by diffing rather than delete-then-recreate: existing
// (role, permission) mappings are left untouched, and only the missing
// ones are inserted, so re-running this never produces duplicates and
// never churns rows that are already correct.
export async function seedRolePermissions(
  roleRepository: Repository<Role>,
  permissionRepository: Repository<Permission>,
  rolePermissionRepository: Repository<RolePermission>,
): Promise<void> {
  logger.log('Syncing role-permission mappings...');

  const allPermissions = await permissionRepository.find();
  const permissionIdByCode = new Map(allPermissions.map((p) => [p.code, p.id]));

  let totalCreated = 0;

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSION_MATRIX)) {
    const role = await roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      logger.warn(
        `  role "${roleName}" not found — run seed-roles first. Skipping.`,
      );
      continue;
    }

    const existingMappings = await rolePermissionRepository.find({
      where: { roleId: role.id },
    });
    const existingPermissionIds = new Set(
      existingMappings.map((m) => m.permissionId),
    );

    let createdForRole = 0;
    const missingCodes: string[] = [];

    for (const code of codes) {
      const permissionId = permissionIdByCode.get(code);
      if (!permissionId) {
        missingCodes.push(code);
        continue;
      }
      if (existingPermissionIds.has(permissionId)) {
        continue;
      }

      await rolePermissionRepository.save(
        rolePermissionRepository.create({ roleId: role.id, permissionId }),
      );
      createdForRole++;
      totalCreated++;
    }

    if (missingCodes.length > 0) {
      logger.warn(
        `  role "${roleName}": ${missingCodes.length} permission code(s) not found in DB — run seed-permissions first. Missing: ${missingCodes.join(', ')}`,
      );
    }

    logger.log(
      `  ${roleName}: ${codes.length} permission(s) in matrix, ${createdForRole} newly assigned.`,
    );
  }

  logger.log(
    `Role-permission sync complete. ${totalCreated} new mapping(s) created.`,
  );
}

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
    await seedRolePermissions(
      roleRepository,
      permissionRepository,
      rolePermissionRepository,
    );
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  bootstrap()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error seeding role-permission mappings:', err);
      process.exit(1);
    });
}
