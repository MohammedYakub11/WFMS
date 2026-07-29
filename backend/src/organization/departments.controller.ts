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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { OrgListQueryDto } from './dto/list-query.dto';
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
@Controller('organization/departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  async create(@Body() dto: CreateDepartmentDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.service.create(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get()
  async findAll(@Query() query: OrgListQueryDto) {
    const data = await this.service.findAll(query);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.service.update(id, dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    await this.service.remove(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data: {},
      errors: null,
    };
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.service.restore(id, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
