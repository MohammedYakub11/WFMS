import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeListQueryDto } from './dto/employee-list-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface AuthedRequest extends Request {
  user?: AuthenticatedUser;
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequirePermissions(PermissionCode.EMPLOYEE_CREATE)
  @Post()
  async create(@Body() dto: CreateEmployeeDto, @Req() req: AuthedRequest) {
    const data = await this.employeesService.createEmployee(dto, req.user?.sub);
    return {
      success: true,
      message: 'Employee created successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_VIEW)
  @Get()
  async findAll(@Query() query: EmployeeListQueryDto) {
    const data = await this.employeesService.findAllPaginated(query);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  // Self-access carve-out: any authenticated employee may view their own record,
  // even without EMPLOYEE_VIEW (which gates the directory-wide list above).
  @Get(':id')
  async getProfile(@Param('id') id: string, @Req() req: AuthedRequest) {
    if (
      id !== req.user?.sub &&
      !req.user?.permissions?.includes(PermissionCode.EMPLOYEE_VIEW)
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to view this employee',
      );
    }
    const data = await this.employeesService.findOneDetailed(id);
    return {
      success: true,
      message: 'Profile fetched successfully',
      data,
      errors: null,
    };
  }

  // Self-access carve-out, mirroring GET above.
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: AuthedRequest,
  ) {
    if (
      id !== req.user?.sub &&
      !req.user?.permissions?.includes(PermissionCode.EMPLOYEE_UPDATE)
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to update this employee',
      );
    }
    const data = await this.employeesService.updateEmployee(
      id,
      dto,
      req.user?.sub,
    );
    return {
      success: true,
      message: 'Profile updated successfully',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_DELETE)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await this.employeesService.softDeleteEmployee(id, req.user?.sub);
    return {
      success: true,
      message: 'Employee deleted successfully.',
      data: {},
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_DELETE)
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: AuthedRequest) {
    const data = await this.employeesService.restoreEmployee(id, req.user?.sub);
    return {
      success: true,
      message: 'Employee restored successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_UPDATE)
  @Patch(':id/activate')
  async activate(@Param('id') id: string, @Req() req: AuthedRequest) {
    const data = await this.employeesService.setStatus(
      id,
      'active',
      req.user?.sub,
    );
    return {
      success: true,
      message: 'Employee activated successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_UPDATE)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: AuthedRequest) {
    const data = await this.employeesService.setStatus(
      id,
      'inactive',
      req.user?.sub,
    );
    return {
      success: true,
      message: 'Employee deactivated successfully.',
      data,
      errors: null,
    };
  }
}
