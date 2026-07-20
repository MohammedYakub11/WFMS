import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, Employee]),
    AuditLogModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
