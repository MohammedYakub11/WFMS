import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSkillsService } from './employee-skills.service';
import { EmployeeSkillsController } from './employee-skills.controller';
import { EmployeeSkill } from './entities/employee-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeSkill])],
  controllers: [EmployeeSkillsController],
  providers: [EmployeeSkillsService],
  exports: [EmployeeSkillsService],
})
export class EmployeeSkillsModule {}
