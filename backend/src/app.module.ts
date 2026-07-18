import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { Employee } from './employees/entities/employee.entity';
import { ProfileMetadata } from './employees/entities/profile-metadata.entity';
import { Notification } from './notifications/entities/notification.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { SkillCategory } from './skill-categories/entities/skill-category.entity';
import { Skill } from './skills/entities/skill.entity';
import { EmployeeSkill } from './employee-skills/entities/employee-skill.entity';
import { SkillCategoriesModule } from './skill-categories/skill-categories.module';
import { SkillsModule } from './skills/skills.module';
import { EmployeeSkillsModule } from './employee-skills/employee-skills.module';
import { SearchModule } from './search/search.module';
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'wfms_db'),
          entities: [Employee, ProfileMetadata, Notification, SkillCategory, Skill, EmployeeSkill],
          synchronize: false,
          migrationsRun: configService.get<string>('MIGRATIONS_RUN', 'true') === 'true',
        };

        return config;
      },
    }),
    AuthModule,
    EmployeesModule,
    DashboardModule,
    SkillCategoriesModule,
    SkillsModule,
    EmployeeSkillsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
