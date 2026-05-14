// mobile/app/(customer)/(tabs)/profile/edit.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../../../../hooks/useProfile';

export default function EditProfileScreen() {
  const { data: user } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setMobileNumber(user.mobile_number ?? '');
      setDateOfBirth(user.date_of_birth ?? '');
      setDefaultLocation(user.default_location ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        mobile_number: mobileNumber.trim() || null,
        date_of_birth: dateOfBirth.trim() || null,
        default_location: defaultLocation.trim() || null,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.');
    }
  };

  const handleChangePhoto = async () => {
    try {
      await uploadAvatar.mutateAsync();
    } catch {
      Alert.alert('Error', 'Could not upload photo. Please try again.');
    }
  };

  const isSaving = updateProfile.isPending;
  const isUploading = uploadAvatar.isPending;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: user.profile_photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleChangePhoto} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator color="#6366f1" />
              ) : (
                <Text style={styles.changePhoto}>Change Photo</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
              <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} placeholder="+63 912 345 6789" keyboardType="phone-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DATE OF BIRTH</Text>
              <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DEFAULT LOCATION</Text>
              <TextInput style={styles.input} value={defaultLocation} onChangeText={setDefaultLocation} placeholder="City, Country" />
            </View>

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#0f172a', lineHeight: 22 },
  navTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  scroll: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 3, borderColor: '#6366f1' },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarEmoji: { fontSize: 36 },
  changePhoto: { fontSize: 13, color: '#6366f1', fontWeight: '700' },
  fields: { paddingHorizontal: 16, paddingBottom: 16 },
  footer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, backgroundColor: '#f8fafc' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 13, fontSize: 14, color: '#0f172a' },
  saveBtn: { backgroundColor: '#6366f1', borderRadius: 16, padding: 15, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
