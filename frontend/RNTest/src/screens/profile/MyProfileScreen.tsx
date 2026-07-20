import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppText } from '../../components/AppText';
import { Avatar } from '../../components/Avatar';
import { AppHeader } from '../../components/AppHeader';
import { useEmployeeProfile } from '../../hooks/useEmployee';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme as theme } from '../../theme/theme';
import { Card } from '../../components/Cards';
import { useNavigation } from '@react-navigation/native';

export const MyProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profile, isLoading } = useEmployeeProfile(user?.id || '');
  const navigation = useNavigation<any>();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="My Profile" showDrawer showNotification />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Avatar 
            name={`${profile?.first_name} ${profile?.last_name}`} 
            uri={profile?.profile_image} 
            size={100} 
            style={styles.avatar}
          />
          <AppText variant="h2">{profile?.first_name} {profile?.last_name}</AppText>
          <AppText style={styles.designation}>{profile?.designation}</AppText>
          <View style={styles.statusChip}>
            <AppText style={styles.statusText}>{profile?.status}</AppText>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Employee ID</AppText>
            <AppText style={styles.infoValue}>{profile?.employee_code}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Department</AppText>
            <AppText style={styles.infoValue}>{profile?.department}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Location</AppText>
            <AppText style={styles.infoValue}>{profile?.location}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Email</AppText>
            <AppText style={styles.infoValue}>{profile?.email}</AppText>
          </View>
        </Card>

        {profile?.profile_metadata?.about_me && (
          <Card style={styles.infoCard}>
            <AppText variant="h3" style={styles.sectionTitle}>About Me</AppText>
            <AppText style={styles.aboutText}>{profile.profile_metadata.about_me}</AppText>
          </Card>
        )}

      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('EditProfile')}
      >
        <AppText style={styles.fabText}>✎</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  designation: {
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  statusChip: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  aboutText: {
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: theme.colors.surface,
    fontSize: 24,
  },
});
