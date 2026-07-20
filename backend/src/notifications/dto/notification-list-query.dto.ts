import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class NotificationListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['unread', 'read', 'all'])
  filter?: 'unread' | 'read' | 'all';

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
