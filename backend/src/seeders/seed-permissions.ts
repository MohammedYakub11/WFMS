import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Permission } from '../roles/entities/permission.entity';
import { PERMISSION_CATALOG } from '../common/enums/permission-code.enum';

const logger = new Logger('SeedPermissions');

// Upserts every PermissionCode enum value (via PERMISSION_CATALOG, the
// project's existing name/category mapping for each code — see
// src/common/enums/permission-code.enum.ts) into the permissions table.
// Idempotent: matches on the unique `code` column and skips anything that
// already exists, so it is safe to run on every deploy.
export async function seedPermissions(
  permissionRepository: Repository<Permission>,
): Promise<void> {
  logger.log(`Seeding ${PERMISSION_CATALOG.length} permissions...`);

  let created = 0;
  let skipped = 0;

  for (const entry of PERMISSION_CATALOG) {
    const existing = await permissionRepository.findOne({
      where: { code: entry.code },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await permissionRepository.save(
      permissionRepository.create({
        code: entry.code,
        name: entry.name,
        category: entry.category,
      }),
    );
    created++;
    logger.log(`  created permission: ${entry.code}`);
  }

  logger.log(
    `Permissions seed complete. Created ${created}, skipped ${skipped} existing.`,
  );
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const permissionRepository = app.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
    await seedPermissions(permissionRepository);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  bootstrap()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error seeding permissions:', err);
      process.exit(1);
    });
}
