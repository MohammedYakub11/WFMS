import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Role } from '../roles/entities/role.entity';
import { EmployeeRole } from '../roles/entities/employee-role.entity';
import { EmployeesService } from '../employees/employees.service';
import { RoleName } from '../common/enums/role-name.enum';

const logger = new Logger('SeedAdminRole');

const ADMIN_EMAIL = 'admin@wfms.com';

// Assigns the Administrator role to admin@wfms.com. Only one active
// (non-deleted) role assignment is allowed per employee (enforced by a
// partial unique index — see employee-role.entity.ts), so this checks for
// an existing active assignment before inserting rather than assuming none
// exists.
export async function seedAdminRole(
  employeesService: EmployeesService,
  roleRepository: Repository<Role>,
  employeeRoleRepository: Repository<EmployeeRole>,
): Promise<void> {
  logger.log(`Ensuring ${ADMIN_EMAIL} has the Administrator role...`);

  const admin = await employeesService.findByEmail(ADMIN_EMAIL);
  if (!admin) {
    logger.warn(`  ${ADMIN_EMAIL} not found — skipping role assignment.`);
    return;
  }

  const adminRole = await roleRepository.findOne({
    where: { name: RoleName.ADMINISTRATOR },
  });
  if (!adminRole) {
    logger.warn(
      '  Administrator role not found — run seed-roles first. Skipping.',
    );
    return;
  }

  const activeAssignment = await employeeRoleRepository.findOne({
    where: { employeeId: admin.id, deletedAt: IsNull() },
    relations: ['role'],
  });

  if (activeAssignment) {
    if (activeAssignment.roleId === adminRole.id) {
      logger.log(
        `  ${ADMIN_EMAIL} already has the Administrator role. Nothing to do.`,
      );
    } else {
      logger.log(
        `  ${ADMIN_EMAIL} already has an active role assignment (${activeAssignment.role?.name ?? activeAssignment.roleId}) — leaving it as-is.`,
      );
    }
    return;
  }

  await employeeRoleRepository.save(
    employeeRoleRepository.create({
      employeeId: admin.id,
      roleId: adminRole.id,
    }),
  );
  logger.log(`  assigned Administrator role to ${ADMIN_EMAIL}.`);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const employeesService = app.get(EmployeesService);
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    const employeeRoleRepository = app.get<Repository<EmployeeRole>>(
      getRepositoryToken(EmployeeRole),
    );
    await seedAdminRole(
      employeesService,
      roleRepository,
      employeeRoleRepository,
    );
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  bootstrap()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error seeding admin role assignment:', err);
      process.exit(1);
    });
}
