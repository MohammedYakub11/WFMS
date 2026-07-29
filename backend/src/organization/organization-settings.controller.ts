import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrganizationProfileService } from './organization-profile.service';
import { OrganizationSettingsService } from './organization-settings.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

interface AuthedRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@RequirePermissions(PermissionCode.ORGANIZATION_MANAGEMENT)
@Controller('organization')
export class OrganizationSettingsController {
  constructor(
    private readonly profileService: OrganizationProfileService,
    private readonly settingsService: OrganizationSettingsService,
  ) {}

  @Get('profile')
  async getProfile() {
    const data = await this.profileService.get();
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Put('profile')
  async updateProfile(
    @Body() dto: UpdateOrganizationProfileDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.profileService.update(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get('settings')
  async getSettings() {
    const data = await this.settingsService.get();
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Put('settings')
  async updateSettings(
    @Body() dto: UpdateOrganizationSettingsDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.settingsService.update(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
