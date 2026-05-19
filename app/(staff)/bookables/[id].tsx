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
import {
  TenantBookable,
  useDeleteBookable,
  useUpdateBookable,
  useTenantBookables,
} from '../../../hooks/useTenantBookables';

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function BookableDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bookables, isLoading } = useTenantBookables();
  const bookable = bookables?.find((b) => b.uuid === id);

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

  if (isLoading) {
    return <View style={styles.center}><Text>Loading…</Text></View>;
  }

  if (!bookable) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#dc2626' }}>Service not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#2563eb' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }
    const priceInCents = isFree ? 0 : Math.round(parseFloat(price || '0') * 100);
    if (!isFree && isNaN(priceInCents)) {
      Alert.alert('Validation', 'Enter a valid price.');
      return;
    }
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
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => remove.mutate(undefined, { onSuccess: () => router.back() }),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.heading}>Edit service</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Haircut"
          returnKeyType="next"
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description…"
          multiline
          numberOfLines={3}
          returnKeyType="done"
        />

        <Text style={styles.label}>Duration</Text>
        <View style={styles.chips}>
          {DURATION_OPTIONS.map((min) => (
            <Pressable
              key={min}
              onPress={() => setDuration(min)}
              style={[styles.chip, duration === min && styles.chipActive]}
            >
              <Text style={[styles.chipText, duration === min && styles.chipTextActive]}>
                {min < 60 ? `${min}m` : `${min / 60}h`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Free</Text>
          <Switch
            value={isFree}
            onValueChange={setIsFree}
            trackColor={{ false: '#d1d5db', true: '#5B6CFF' }}
            thumbColor="#fff"
          />
        </View>

        {!isFree && (
          <>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#d1d5db', true: '#5B6CFF' }}
            thumbColor="#fff"
          />
        </View>

        <Pressable
          style={[styles.saveBtn, update.isPending && styles.btnDisabled]}
          onPress={handleSave}
          disabled={update.isPending}
        >
          <Text style={styles.saveBtnText}>{update.isPending ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteBtn, remove.isPending && styles.btnDisabled]}
          onPress={handleDelete}
          disabled={remove.isPending}
        >
          <Text style={styles.deleteBtnText}>{remove.isPending ? 'Deleting…' : 'Delete service'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container:     { padding: 24, paddingBottom: 48 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  back:          { fontSize: 22, color: '#374151' },
  heading:       { fontSize: 18, fontWeight: '700', color: '#111' },
  label:         { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#111', backgroundColor: '#fff',
  },
  multiline:     { minHeight: 80, textAlignVertical: 'top' },
  chips:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive:    { backgroundColor: '#5B6CFF', borderColor: '#5B6CFF' },
  chipText:      { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextActive:{ color: '#fff' },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  saveBtn:       { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 32 },
  saveBtnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteBtn:     { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#dc2626' },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
  btnDisabled:   { opacity: 0.5 },
});
