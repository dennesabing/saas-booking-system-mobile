// mobile/app/(customer)/(tabs)/profile/notifications.tsx
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationPreferences } from '../../../../hooks/useAuth';
import { useProfile, useUpdateNotificationPrefs } from '../../../../hooks/useProfile';

type PrefKey = keyof NotificationPreferences;

const CHANNEL_PREFS: { key: PrefKey; label: string; icon: string; bg: string }[] = [
  { key: 'push',  label: 'Push Notifications', icon: '📱', bg: '#eef2ff' },
  { key: 'email', label: 'Email Notifications', icon: '📧', bg: '#f0fdf4' },
  { key: 'sms',   label: 'SMS Notifications',  icon: '💬', bg: '#fff7ed' },
];

const TYPE_PREFS: { key: PrefKey; label: string }[] = [
  { key: 'booking_confirmations', label: 'Booking Confirmations' },
  { key: 'appointment_reminders', label: 'Appointment Reminders' },
  { key: 'waitlist_updates',      label: 'Waitlist Updates' },
  { key: 'review_requests',       label: 'Review Requests' },
  { key: 'cancellation_alerts',   label: 'Cancellation Alerts' },
  { key: 'promotional_offers',    label: 'Promotional Offers' },
];

export default function NotificationsScreen() {
  const { data: user } = useProfile();
  const updatePrefs = useUpdateNotificationPrefs();

  const prefs = user?.notification_preferences;

  const toggle = (key: PrefKey) => {
    if (!prefs) return;
    updatePrefs.mutate({ [key]: !prefs[key] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHint}>Choose how you want to be notified about your bookings.</Text>

        <View style={styles.menuGroup}>
          {CHANNEL_PREFS.map(({ key, label, icon, bg }, index) => (
            <View key={key} style={[styles.menuItem, index < CHANNEL_PREFS.length - 1 && styles.menuBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: bg }]}>
                <Text>{icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <Switch
                value={prefs?.[key] ?? false}
                onValueChange={() => toggle(key)}
                trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                thumbColor="white"
                disabled={updatePrefs.isPending}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATION TYPES</Text>

        <View style={styles.menuGroup}>
          {TYPE_PREFS.map(({ key, label }, index) => (
            <View key={key} style={[styles.menuItem, index < TYPE_PREFS.length - 1 && styles.menuBorder]}>
              <Text style={styles.menuLabel}>{label}</Text>
              <Switch
                value={prefs?.[key] ?? false}
                onValueChange={() => toggle(key)}
                trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                thumbColor="white"
                disabled={updatePrefs.isPending}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  navHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#0f172a', lineHeight: 22 },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  scroll: { flex: 1 },
  sectionHint: { fontSize: 12, color: '#94a3b8', paddingHorizontal: 16, paddingVertical: 10 },
  sectionLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  menuGroup: { backgroundColor: 'white', borderRadius: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
});
