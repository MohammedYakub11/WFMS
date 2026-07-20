import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { Employee } from '../employees/entities/employee.entity';
import { ProfileMetadata } from '../employees/entities/profile-metadata.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { SkillCategory } from '../skill-categories/entities/skill-category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wfms_db',
  entities: [
    Employee,
    ProfileMetadata,
    Notification,
    SkillCategory,
    Skill,
    EmployeeSkill,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
