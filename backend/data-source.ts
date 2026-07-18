import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Employee } from './src/employees/entities/employee.entity';
import { ProfileMetadata } from './src/employees/entities/profile-metadata.entity';
import { Notification } from './src/notifications/entities/notification.entity';
import { SkillCategory } from './src/skill-categories/entities/skill-category.entity';
import { Skill } from './src/skills/entities/skill.entity';
import { EmployeeSkill } from './src/employee-skills/entities/employee-skill.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wfms_db',
  synchronize: false,
  logging: true,
  entities: [Employee, ProfileMetadata, Notification, SkillCategory, Skill, EmployeeSkill],
  migrations: ['./src/migrations/*.ts'],
});
