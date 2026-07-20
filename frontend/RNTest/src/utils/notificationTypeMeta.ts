import { LightColors } from '../theme/colors';
import { NotificationType } from '../types/notifications';

export interface NotificationTypeMeta {
  icon: string;
  color: string;
  label: string;
}

// Keyed by the known backend `type` enum values. `type` is treated as an
// open-ended string (see types/notifications.ts) so any value not present
// here falls back to a safe default via getNotificationTypeMeta — never throw
// on an unrecognized type.
export const NOTIFICATION_TYPE_META: Record<string, NotificationTypeMeta> = {
  INFO: { icon: 'ℹ️', color: LightColors.textSecondary, label: 'Info' },
  SKILL_APPROVAL: { icon: '✅', color: LightColors.statusApproved, label: 'Skill Approved' },
  SKILL_REJECTION: { icon: '❌', color: LightColors.statusRejected, label: 'Skill Rejected' },
  SYSTEM: { icon: '⚙️', color: LightColors.textSecondary, label: 'System' },
  REMINDER: { icon: '⏰', color: LightColors.warning, label: 'Reminder' },
  EMPLOYEE_UPDATE: { icon: '👤', color: LightColors.primary, label: 'Employee Update' },
  ROLE_ASSIGNED: { icon: '🛡️', color: LightColors.statusApproved, label: 'Role Assigned' },
  ROLE_REVOKED: { icon: '🚫', color: LightColors.statusRejected, label: 'Role Revoked' },
  SYSTEM_ANNOUNCEMENT: { icon: '📢', color: LightColors.primary, label: 'Announcement' },
  SECURITY_ALERT: { icon: '⚠️', color: LightColors.error, label: 'Security Alert' },
};

const DEFAULT_META: Omit<NotificationTypeMeta, 'label'> = {
  icon: '🔔',
  color: LightColors.statusDisabled,
};

export const getNotificationTypeMeta = (type: NotificationType): NotificationTypeMeta => {
  const meta = NOTIFICATION_TYPE_META[type];
  if (meta) {
    return meta;
  }
  return { ...DEFAULT_META, label: type };
};
