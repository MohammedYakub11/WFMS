import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  NotificationPriority,
  NotificationType,
} from '../entities/notification.entity';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  link?: string;

  @IsIn(['all', 'selected'])
  target: 'all' | 'selected';

  @ValidateIf((o: SendNotificationDto) => o.target === 'selected')
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  employeeIds?: string[];
}
