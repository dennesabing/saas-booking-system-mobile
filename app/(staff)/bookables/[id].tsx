import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  useDeleteBookable,
  useUpdateBookable,
  useTenantBookables,
} from '../../../hooks/useTenantBookables';

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function BookableDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useTheme();
  const { data: bookables, isLoading } = useTenantBookables();
  const bookable = bookables?.find((b) => b.id === id);

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration]       = useState(30);
  const [price, setPrice]             = useState('');
  const [isFree, setIsFree]           = useState(false);
  const [isActive, setIsActive]       = useState(true);

  useEffect(() => {
    if (bookable) {
      setName(bookable.name);
      setDescription(bookable.description ?? '');
      setDuration(bookable.duration_minutes);
      setIsFree(bookable.price === 0);
      setPrice(bookable.price === 0 ? '' : (bookable.price / 100).toFixed(2));
      setIsActive(bookable.is_active);
    }
  }, [bookable]);

  const update = useUpdateBookable(id);
  const remove = useDeleteBookable(id);

  const inputStyle = [styles.input, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary, backgroundColor: tokens.surface }];

  if (isLoading) {
    return (
      <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.center}><Text style={{ color: tokens.textMuted }}>Loading…</Text></View>
      </LinearGradient>
    );
  }

  if (!bookable) {
    return (
      <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.center}>
          <Text style={{ color: '#dc2626' }}>Service not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: tokens.accent }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Validation', 'Name is required.'); return; }
    const priceInCents = isFree ? 0 : Math.round(parseFloat(price || '0') * 100);
    if (!isFree && isNaN(priceInCents)) { Alert.alert('Validation', 'Enter a valid price.'); return; }
    update.mutate(
      { name: name.trim(), description: description.trim() || undefined, duration_minutes: duration, price: priceInCents, is_active: isActive },
      { onSuccess: () => router.back() }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete service',
      `Delete "${bookable.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(undefined, { onSuccess: () => router.back() }) },
      ]
    );
  };

  return (
    <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}>
                <Text style={[styles.backText, { color: tokens.textPrimary }]}>←</Text>
              </Pressable>
              <Text style={[styles.heading, { color: tokens.textPrimary }]}>Edit service</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Form card */}
            <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, ...tokens.cardShadow }]}>

              <Text style={[styles.label, { color: tokens.textSecondary }]}>Name</Text>
              <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder="e.g. Haircut" placeholderTextColor={tokens.textMuted} returnKeyType="next" />

              <Text style={[styles.label, { color: tokens.textSecondary }]}>Description (optional)</Text>
              <TextInput
                style={[...inputStyle, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description…"
                placeholderTextColor={tokens.textMuted}
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />

              <Text style={[styles.label, { color: tokens.textSecondary }]}>Duration</Text>
              <View style={styles.chips}>
                {DURATION_OPTIONS.map((min) => (
                  <Pressable
                    key={min}
                    onPress={() => setDuration(min)}
                    style={[
                      styles.chip,
                      { borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface },
                      duration === min && { backgroundColor: tokens.accent, borderColor: tokens.accent },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: tokens.textSecondary }, duration === min && { color: '#fff' }]}>
                      {min < 60 ? `${min}m` : `${min / 60}h`}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, { color: tokens.textSecondary, marginTop: 0 }]}>Free service</Text>
                <Switch value={isFree} onValueChange={setIsFree} trackColor={{ false: tokens.surfaceBorder, true: tokens.accent }} thumbColor="#fff" />
              </View>

              {!isFree && (
                <>
                  <Text style={[styles.label, { color: tokens.textSecondary }]}>Price</Text>
                  <TextInput style={inputStyle} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={tokens.textMuted} keyboardType="decimal-pad" returnKeyType="done" />
                </>
              )}

              <View style={[styles.row, { marginTop: 16 }]}>
                <Text style={[styles.label, { color: tokens.textSecondary, marginTop: 0 }]}>Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: tokens.surfaceBorder, true: tokens.accent }} thumbColor="#fff" />
              </View>
            </View>

            {/* Actions */}
            <Pressable
              style={[styles.saveBtn, { backgroundColor: tokens.accent }, (update.isPending) && styles.btnDisabled]}
              onPress={handleSave}
              disabled={update.isPending}
            >
              <Text style={styles.saveBtnText}>{update.isPending ? 'Saving…' : 'Save changes'}</Text>
            </Pressable>

            <Pressable
              style={[styles.deleteBtn, { borderColor: '#dc2626' }, remove.isPending && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={remove.isPending}
            >
              <Text style={styles.deleteBtnText}>{remove.isPending ? 'Deleting…' : 'Delete service'}</Text>
            </Pressable>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:      { flex: 1 },
  safe:          { flex: 1, backgroundColor: 'transparent' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container:     { padding: 16, paddingBottom: 48 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn:       { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backText:      { fontSize: 20 },
  heading:       { fontSize: 18, fontWeight: '700' },
  card:          { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  label:         { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input:         { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  multiline:     { minHeight: 80, textAlignVertical: 'top' },
  chips:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText:      { fontSize: 13, fontWeight: '600' },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveBtn:       { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  saveBtnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteBtn:     { borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1 },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
  btnDisabled:   { opacity: 0.5 },
});
