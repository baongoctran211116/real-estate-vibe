// filename: src/screens/LoginScreen.tsx
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../navigation/types';
import { useLogin } from '../features/auth/useAuth';
import { AuthError } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<AuthStackParamList, 'Login'>;

// ─── Input component ──────────────────────────────────────────────────────────
interface InputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  rightAction?: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
}

const FormInput: React.FC<InputProps> = ({
  icon, placeholder, value, onChangeText, error, secureTextEntry, rightAction,
  keyboardType = 'default', autoCapitalize = 'none', returnKeyType, onSubmitEditing, inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <View style={[styles.inputRow, focused && styles.inputRowFocused, !!error && styles.inputRowError]}>
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
        />
        {rightAction}
      </View>
      {!!error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const redirectMessage = route.params?.redirectMessage;

  const { mutate: login, isPending, error: mutationError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const passwordRef = useRef<TextInput>(null);
  const serverError = mutationError ? (mutationError as AuthError).message : null;

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Email không hợp lệ';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    login(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          // Đóng modal Auth, trở về MainTabs
          if (navigation.canGoBack()) navigation.goBack();
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Close button (modal) */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoArea}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🏠</Text>
              </View>
              <Text style={styles.title}>Chào mừng trở lại</Text>
              <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
            </View>

            {/* Redirect message (nếu có) */}
            {!!redirectMessage && (
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>💡 {redirectMessage}</Text>
              </View>
            )}

            {/* Server error */}
            {!!serverError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {serverError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <FormInput
                icon="📧"
                placeholder="Email của bạn"
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                error={errors.email}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <FormInput
                inputRef={passwordRef}
                icon="🔒"
                placeholder="Mật khẩu"
                value={password}
                onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                error={errors.password}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                rightAction={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, isPending && styles.primaryBtnDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
                activeOpacity={0.85}
              >
                {isPending
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.primaryBtnText}>Đăng nhập</Text>
                }
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
                <Text style={styles.outlineBtnIcon}>🇬</Text>
                <Text style={styles.outlineBtnText}>Đăng nhập với Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoHint}>
              <Text style={styles.demoHintText}>🔑 Demo: demo@example.com / Demo@123</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' } as any)}>
                <Text style={styles.footerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EFF6FF' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, backgroundColor: '#EFF6FF' },

  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },

  logoArea: { alignItems: 'center', paddingTop: 28, paddingBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB', shadowOpacity: 0.15, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  logoEmoji: { fontSize: 38 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6B7280' },

  infoBanner: {
    backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  infoBannerText: { color: '#92400E', fontSize: 13 },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorBannerText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },

  form: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  inputWrapper: { marginBottom: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5E7EB', paddingHorizontal: 14, height: 52, gap: 10,
  },
  inputRowFocused: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  inputRowError: { borderColor: '#EF4444' },
  inputIcon: { fontSize: 17 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  inputError: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  eyeIcon: { fontSize: 18, paddingHorizontal: 2 },

  forgotRow: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, color: '#2563EB', fontWeight: '500' },

  primaryBtn: {
    backgroundColor: '#2563EB', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { color: '#9CA3AF', fontSize: 13 },

  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    height: 52, gap: 10, backgroundColor: '#FAFAFA',
  },
  outlineBtnIcon: { fontSize: 18 },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  demoHint: {
    alignItems: 'center', marginTop: 20, marginBottom: 4,
    paddingHorizontal: 8, paddingVertical: 8,
    backgroundColor: '#FFFBEB', borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A',
  },
  demoHintText: { fontSize: 12, color: '#92400E' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, color: '#2563EB', fontWeight: '700' },
});

export default LoginScreen;
