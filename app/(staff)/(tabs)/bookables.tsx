import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTenantBookables } from '../../../hooks/useTenantBookables';

export default function StaffBookablesScreen() {
  const { tokens } = useTheme();
  const { data: bookables, isLoading, isRefetching, isError, refetch } = useTenantBookables();

  if (isLoading) {
    return (
      <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.accent} />
        </View>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.center}>
          <Text style={{ color: '#dc2626', marginBottom: 12 }}>Failed to load bookables.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={{ color: tokens.accent, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          contentContainerStyle={styles.list}
          data={bookables}
          keyExtractor={(b) => b.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={tokens.accent} />
          }
          ListHeaderComponent={
            <Pressable
              style={[styles.addBtn, { backgroundColor: tokens.accent }]}
              onPress={() => router.push('/(staff)/setup/first-service')}
            >
              <Text style={styles.addBtnText}>+ Add service</Text>
            </Pressable>
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: tokens.textMuted }]}>No bookables found.</Text>
          }
          renderItem={({ item }) => {
            const active = item.is_active;
            const cardStyle = active
              ? { backgroundColor: tokens.surface, borderColor: tokens.accent, borderWidth: 1.5 }
              : { backgroundColor: tokens.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderColor: tokens.surfaceBorder, borderWidth: 1 };

            return (
              <TouchableOpacity
                style={[styles.card, cardStyle, tokens.cardShadow]}
                onPress={() => router.push(`/(staff)/bookables/${item.id}`)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.cardName, { color: active ? tokens.textPrimary : tokens.textMuted }]}>
                    {item.name}
                  </Text>
                  {!active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inactive</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardMeta, { color: tokens.textSecondary }]}>
                  {item.duration_minutes} min
                  {' · '}
                  {item.price === 0 ? 'Free' : `${(item.price / 100).toFixed(2)} ${item.currency}`}
                </Text>
                {item.description ? (
                  <Text style={[styles.cardDesc, { color: tokens.textMuted }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={[styles.chevron, { color: tokens.textMuted }]}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:        { flex: 1 },
  safe:            { flex: 1, backgroundColor: 'transparent' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:            { padding: 16, paddingBottom: 32 },
  addBtn:          { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 16 },
  addBtnText:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty:           { textAlign: 'center', marginTop: 40, fontSize: 14 },
  card:            { borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTop:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardName:        { fontSize: 16, fontWeight: '700', flex: 1 },
  cardMeta:        { fontSize: 13, marginBottom: 2 },
  cardDesc:        { fontSize: 12, marginTop: 2 },
  inactiveBadge:   { backgroundColor: '#e5e7eb', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  inactiveBadgeText: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  chevron:         { position: 'absolute', right: 14, top: 16, fontSize: 20 },
});
