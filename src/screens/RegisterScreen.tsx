// filename: src/screens/RegisterScreen.tsx
import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useRegister } from '../features/auth/useAuth';
import { AuthError } from '../types/auth';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

// ─── Password strength ────────────────────────────────────────────────────────
type Strength = 'weak' | 'medium' | 'strong';

const getStrength = (pw: string): Strength => {
  if (pw.length === 0) return 'weak';
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'medium';
  return 'strong';
};

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: 'Yếu',
  medium: 'Trung bình',
  strong: 'Mạnh',
};
const STRENGTH_COLOR: Record<Strength, string> = {
  weak: '#EF4444',
  medium: '#F59E0B',
  strong: '#10B981',
};
const STRENGTH_WIDTH: Record<Strength, string> = {
  weak: '33%',
  medium: '66%',
  strong: '100%',
};

// ─── Input component ─────────────────────────────────────────────────────────
interface InputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  rightAction?: React.ReactNode;
  badge?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
  editable?: boolean;
}

const FormInput: React.FC<InputProps> = ({
  icon, placeholder, value, onChangeText, error,
  secureTextEntry, rightAction, badge,
  keyboardType = 'default', autoCapitalize = 'none',
  returnKeyType, onSubmitEditing, inputRef, editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <View style={[
        styles.inputRow,
        focused && styles.inputRowFocused,
        !!error && styles.inputRowError,
        !editable && styles.inputRowDisabled,
      ]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
        />
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {rightAction}
      </View>
      {!!error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { mutate: register, isPending, error: mutationError } = useRegister();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const strength = getStrength(password);
  const serverError = mutationError ? (mutationError as AuthError).message : null;

  const clearError = (field: string) =>
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Email không hợp lệ';
    if (phone.trim() && !/^0[3578][0-9]{8}$/.test(phone.trim()))
      e.phone = 'SĐT không hợp lệ (vd: 0901234567)';
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
      e.password = 'Tối thiểu 8 ký tự, có chữ hoa và số';
    if (!confirmPassword)
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword)
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    register({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() || undefined, password, confirmPassword });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backIcon}>←</Text>
                <Text style={styles.backText}>Quay lại</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.titleArea}>
              <Text style={styles.title}>Tạo tài khoản mới</Text>
              <Text style={styles.subtitle}>Điền thông tin để đăng ký</Text>
            </View>

            {/* Server error */}
            {!!serverError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {serverError}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <FormInput
                icon="👤"
                placeholder="Họ và tên"
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError('fullName'); }}
                error={errors.fullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              <FormInput
                inputRef={emailRef}
                icon="📧"
                placeholder="Email"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
                error={errors.email}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />

              <FormInput
                inputRef={phoneRef}
                icon="📱"
                placeholder="Số điện thoại"
                value={phone}
                onChangeText={(t) => { setPhone(t); clearError('phone'); }}
                error={errors.phone}
                keyboardType="phone-pad"
                badge="Tùy chọn"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <FormInput
                inputRef={passwordRef}
                icon="🔒"
                placeholder="Mật khẩu"
                value={password}
                onChangeText={(t) => { setPassword(t); clearError('password'); }}
                error={errors.password}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                rightAction={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />

              {/* Strength indicator */}
              {password.length > 0 && (
                <View style={styles.strengthWrapper}>
                  <View style={styles.strengthBar}>
                    <View style={[
                      styles.strengthFill,
                      {
                        width: STRENGTH_WIDTH[strength] as any,
                        backgroundColor: STRENGTH_COLOR[strength],
                      },
                    ]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: STRENGTH_COLOR[strength] }]}>
                    {STRENGTH_LABEL[strength]}
                  </Text>
                </View>
              )}

              <FormInput
                inputRef={confirmRef}
                icon="🔒"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                rightAction={
                  <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />

              {/* Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreed((v) => !v)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  Tôi đồng ý với{' '}
                  <Text style={styles.link}>Điều khoản dịch vụ</Text>
                  {' '}và{' '}
                  <Text style={styles.link}>Chính sách bảo mật</Text>
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!agreed || isPending) && styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!agreed || isPending}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Đăng ký</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },

  header: { paddingTop: 16, marginBottom: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backIcon: { fontSize: 20, color: '#2563EB' },
  backText: { fontSize: 15, color: '#2563EB', fontWeight: '500' },

  titleArea: { paddingTop: 20, paddingBottom: 28 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6B7280' },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  inputWrapper: { marginBottom: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 52,
    gap: 8,
  },
  inputRowFocused: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  inputRowError: { borderColor: '#EF4444' },
  inputRowDisabled: { backgroundColor: '#F3F4F6', opacity: 0.6 },
  inputIcon: { fontSize: 17 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  inputError: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  eyeIcon: { fontSize: 18 },

  badge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },

  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 14,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthFill: { height: '100%', borderRadius: 4 },
  strengthLabel: { fontSize: 12, fontWeight: '600', minWidth: 72 },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  link: { color: '#2563EB', fontWeight: '600' },

  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, color: '#2563EB', fontWeight: '700' },
});

export default RegisterScreen;
