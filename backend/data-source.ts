import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Employee } from './src/employees/entities/employee.entity';
import { ProfileMetadata } from './src/employees/entities/profile-metadata.entity';
import { Notification } from './src/notifications/entities/notification.entity';
import { NotificationPreference } from './src/notifications/entities/notification-preference.entity';
import { SkillCategory } from './src/skill-categories/entities/skill-category.entity';
import { Skill } from './src/skills/entities/skill.entity';
import { EmployeeSkill } from './src/employee-skills/entities/employee-skill.entity';
import { Role } from './src/roles/entities/role.entity';
import { Permission } from './src/roles/entities/permission.entity';
import { RolePermission } from './src/roles/entities/role-permission.entity';
import { EmployeeRole } from './src/roles/entities/employee-role.entity';
import { AuditLog } from './src/audit-logs/entities/audit-log.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wfms_db',
  synchronize: true,
  logging: true,
  entities: [
    Employee,
    ProfileMetadata,
    Notification,
    NotificationPreference,
    SkillCategory,
    Skill,
    EmployeeSkill,
    Role,
    Permission,
    RolePermission,
    EmployeeRole,
    AuditLog,
  ],
  migrations: ['./src/migrations/*.ts'],
});
