import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MeUser } from '../hooks/useAuth';

type Props = {
  user: MeUser | undefined;
  onLogout: () => void;
  loading?: boolean;
};

export default function ProfileScreen({ user, onLogout, loading = false }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      {user ? (
        <View style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      ) : (
        <ActivityIndicator style={{ marginVertical: 24 }} />
      )}

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#dc2626" />
        ) : (
          <Text style={styles.logoutText}>Sign Out</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  heading: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 24 },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  name: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 4 },
  email: { color: '#6b7280', fontSize: 15 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
