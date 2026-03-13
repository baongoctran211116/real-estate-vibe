// filename: src/screens/EditProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';

// ─── Input component ─────────────────────────────────────────────────────────
interface InputProps {
  label: string;
  icon: string;
  value: string;
  onChangeText?: (t: string) => void;
  error?: string;
  hint?: string;
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
  editable?: boolean;
}

const FormInput: React.FC<InputProps> = ({
  label, icon, value, onChangeText, error, hint,
  keyboardType = 'default', autoCapitalize = 'none', editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputRow,
        focused && editable && styles.inputRowFocused,
        !!error && styles.inputRowError,
        !editable && styles.inputRowDisabled,
      ]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={[styles.input, !editable && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {!editable && <Text style={styles.lockIcon}>🔒</Text>}
      </View>
      {!!hint && !error && <Text style={styles.fieldHint}>{hint}</Text>}
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
};

// ─── Avatar circle with initial ──────────────────────────────────────────────
const AVATAR_COLORS = [
  '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626',
  '#0891B2', '#9333EA', '#16A34A',
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    fullName.trim() !== (user?.fullName ?? '') ||
    phone.trim() !== (user?.phone ?? '');

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    if (phone.trim() && !/^0[3578][0-9]{8}$/.test(phone.trim()))
      e.phone = 'SĐT không hợp lệ (vd: 0901234567)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!validate() || !user) return;

    setIsSaving(true);
    try {
      await authService.updateProfile(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      updateProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined });
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công ✓', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const avatarColor = getAvatarColor(fullName || user.fullName);
  const initials = getInitials(fullName || user.fullName);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar section */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>Đổi ảnh đại diện</Text>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tính năng sắp ra mắt</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <FormInput
                label="Họ và tên"
                icon="👤"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  if (errors.fullName) setErrors((e) => ({ ...e, fullName: undefined }));
                }}
                error={errors.fullName}
                autoCapitalize="words"
              />

              <FormInput
                label="Email"
                icon="📧"
                value={user.email}
                editable={false}
                hint="Email không thể thay đổi trực tiếp"
              />

              <FormInput
                label="Số điện thoại"
                icon="📱"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
                }}
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!hasChanges || isSaving) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>

            {!hasChanges && (
              <Text style={styles.noChangeHint}>Chưa có thay đổi nào</Text>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48, paddingTop: 24 },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarInitials: { fontSize: 34, color: '#FFFFFF', fontWeight: '700' },
  changePhotoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 6,
  },
  changePhotoText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  avatarHint: { fontSize: 11, color: '#9CA3AF' },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 4,
  },

  fieldWrapper: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputRowFocused: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  inputRowError: { borderColor: '#EF4444' },
  inputRowDisabled: { backgroundColor: '#F3F4F6' },
  inputIcon: { fontSize: 17 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  inputDisabled: { color: '#9CA3AF' },
  lockIcon: { fontSize: 14 },
  fieldHint: { fontSize: 12, color: '#9CA3AF', marginTop: 5, marginLeft: 4 },
  fieldError: { fontSize: 12, color: '#EF4444', marginTop: 5, marginLeft: 4 },

  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  noChangeHint: { textAlign: 'center', fontSize: 13, color: '#9CA3AF' },
});

export default EditProfileScreen;
