// mobile/app/(customer)/(tabs)/profile/edit.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
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
import MapLocationPicker from '../../../../components/MapLocationPicker';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../../../../hooks/useProfile';

// ── Country codes ──────────────────────────────────────────────────────────
type CountryCode = { code: string; flag: string; name: string; dial: string };

const COUNTRIES: CountryCode[] = [
  { code: 'PH', flag: '🇵🇭', name: 'Philippines',    dial: '+63'  },
  { code: 'US', flag: '🇺🇸', name: 'United States',  dial: '+1'   },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', dial: '+44'  },
  { code: 'AU', flag: '🇦🇺', name: 'Australia',      dial: '+61'  },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',      dial: '+65'  },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia',       dial: '+60'  },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',          dial: '+81'  },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea',    dial: '+82'  },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',         dial: '+1'   },
  { code: 'IN', flag: '🇮🇳', name: 'India',          dial: '+91'  },
  { code: 'AE', flag: '🇦🇪', name: 'UAE',            dial: '+971' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',   dial: '+966' },
];

const DEFAULT_COUNTRY = COUNTRIES[0];

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

type FieldErrors = Partial<Record<'name' | 'email' | 'mobile_number' | 'date_of_birth' | 'default_location', string>>;

export default function EditProfileScreen() {
  const { data: user } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { tokens } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [mobileDigits, setMobileDigits] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapInitCoords, setMapInitCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

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
      if (user.default_location_lat != null && user.default_location_lng != null) {
        setLocationCoords({ lat: user.default_location_lat, lng: user.default_location_lng });
      }
    }
  }, [user]);

  const handleSave = async () => {
    Keyboard.dismiss();
    setErrors({});
    const clientErrors: FieldErrors = {};
    if (!name.trim()) clientErrors.name = 'Name is required.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      clientErrors.email = 'Please enter a valid email address.';
    }
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    try {
      const mobile = mobileDigits.trim() ? `${country.dial}${mobileDigits.trim()}` : null;
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        mobile_number: mobile,
        date_of_birth: dateOfBirth || null,
        default_location: defaultLocation.trim() || null,
        default_location_lat: locationCoords?.lat ?? null,
        default_location_lng: locationCoords?.lng ?? null,
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
      setDateOfBirth(selected.toISOString().split('T')[0]);
      setErrors((p) => ({ ...p, date_of_birth: undefined }));
    }
  };

  const handleOpenMap = async () => {
    setErrors((p) => ({ ...p, default_location: undefined }));
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setMapInitCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } else {
        setMapInitCoords(undefined);
      }
    } catch {
      setMapInitCoords(undefined);
    } finally {
      setLocating(false);
      setShowMapPicker(true);
    }
  };

  const isSaving = updateProfile.isPending;
  const isUploading = uploadAvatar.isPending;
  const pickerDate = dateOfBirth ? new Date(dateOfBirth + 'T00:00:00') : new Date();

  const inputStyle = [styles.input, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary }];
  const labelStyle = [styles.fieldLabel, { color: tokens.textMuted }];

  return (
    <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Nav header */}
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: tokens.surfaceBorder }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: tokens.textPrimary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: tokens.textPrimary }]}>Edit Profile</Text>
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar */}
            <View style={styles.avatarSection}>
              {user?.profile_photo_url ? (
                <Image source={{ uri: user.profile_photo_url }} style={[styles.avatar, { borderColor: tokens.accent }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: `${tokens.accent}22`, borderColor: tokens.accent }]}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
              )}
              <TouchableOpacity onPress={handleChangePhoto} disabled={isUploading}>
                {isUploading
                  ? <ActivityIndicator color={tokens.accent} />
                  : <Text style={[styles.changePhoto, { color: tokens.accent }]}>Change Photo</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.fields}>

              {/* Full Name */}
              <View style={styles.field}>
                <Text style={labelStyle}>FULL NAME</Text>
                <TextInput
                  style={[inputStyle, !!errors.name && styles.inputError]}
                  value={name}
                  onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Your full name"
                  placeholderTextColor={tokens.textMuted}
                  autoCapitalize="words"
                />
                {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={labelStyle}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[inputStyle, !!errors.email && styles.inputError]}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="your@email.com"
                  placeholderTextColor={tokens.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Mobile number */}
              <View style={styles.field}>
                <Text style={labelStyle}>MOBILE NUMBER</Text>
                <View style={[
                  styles.phoneRow,
                  { borderColor: tokens.surfaceBorder },
                  !!errors.mobile_number && styles.inputError,
                ]}>
                  <TouchableOpacity style={styles.countryBtn} onPress={() => setShowCountryPicker(true)}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={[styles.countryDial, { color: tokens.textPrimary }]}>{country.dial}</Text>
                    <Text style={[styles.countryChevron, { color: tokens.textMuted }]}>▾</Text>
                  </TouchableOpacity>
                  <View style={[styles.phoneDivider, { backgroundColor: tokens.surfaceBorder }]} />
                  <TextInput
                    style={[styles.phoneInput, { color: tokens.textPrimary }]}
                    value={mobileDigits}
                    onChangeText={(v) => { setMobileDigits(v); setErrors((p) => ({ ...p, mobile_number: undefined })); }}
                    placeholder="912 345 6789"
                    placeholderTextColor={tokens.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
                {!!errors.mobile_number && <Text style={styles.errorText}>{errors.mobile_number}</Text>}
              </View>

              {/* Date of birth */}
              <View style={styles.field}>
                <Text style={labelStyle}>DATE OF BIRTH</Text>
                <TouchableOpacity
                  style={[inputStyle, styles.rowInput, !!errors.date_of_birth && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={dateOfBirth ? { color: tokens.textPrimary, fontSize: 14 } : { color: tokens.textMuted, fontSize: 14 }}>
                    {dateOfBirth ? formatDisplayDate(dateOfBirth) : 'Select date…'}
                  </Text>
                  <Text style={styles.inputIcon}>📅</Text>
                </TouchableOpacity>
                {!!errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}
              </View>

              {/* Default location */}
              <View style={styles.field}>
                <Text style={labelStyle}>DEFAULT LOCATION</Text>
                <TouchableOpacity
                  style={[inputStyle, styles.rowInput, !!errors.default_location && styles.inputError]}
                  onPress={handleOpenMap}
                  disabled={locating}
                  activeOpacity={0.7}
                >
                  {locating
                    ? <ActivityIndicator size="small" color={tokens.accent} />
                    : <>
                        <Text style={[{ flex: 1, fontSize: 14 }, defaultLocation ? { color: tokens.textPrimary } : { color: tokens.textMuted }]} numberOfLines={1}>
                          {defaultLocation || 'Tap to pick on map…'}
                        </Text>
                        <Text style={styles.inputIcon}>🗺️</Text>
                      </>}
                </TouchableOpacity>
                {!!errors.default_location && <Text style={styles.errorText}>{errors.default_location}</Text>}
              </View>

            </View>
          </ScrollView>

          {/* Save button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: tokens.accent }, isSaving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Date picker */}
        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide">
              <View style={styles.sheetOverlay}>
                <View style={styles.sheet}>
                  <View style={styles.sheetHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={[styles.sheetDone, { color: tokens.accent }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker value={pickerDate} mode="date" display="spinner" onChange={handleDateChange} maximumDate={new Date()} style={styles.iosDatePicker} />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker value={pickerDate} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />
          )
        )}

        {/* Map picker */}
        <MapLocationPicker
          visible={showMapPicker}
          title="Set Default Location"
          initialLat={mapInitCoords?.lat}
          initialLng={mapInitCoords?.lng}
          onConfirm={(location, lat, lng) => {
            setDefaultLocation(location);
            setLocationCoords({ lat, lng });
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
        />

        {/* Country picker */}
        <Modal visible={showCountryPicker} animationType="slide" transparent>
          <View style={styles.sheetOverlay}>
            <View style={[styles.sheet, styles.countrySheet]}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: tokens.textPrimary }]}>Select Country Code</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Text style={[styles.sheetClose, { color: tokens.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={COUNTRIES}
                keyExtractor={(c) => c.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.countryRow, item.code === country.code && { backgroundColor: `${tokens.accent}12` }]}
                    onPress={() => { setCountry(item); setShowCountryPicker(false); }}
                  >
                    <Text style={styles.countryRowFlag}>{item.flag}</Text>
                    <Text style={[styles.countryRowName, { color: tokens.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.countryRowDial, { color: tokens.textSecondary }]}>{item.dial}</Text>
                    {item.code === country.code && <Text style={[styles.countryRowCheck, { color: tokens.accent }]}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },

  navHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  backBtnText: { fontSize: 20, lineHeight: 22 },
  navTitle: { flex: 1, fontSize: 16, fontWeight: '700' },

  scroll: { flex: 1, backgroundColor: 'transparent' },

  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, marginBottom: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },
  changePhoto: { fontSize: 13, fontWeight: '700' },

  fields: { paddingHorizontal: 16, paddingBottom: 16 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },

  input: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 13,
    fontSize: 14,
  },
  rowInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { fontSize: 16, marginLeft: 8 },
  errorText: { marginTop: 4, fontSize: 12, color: '#ef4444', fontWeight: '500' },

  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    overflow: 'hidden', backgroundColor: 'transparent',
  },
  countryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13, gap: 4 },
  countryFlag: { fontSize: 18 },
  countryDial: { fontSize: 14, fontWeight: '600' },
  countryChevron: { fontSize: 10 },
  phoneDivider: { width: 1, height: 20 },
  phoneInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 13, fontSize: 14 },

  footer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, backgroundColor: 'transparent' },
  saveBtn: { borderRadius: 16, padding: 15, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  countrySheet: { maxHeight: '60%' },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetClose: { fontSize: 18 },
  sheetDone: { fontSize: 16, fontWeight: '700' },
  iosDatePicker: { height: 200 },

  countryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  countryRowFlag: { fontSize: 22 },
  countryRowName: { flex: 1, fontSize: 14, fontWeight: '500' },
  countryRowDial: { fontSize: 14, fontWeight: '600' },
  countryRowCheck: { fontSize: 16, fontWeight: '700' },
});
