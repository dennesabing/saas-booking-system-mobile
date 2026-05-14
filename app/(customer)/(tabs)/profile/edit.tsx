// mobile/app/(customer)/(tabs)/profile/edit.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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

// ── Country codes ──────────────────────────────────────────────────────────
type CountryCode = { code: string; flag: string; name: string; dial: string };

const COUNTRIES: CountryCode[] = [
  { code: 'PH', flag: '🇵🇭', name: 'Philippines',   dial: '+63'  },
  { code: 'US', flag: '🇺🇸', name: 'United States', dial: '+1'   },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom',dial: '+44'  },
  { code: 'AU', flag: '🇦🇺', name: 'Australia',     dial: '+61'  },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',     dial: '+65'  },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia',      dial: '+60'  },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',         dial: '+81'  },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea',   dial: '+82'  },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',        dial: '+1'   },
  { code: 'IN', flag: '🇮🇳', name: 'India',         dial: '+91'  },
  { code: 'AE', flag: '🇦🇪', name: 'UAE',           dial: '+971' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',  dial: '+966' },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // PH +63

function parseStoredMobile(stored: string): { country: CountryCode; digits: string } {
  const match = COUNTRIES.find((c) => stored.startsWith(c.dial));
  if (match) return { country: match, digits: stored.slice(match.dial.length).trim() };
  return { country: DEFAULT_COUNTRY, digits: stored.trim() };
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

// ── Types ──────────────────────────────────────────────────────────────────
type FieldErrors = Partial<Record<'name' | 'email' | 'mobile_number' | 'date_of_birth' | 'default_location', string>>;

// ── Component ──────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const { data: user } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [mobileDigits, setMobileDigits] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD
  const [defaultLocation, setDefaultLocation] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setDateOfBirth(user.date_of_birth ?? '');
      setDefaultLocation(user.default_location ?? '');
      if (user.mobile_number) {
        const parsed = parseStoredMobile(user.mobile_number);
        setCountry(parsed.country);
        setMobileDigits(parsed.digits);
      }
    }
  }, [user]);

  const handleSave = async () => {
    Keyboard.dismiss();
    setErrors({});

    // Basic client-side validation
    const clientErrors: FieldErrors = {};
    if (!name.trim()) clientErrors.name = 'Name is required.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      clientErrors.email = 'Please enter a valid email address.';
    }
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    try {
      const mobile = mobileDigits.trim() ? `${country.dial}${mobileDigits.trim()}` : null;
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        mobile_number: mobile,
        date_of_birth: dateOfBirth || null,
        default_location: defaultLocation.trim() || null,
      });
      router.back();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          name:             apiErrors.name?.[0],
          email:            apiErrors.email?.[0],
          mobile_number:    apiErrors.mobile_number?.[0],
          date_of_birth:    apiErrors.date_of_birth?.[0],
          default_location: apiErrors.default_location?.[0],
        });
      } else {
        setErrors({ name: 'Could not save changes. Please try again.' });
      }
    }
  };

  const handleChangePhoto = async () => {
    try {
      await uploadAvatar.mutateAsync();
    } catch {
      setErrors({ name: 'Could not upload photo. Please try again.' });
    }
  };

  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const iso = selected.toISOString().split('T')[0];
      setDateOfBirth(iso);
      setErrors((prev) => ({ ...prev, date_of_birth: undefined }));
    }
  };

  const isSaving = updateProfile.isPending;
  const isUploading = uploadAvatar.isPending;
  const pickerDate = dateOfBirth ? new Date(dateOfBirth + 'T00:00:00') : new Date();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Nav header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarSection}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: user.profile_photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleChangePhoto} disabled={isUploading}>
              {isUploading
                ? <ActivityIndicator color="#6366f1" />
                : <Text style={styles.changePhoto}>Change Photo</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fields}>

            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput
                style={[styles.input, !!errors.name && styles.inputError]}
                value={name}
                onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Your full name"
                autoCapitalize="words"
              />
              {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.input, !!errors.email && styles.inputError]}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Mobile number */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
              <View style={[styles.phoneRow, !!errors.mobile_number && styles.phoneRowError]}>
                <TouchableOpacity style={styles.countryBtn} onPress={() => setShowCountryPicker(true)}>
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryDial}>{country.dial}</Text>
                  <Text style={styles.countryChevron}>▾</Text>
                </TouchableOpacity>
                <View style={styles.phoneDivider} />
                <TextInput
                  style={styles.phoneInput}
                  value={mobileDigits}
                  onChangeText={(v) => { setMobileDigits(v); setErrors((p) => ({ ...p, mobile_number: undefined })); }}
                  placeholder="912 345 6789"
                  keyboardType="phone-pad"
                />
              </View>
              {!!errors.mobile_number && <Text style={styles.errorText}>{errors.mobile_number}</Text>}
            </View>

            {/* Date of birth */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DATE OF BIRTH</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateBtn, !!errors.date_of_birth && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={dateOfBirth ? styles.dateValue : styles.datePlaceholder}>
                  {dateOfBirth ? formatDisplayDate(dateOfBirth) : 'Select date…'}
                </Text>
                <Text style={styles.dateIcon}>📅</Text>
              </TouchableOpacity>
              {!!errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}
            </View>

            {/* Default location */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DEFAULT LOCATION</Text>
              <TextInput
                style={[styles.input, !!errors.default_location && styles.inputError]}
                value={defaultLocation}
                onChangeText={(v) => { setDefaultLocation(v); setErrors((p) => ({ ...p, default_location: undefined })); }}
                placeholder="City, Country"
              />
              {!!errors.default_location && <Text style={styles.errorText}>{errors.default_location}</Text>}
            </View>

          </View>
        </ScrollView>

        {/* Fixed footer Save button */}
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

      {/* ── Date picker ── */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={styles.iosPickerOverlay}>
              <View style={styles.iosPickerSheet}>
                <View style={styles.iosPickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.iosPickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={styles.iosDatePicker}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}

      {/* ── Country code picker ── */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View style={styles.countryOverlay}>
          <View style={styles.countrySheet}>
            <View style={styles.countrySheetHeader}>
              <Text style={styles.countrySheetTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.countrySheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryRow, item.code === country.code && styles.countryRowSelected]}
                  onPress={() => { setCountry(item); setShowCountryPicker(false); }}
                >
                  <Text style={styles.countryRowFlag}>{item.flag}</Text>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowDial}>{item.dial}</Text>
                  {item.code === country.code && <Text style={styles.countryRowCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 13, fontSize: 14, color: '#0f172a' },
  inputError: { borderColor: '#ef4444' },
  errorText: { marginTop: 4, fontSize: 12, color: '#ef4444', fontWeight: '500' },

  // Phone row
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden' },
  phoneRowError: { borderColor: '#ef4444' },
  countryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13, gap: 4 },
  countryFlag: { fontSize: 18 },
  countryDial: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
  countryChevron: { fontSize: 10, color: '#94a3b8' },
  phoneDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0' },
  phoneInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 13, fontSize: 14, color: '#0f172a' },

  // Date button
  dateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateValue: { fontSize: 14, color: '#0f172a' },
  datePlaceholder: { fontSize: 14, color: '#94a3b8' },
  dateIcon: { fontSize: 16 },

  // Footer
  footer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, backgroundColor: '#f8fafc' },
  saveBtn: { backgroundColor: '#6366f1', borderRadius: 16, padding: 15, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

  // iOS date picker modal
  iosPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  iosPickerSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  iosPickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iosPickerDone: { fontSize: 16, color: '#6366f1', fontWeight: '700' },
  iosDatePicker: { height: 200 },

  // Country picker modal
  countryOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  countrySheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  countrySheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  countrySheetTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  countrySheetClose: { fontSize: 18, color: '#94a3b8' },
  countryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  countryRowSelected: { backgroundColor: '#f5f3ff' },
  countryRowFlag: { fontSize: 22 },
  countryRowName: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
  countryRowDial: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  countryRowCheck: { fontSize: 16, color: '#6366f1', fontWeight: '700' },
});
