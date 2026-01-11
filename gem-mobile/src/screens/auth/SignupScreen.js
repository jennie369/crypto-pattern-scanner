/**
 * Gemral - Signup Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Gem, Phone } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, INPUT, BUTTON } from '../../utils/tokens';
import { signUp } from '../../services/supabase';

export default function SignupScreen({ navigation }) {
  const { alert, AlertComponent } = useCustomAlert();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for waitlist linking callback from AuthContext
  useEffect(() => {
    global.onWaitlistLinked = (waitlistData) => {
      if (waitlistData?.success && waitlistData?.queue_number) {
        // Build benefits message based on queue position
        const isTop100 = waitlistData.is_top_100 || waitlistData.queue_number <= 100;
        let benefitsText = '';

        if (isTop100) {
          benefitsText = '\n\n🎁 Ưu đãi của bạn:\n• Giảm 10% khóa học Premium\n• Scanner TIER2 miễn phí 14 ngày\n• Tặng Crystal năng lượng';
        } else {
          benefitsText = '\n\n🎁 Ưu đãi của bạn:\n• Scanner TIER2 miễn phí 14 ngày\n• Quyền truy cập sớm';
        }

        // Show Early Bird welcome notification
        setTimeout(() => {
          alert({
            type: 'success',
            title: '🎉 Chào mừng Early Bird!',
            message: (waitlistData.message || `Bạn là thành viên #${waitlistData.queue_number}!`) + benefitsText,
            buttons: [{ text: 'Tuyệt vời!' }],
          });
        }, 1500); // Delay to show after account created message
      }
    };

    return () => {
      global.onWaitlistLinked = null;
    };
  }, [alert]);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      alert({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      alert({ type: 'error', title: 'Error', message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      alert({ type: 'error', title: 'Error', message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    // Pass phone in user_metadata for waitlist linking
    const { data, error } = await signUp(email, password, {
      phone: phone.trim() || null,
    });
    setLoading(false);

    if (error) {
      alert({ type: 'error', title: 'Signup Failed', message: error.message });
    } else {
      alert({
        type: 'success',
        title: 'Success',
        message: 'Account created! Please check your email to verify.',
        buttons: [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      });
    }
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Gem size={48} color={COLORS.gold} strokeWidth={1.5} />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the GEM trading community</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <Text style={styles.optionalLabel}>(không bắt buộc)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="0912345678"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                  <Text style={styles.hintText}>
                    Nhập SĐT đã đăng ký waitlist để nhận ưu đãi Early Bird
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={GRADIENTS.primaryButton}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Creating account...' : 'Sign Up'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.linkContainer}
                >
                  <Text style={styles.linkText}>
                    Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {AlertComponent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.huge,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  form: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  optionalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: INPUT.background,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    borderRadius: INPUT.borderRadius,
    padding: INPUT.padding,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textPrimary,
  },
  button: {
    padding: BUTTON.primary.padding,
    borderRadius: BUTTON.primary.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  linkHighlight: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
