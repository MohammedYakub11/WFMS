import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessUnit } from './entities/business-unit.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { Location } from './entities/location.entity';
import { Holiday } from './entities/holiday.entity';
import { OrganizationProfile } from './entities/organization-profile.entity';
import { OrganizationSettings } from './entities/organization-settings.entity';
import { BusinessUnitsService } from './business-units.service';
import { DepartmentsService } from './departments.service';
import { DesignationsService } from './designations.service';
import { LocationsService } from './locations.service';
import { HolidaysService } from './holidays.service';
import { OrganizationProfileService } from './organization-profile.service';
import { OrganizationSettingsService } from './organization-settings.service';
import { BusinessUnitsController } from './business-units.controller';
import { DepartmentsController } from './departments.controller';
import { DesignationsController } from './designations.controller';
import { LocationsController } from './locations.controller';
import { HolidaysController } from './holidays.controller';
import { OrganizationSettingsController } from './organization-settings.controller';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessUnit,
      Department,
      Designation,
      Location,
      Holiday,
      OrganizationProfile,
      OrganizationSettings,
    ]),
    AuditLogModule,
  ],
  controllers: [
    BusinessUnitsController,
    DepartmentsController,
    DesignationsController,
    LocationsController,
    HolidaysController,
    OrganizationSettingsController,
  ],
  providers: [
    BusinessUnitsService,
    DepartmentsService,
    DesignationsService,
    LocationsService,
    HolidaysService,
    OrganizationProfileService,
    OrganizationSettingsService,
  ],
  exports: [
    BusinessUnitsService,
    DepartmentsService,
    DesignationsService,
    LocationsService,
    HolidaysService,
    OrganizationProfileService,
    OrganizationSettingsService,
  ],
})
export class OrganizationModule {}
