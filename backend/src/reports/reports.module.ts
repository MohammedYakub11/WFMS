import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportHistory } from './entities/report-history.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { Skill } from '../skills/entities/skill.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportHistory, Employee, EmployeeSkill, Skill]),
    AuditLogModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
