import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

interface AuthedRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Post()
  async create(@Body() dto: CreateRoleDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.rolesService.create(dto, actorId);
    return {
      success: true,
      message: 'Role created successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Get()
  async findAll(@Query('search') search?: string) {
    const data = await this.rolesService.findAll(search);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.rolesService.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.rolesService.update(id, dto, actorId);
    return {
      success: true,
      message: 'Role updated successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    await this.rolesService.remove(id, actorId);
    return {
      success: true,
      message: 'Role deleted successfully.',
      data: {},
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Put(':id/permissions')
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.rolesService.replacePermissions(
      id,
      dto.permissionCodes,
      actorId,
    );
    return {
      success: true,
      message: 'Permissions updated successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Get(':id/employees')
  async getRoleEmployees(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const data = await this.rolesService.getRoleEmployees(
      id,
      +page || 1,
      +limit || 10,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Post('assignments')
  async assignRole(@Body() dto: AssignRoleDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.rolesService.assignRole(
      dto.employeeId,
      dto.roleId,
      actorId,
    );
    return {
      success: true,
      message: 'Role assigned successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.ROLE_MANAGEMENT)
  @Delete('assignments/:employeeId')
  async revokeRole(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    await this.rolesService.revokeRole(employeeId, actorId);
    return {
      success: true,
      message: 'Role revoked successfully.',
      data: {},
      errors: null,
    };
  }
}
