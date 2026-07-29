import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSkillsService } from './employee-skills.service';
import { EmployeeSkillsController } from './employee-skills.controller';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeSkill]),
    NotificationsModule,
    AuditLogModule,
  ],
  controllers: [EmployeeSkillsController],
  providers: [EmployeeSkillsService],
  exports: [EmployeeSkillsService],
})
export class EmployeeSkillsModule {}
