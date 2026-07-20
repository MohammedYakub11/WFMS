import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @RequirePermissions(
    PermissionCode.ROLE_MANAGEMENT,
    PermissionCode.PERMISSION_MANAGEMENT,
  )
  @Get()
  async findAll(@Query('category') category?: string) {
    const data = await this.rolesService.findAllPermissions(category);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
