import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmployeeSkillsService } from './employee-skills.service';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';
import { RoleName } from '../common/enums/role-name.enum';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('employee-skills')
export class EmployeeSkillsController {
  constructor(private readonly employeeSkillsService: EmployeeSkillsService) {}

  @Post()
  async create(@Body() createEmployeeSkillDto: CreateEmployeeSkillDto) {
    const data = await this.employeeSkillsService.create(
      createEmployeeSkillDto,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get('pending')
  async findPending(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('department') department: string,
    @Query('categoryId') categoryId: string,
    @Query('status') status: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
  ) {
    const data = await this.employeeSkillsService.findPending(
      +page || 1,
      +limit || 10,
      {
        search,
        department,
        categoryId,
        status: status as 'new' | 'resubmitted',
        sortBy: sortBy as 'submittedAt' | 'employeeName',
        sortOrder: sortOrder as 'ASC' | 'DESC',
      },
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('employeeId') employeeId: string,
    @Query('skillId') skillId: string,
    @Request() req: { user?: { sub?: string; permissions?: string[] } },
  ) {
    let targetEmployeeId = employeeId;
    
    // RBAC: If the user lacks the global 'EMPLOYEE_SKILL_VIEW' permission,
    // enforce that they can only view their own skills.
    const hasGlobalView = req.user?.permissions?.includes(PermissionCode.EMPLOYEE_SKILL_VIEW);
    if (!hasGlobalView) {
      targetEmployeeId = req.user?.sub as string;
    }

    const data = await this.employeeSkillsService.findAll(
      +page || 1,
      +limit || 10,
      targetEmployeeId,
      skillId,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.employeeSkillsService.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get(':id/review')
  async getReviewDetail(@Param('id') id: string) {
    // Reuses findOne logic since it eager loads employee and skill relations
    const data = await this.employeeSkillsService.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeSkillDto: UpdateEmployeeSkillDto,
  ) {
    const data = await this.employeeSkillsService.update(
      id,
      updateEmployeeSkillDto,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.employeeSkillsService.remove(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data: {},
      errors: null,
    };
  }

  // Manager Actions
  @RequirePermissions(PermissionCode.EMPLOYEE_SKILL_UPDATE)
  @Roles(
    RoleName.WORKFORCE_MANAGER,
    RoleName.RESOURCE_MANAGER,
    RoleName.ADMINISTRATOR,
  )
  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const reviewerId = req.user?.sub || req.user?.id || 'system-admin';
    const data = await this.employeeSkillsService.approve(
      id,
      reviewerId,
      comments,
    );
    return {
      success: true,
      message: 'Skill approved successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_SKILL_UPDATE)
  @Roles(
    RoleName.WORKFORCE_MANAGER,
    RoleName.RESOURCE_MANAGER,
    RoleName.ADMINISTRATOR,
  )
  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const reviewerId = req.user?.sub || req.user?.id || 'system-admin';
    const data = await this.employeeSkillsService.reject(
      id,
      reviewerId,
      comments,
    );
    return {
      success: true,
      message: 'Skill rejected successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.EMPLOYEE_SKILL_UPDATE)
  @Roles(
    RoleName.WORKFORCE_MANAGER,
    RoleName.RESOURCE_MANAGER,
    RoleName.ADMINISTRATOR,
  )
  @Patch(':id/request-changes')
  async requestChanges(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const reviewerId = req.user?.sub || req.user?.id || 'system-admin';
    const data = await this.employeeSkillsService.requestChanges(
      id,
      reviewerId,
      comments,
    );
    return {
      success: true,
      message: 'Changes requested successfully.',
      data,
      errors: null,
    };
  }
}
