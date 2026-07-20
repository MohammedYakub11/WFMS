import {
  Body,
  Controller,
  Delete,
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
import { NotificationsService } from './notifications.service';
import { NotificationListQueryDto } from './dto/notification-list-query.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

interface AuthedRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  async unreadCount(@Req() req: AuthedRequest) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.countUnread(employeeId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get('preferences')
  async getPreferences(@Req() req: AuthedRequest) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.getPreferences(
      employeeId as string,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Put('preferences')
  async updatePreferences(
    @Body() dto: UpdateNotificationPreferencesDto,
    @Req() req: AuthedRequest,
  ) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.updatePreferences(
      employeeId as string,
      dto,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Patch('read-all')
  async markAllRead(@Req() req: AuthedRequest) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.markAllRead(
      employeeId as string,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @RequirePermissions(PermissionCode.NOTIFICATION_SEND)
  @Post('broadcast')
  async broadcast(@Body() dto: SendNotificationDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.broadcast(dto, actorId);
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Get()
  async findAll(
    @Query() query: NotificationListQueryDto,
    @Req() req: AuthedRequest,
  ) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.findAllForUser(
      employeeId as string,
      query,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Req() req: AuthedRequest) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.markRead(
      id,
      employeeId as string,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    const employeeId = req.user?.sub || req.user?.id;
    const data = await this.notificationsService.remove(
      id,
      employeeId as string,
    );
    return {
      success: true,
      message: 'Operation completed successfully.',
      data,
      errors: null,
    };
  }
}
