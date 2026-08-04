export const LightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#22C55E',
  secondary: '#16A34A',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  divider: '#E2E8F0',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  
  statusActive: '#22C55E',
  statusPending: '#F59E0B',
  statusApproved: '#10B981',
  statusRejected: '#EF4444',
  statusDisabled: '#94A3B8',
  statusDraft: '#64748B',

  // Interactive Components
  primaryButton: '#22C55E',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#DCFCE7',
  selectedCard: '#DCFCE7',
  selectedChip: '#DCFCE7',
  activeIcon: '#22C55E',
  checkbox: '#22C55E',
  radioButton: '#22C55E',
  toggleSwitch: '#22C55E',
  progressIndicator: '#22C55E',
  ratingStars: '#FBBF24',
};

export const DarkColors = {
  background: '#111827',
  surface: '#1F2937',
  primary: '#6FEDB5',
  secondary: '#34D399',
  success: '#6FEDB5',
  warning: '#FBBF24',
  error: '#F87171',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#374151',
  divider: '#4B5563',
  cardShadow: 'rgba(0, 0, 0, 0.25)',

  statusActive: '#22C55E', // Reusing light values for statuses where not specified dark variants
  statusPending: '#F59E0B',
  statusApproved: '#10B981',
  statusRejected: '#EF4444',
  statusDisabled: '#94A3B8',
  statusDraft: '#64748B',

  // Interactive Components
  primaryButton: '#6FEDB5',
  primaryButtonText: '#111827',
  secondaryButton: '#14532D',
  selectedCard: '#14532D',
  selectedChip: '#14532D',
  activeIcon: '#6FEDB5',
  checkbox: '#6FEDB5',
  radioButton: '#6FEDB5',
  toggleSwitch: '#6FEDB5',
  progressIndicator: '#6FEDB5',
  ratingStars: '#FBBF24',
};

export const ProficiencyColors = {
  beginner: '#A7F3D0',
  basic: '#6EE7B7',
  intermediate: '#34D399',
  advanced: '#10B981',
  expert: '#065F46',
  noKnowledge: '#CBD5E1',
};

export type ThemeColors = typeof LightColors;
