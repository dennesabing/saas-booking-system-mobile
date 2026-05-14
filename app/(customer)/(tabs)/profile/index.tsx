// mobile/app/(customer)/(tabs)/profile/index.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';

export default function ProfileHomeScreen() {
  const { data: user, isLoading } = useProfile();
  const logout = useLogout();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {user?.profile_photo_url ? (
          <Image source={{ uri: user.profile_photo_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats strip */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.stats?.bookings_count ?? 0}</Text>
            <Text style={styles.statLabel}>BOOKINGS</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>REVIEWS</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>{user?.stats?.organizations_count ?? 0}</Text>
            <Text style={styles.statLabel}>TENANTS</Text>
          </View>
        </View>

        {/* Upgrade banner */}
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeIcon}>⚡</Text>
          <View style={styles.upgradeText}>
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSub}>Priority booking + unlimited history export</Text>
          </View>
          <TouchableOpacity style={styles.upgradeCta}>
            <Text style={styles.upgradeCtaText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Menu group 1 */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#eef2ff' }]}>
              <Text>💳</Text>
            </View>
            <Text style={styles.menuLabel}>Payment Methods</Text>
            <Text style={styles.menuValue}>Coming soon</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#f0fdf4' }]}>
              <Text>🎟️</Text>
            </View>
            <Text style={styles.menuLabel}>Vouchers & Credits</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Menu group 2 */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/notifications')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f0f9ff' }]}>
              <Text>🔔</Text>
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#f8fafc' }]}>
              <Text>🌐</Text>
            </View>
            <Text style={styles.menuLabel}>Language</Text>
            <Text style={styles.menuValue}>English</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <ActivityIndicator color="#ef4444" style={{ flex: 1 }} />
            ) : (
              <Text style={[styles.menuLabel, styles.signOut]}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Koobstel v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#8b5cf6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarPlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 32 },
  headerInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', color: 'white', marginBottom: 2 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  editBtnText: { color: 'white', fontWeight: '700', fontSize: 12 },
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  upgradeBanner: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeIcon: { fontSize: 28 },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: 14, fontWeight: '800', color: 'white' },
  upgradeSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  upgradeCta: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  upgradeCtaText: { color: '#f59e0b', fontWeight: '800', fontSize: 12 },
  menuGroup: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
  menuValue: { fontSize: 13, color: '#94a3b8', marginRight: 6 },
  menuChevron: { fontSize: 18, color: '#cbd5e1' },
  signOut: { color: '#ef4444', textAlign: 'center', fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 11, color: '#cbd5e1', padding: 16 },
});
