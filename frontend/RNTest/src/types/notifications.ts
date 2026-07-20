export type NotificationType =
  | 'INFO'
  | 'SKILL_APPROVAL'
  | 'SKILL_REJECTION'
  | 'SYSTEM'
  | 'REMINDER'
  | 'EMPLOYEE_UPDATE'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REVOKED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'SECURITY_ALERT'
  | string;

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string;

export interface AppNotification {
  id: string;
  employee_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  readAt: string | null;
  link: string | null;
  isBroadcast: boolean;
  deletedAt: string | null;
  priority: NotificationPriority;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  filter?: 'unread' | 'read' | 'all';
  type?: NotificationType;
}

export interface NotificationPreferences {
  onSkillApproval: boolean;
  onSkillRejection: boolean;
  onRoleChange: boolean;
  onEmployeeUpdate: boolean;
  onBroadcast: boolean;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  type?: 'SYSTEM_ANNOUNCEMENT' | 'SECURITY_ALERT';
  priority?: NotificationPriority;
  link?: string;
  target: 'all' | 'selected';
  employeeIds?: string[];
}
