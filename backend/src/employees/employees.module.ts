import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { ProfileMetadata } from './entities/profile-metadata.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { AuditLogModule } from '../audit-logs/audit-log.module';
import { RolesModule } from '../roles/roles.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, ProfileMetadata, EmployeeSkill]),
    AuditLogModule,
    RolesModule,
    NotificationsModule,
  ],
  providers: [EmployeesService],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
