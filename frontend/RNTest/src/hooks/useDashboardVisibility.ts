import { usePermissions } from './usePermissions';

// Single source of truth for "which dashboard section does this user see". Driven by
// permission codes wherever a permission alone can decide it; falls back to role name
// only where the PRD's Workforce Manager vs Resource Manager sections require it — both
// roles carry an identical permission set today, so permissions can't tell them apart.
// Components consume the flags below and never check role/permission themselves.
export const useDashboardVisibility = () => {
  const { role, hasPermission } = usePermissions();

  const canViewAnalytics = hasPermission('VIEW_ANALYTICS');
  const isWorkforceManager = role === 'Workforce Manager';
  const isResourceManager = role === 'Resource Manager';
  const isAdministrator = role === 'Administrator';
  const isManager = isWorkforceManager || isResourceManager;

  return {
    canViewAnalytics,
    // Personal widgets — anyone without org-wide analytics access gets their own view.
    showMySkills: !canViewAnalytics,
    // Administrator-only organization-wide summary.
    showOrgSummary: canViewAnalytics && isAdministrator,
    showUserManagementShortcut: hasPermission('USER_MANAGEMENT') || hasPermission('ROLE_MANAGEMENT'),
    // Manager/Admin shared sections.
    showPendingApprovals: canViewAnalytics,
    showSkillsDistribution: canViewAnalytics,
    // Per the PRD's widget list, Recent Activities is called out for Administrator
    // and Workforce Manager, not Resource Manager.
    showRecentActivity: canViewAnalytics && !isResourceManager,
    showSearchWorkforce: hasPermission('SEARCH_EMPLOYEES'),
    showReportsShortcut: hasPermission('REPORT_VIEW'),
    // Workforce Manager framing: "Team ..." sections.
    showTeamOverview: canViewAnalytics && isWorkforceManager,
    showTeamAnalytics: canViewAnalytics && isWorkforceManager,
    // Resource Manager framing: "Resource ..." sections.
    showResourceAllocation: canViewAnalytics && isResourceManager,
    showResourceAnalytics: canViewAnalytics && isResourceManager,
    // Workforce/location availability — shared by both manager roles, framed as
    // "Workforce Availability" (WM) or "Team Distribution" (RM) by the screen.
    showAvailability: canViewAnalytics && isManager,
    isManager,
    isAdministrator,
  };
};
