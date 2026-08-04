import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Role } from '../roles/entities/role.entity';
import { RoleName } from '../common/enums/role-name.enum';

const logger = new Logger('SeedRoles');

// Upserts the system roles into the roles table. Roles come from the
// project's existing RoleName enum (src/common/enums/role-name.enum.ts) —
// Administrator, Workforce Manager, Resource Manager, Employee — rather than
// a hardcoded list, so this stays in sync if that enum ever changes.
//
// Note: the RoleName enum has no plain "Manager" role. The two closest
// existing roles are Workforce Manager and Resource Manager, which are
// already referenced by name throughout the rest of the app (route guards,
// frontend role gating). Seeding an unrelated "Manager" role would create a
// role nothing else in the codebase recognizes, so this seeder uses the
// real enum instead.
//
// Idempotent: matches on the unique `name` column and skips anything that
// already exists. Returns a name -> Role map so downstream seeders
// (role-permissions, admin-role) don't need to re-query.
export async function seedRoles(
  roleRepository: Repository<Role>,
): Promise<Map<string, Role>> {
  logger.log('Seeding system roles...');

  const roles = new Map<string, Role>();
  let created = 0;
  let skipped = 0;

  for (const roleName of Object.values(RoleName)) {
    let role = await roleRepository.findOne({ where: { name: roleName } });

    if (!role) {
      role = await roleRepository.save(
        roleRepository.create({
          name: roleName,
          description: `System-seeded ${roleName} role`,
          isSystem: true,
          isActive: true,
        }),
      );
      created++;
      logger.log(`  created role: ${roleName}`);
    } else {
      skipped++;
    }

    roles.set(roleName, role);
  }

  logger.log(
    `Roles seed complete. Created ${created}, skipped ${skipped} existing.`,
  );
  return roles;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    await seedRoles(roleRepository);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  bootstrap()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error seeding roles:', err);
      process.exit(1);
    });
}
