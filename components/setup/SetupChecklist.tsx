import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useOrgSetupStatus } from '../../hooks/useOrgSetupStatus';

type ChecklistItem = {
  label: string;
  done: boolean;
  onTap: () => void;
};

export function SetupChecklist() {
  const { data, isLoading } = useOrgSetupStatus();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('setup_checklist_collapsed').then(v => {
      if (v === 'true') setCollapsed(true);
    });
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    AsyncStorage.setItem('setup_checklist_collapsed', String(next));
  }

  if (isLoading || !data || data.setup_completed_at) return null;

  const { items, completed_count, total_count } = data;
  if (!items) return null;

  const checklistItems: ChecklistItem[] = [
    {
      label: 'Add your first service',
      done:  items.has_bookable,
      onTap: () => router.push('/(staff)/setup/first-service'),
    },
    {
      label: 'Configure your hours',
      done:  items.has_availability,
      onTap: () => router.push('/(staff)/setup/first-service'),
    },
    {
      label: 'Invite a staff member',
      done:  items.has_team_member,
      onTap: () => router.push('/(staff)/team/invite'),
    },
    {
      label: 'Share your booking link',
      done:  items.booking_link_shared,
      onTap: () => router.push('/(staff)/setup/share-link'),
    },
  ];

  return (
    <View style={styles.card}>
      <Pressable onPress={toggleCollapse} style={styles.header}>
        <Text style={styles.title}>Get ready to accept bookings</Text>
        <Text style={styles.badge}>{completed_count} of {total_count}</Text>
        <Text style={styles.chevron}>{collapsed ? '›' : '▾'}</Text>
      </Pressable>

      {!collapsed && checklistItems.map(item => (
        <Pressable key={item.label} onPress={item.onTap} style={styles.row}>
          <Text style={[styles.tick, item.done && styles.tickDone]}>
            {item.done ? '✓' : '→'}
          </Text>
          <Text style={[styles.rowLabel, item.done && styles.rowLabelDone]}>
            {item.label}
          </Text>
          {!item.done && <Text style={styles.arrow}>›</Text>}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card:        { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12,
                 padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title:       { flex: 1, fontSize: 15, fontWeight: '700', color: '#111' },
  badge:       { fontSize: 13, color: '#6b7280', marginRight: 6 },
  chevron:     { fontSize: 16, color: '#6b7280' },
  row:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                 borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  tick:        { width: 22, fontSize: 14, color: '#6b7280' },
  tickDone:    { color: '#16a34a' },
  rowLabel:    { flex: 1, fontSize: 14, color: '#374151' },
  rowLabelDone:{ color: '#9ca3af', textDecorationLine: 'line-through' },
  arrow:       { fontSize: 18, color: '#9ca3af' },
});
