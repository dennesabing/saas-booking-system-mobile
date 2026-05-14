import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLogout } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';

export default function ProfileHomeScreen() {
  const { data: user, isLoading } = useProfile();
  const logout = useLogout();
  const { theme, tokens, toggleTheme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={tokens.accent} />
      </View>
    );
  }

  const iconBg = { backgroundColor: `${tokens.accent}18` };

  return (
    <LinearGradient
      colors={tokens.bg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Profile header card */}
          <View style={[styles.headerCard, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>
            {/* Card top row: title + dark mode toggle */}
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>My Profile</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.moonEmoji}>🌙</Text>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#d1d5db', true: tokens.accent }}
                  thumbColor="white"
                  ios_backgroundColor="#d1d5db"
                />
              </View>
            </View>

            {/* Avatar + info */}
            <View style={styles.headerInfo}>
              {user?.profile_photo_url ? (
                <Image
                  source={{ uri: user.profile_photo_url }}
                  style={[styles.avatar, { borderColor: tokens.accent }]}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { borderColor: tokens.accent }]}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: tokens.textPrimary }]}>{user?.name}</Text>
                <Text style={[styles.userEmail, { color: tokens.textSecondary }]}>{user?.email}</Text>
              </View>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: `${tokens.accent}18`, borderColor: `${tokens.accent}33` }]}
                onPress={() => router.push('/profile/edit')}
              >
                <Text style={[styles.editBtnText, { color: tokens.accent }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>
              <Text style={[styles.statValue, { color: tokens.textPrimary }]}>{user?.stats?.bookings_count ?? 0}</Text>
              <Text style={[styles.statLabel, { color: tokens.textMuted }]}>BOOKINGS</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>
              <Text style={[styles.statValue, { color: tokens.textPrimary }]}>0</Text>
              <Text style={[styles.statLabel, { color: tokens.textMuted }]}>REVIEWS</Text>
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
          <View style={[styles.menuGroup, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: `${tokens.accent}12` }]}>
              <View style={[styles.menuIcon, iconBg]}>
                <Text>💳</Text>
              </View>
              <Text style={[styles.menuLabel, { color: tokens.textPrimary }]}>Payment Methods</Text>
              <Text style={[styles.menuValue, { color: tokens.textMuted }]}>Coming soon</Text>
              <Text style={[styles.menuChevron, { color: tokens.textMuted }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Menu group 2 */}
          <View style={[styles.menuGroup, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: 'transparent' }]}
              onPress={() => router.push('/profile/notifications')}
            >
              <View style={[styles.menuIcon, iconBg]}>
                <Text>🔔</Text>
              </View>
              <Text style={[styles.menuLabel, { color: tokens.textPrimary }]}>Notifications</Text>
              <Text style={[styles.menuChevron, { color: tokens.textMuted }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Sign out */}
          <View style={[styles.menuGroup, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: 'transparent' }]}
              onPress={() => logout.mutate()}
              disabled={logout.isPending}
            >
              {logout.isPending ? (
                <ActivityIndicator color="#ef4444" style={{ flex: 1 }} />
              ) : (
                <Text style={styles.signOut}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.version, { color: tokens.textMuted }]}>Koobstel v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },

  // Header card
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moonEmoji: { fontSize: 14 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2 },
  avatarPlaceholder: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2,
    backgroundColor: 'rgba(14,165,233,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 12 },
  editBtn: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  editBtnText: { fontWeight: '700', fontSize: 12 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  statCard: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    padding: 14, alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Upgrade banner
  upgradeBanner: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeIcon: { fontSize: 26 },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: 13, fontWeight: '800', color: 'white' },
  upgradeSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  upgradeCta: { backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  upgradeCtaText: { color: '#f59e0b', fontWeight: '800', fontSize: 12 },

  // Menu
  menuGroup: {
    borderRadius: 16, borderWidth: 1,
    marginHorizontal: 16, marginBottom: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1,
  },
  menuIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  menuValue: { fontSize: 12, marginRight: 4 },
  menuChevron: { fontSize: 18 },
  signOut: { flex: 1, color: '#ef4444', textAlign: 'center', fontWeight: '700', fontSize: 13 },
  version: { textAlign: 'center', fontSize: 11, padding: 16 },
});
