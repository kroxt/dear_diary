import baas from '@/kroxt';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import RubberStampBadge from '../components/RubberStampBadge';
import { Theme } from '../constants/theme';

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(47); // Start at 47 seconds to match the "0:47" prompt mockup

  // Create refs for the 6 input elements
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];

    if (cleanedText) {
      // Take only the last digit if multiple characters are pasted
      const digit = cleanedText.slice(-1);
      newCode[index] = digit;
      setCode(newCode);

      // Focus next field if it exists
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      // Handle delete
      newCode[index] = '';
      setCode(newCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // If backspace is pressed on an empty field, focus the previous field
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async () => {
    setError('');
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please return to the signup screen.');
      return;
    }

    setLoading(true);

    try {
      const res = await baas.communication.verifyOtp({
        email: email,
        purpose: "signup",
        code: fullCode,
      });
      if (res.success) {
        console.log("OTP code verified successfully!");
      }

      if (res.success) {
        router.push('/list');
      } else {
        setError(res.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(59);
    // MOCK — trigger OTP resend call here
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.badgeContainer}>
          <RubberStampBadge icon="shield" size={40} color={Theme.colors.ink} rotation={6} />
        </View>

        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email || 'your email'}.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={el => { inputsRef.current[idx] = el; }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={text => handleChangeText(text, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                placeholderTextColor={Theme.colors.inkFaint}
                autoFocus={idx === 0}
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code in {formatTimer(timer)}
              </Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={styles.resendLink}>Resend code</Text>
              </Pressable>
            )}
          </View>

          <PrimaryButton
            title="Verify code"
            onPress={handleVerify}
            variant="ink"
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.paper,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  badgeContainer: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.xxl,
    fontWeight: '700',
    color: Theme.colors.ink,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.inkFaint,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    maxWidth: 280,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.lg,
  },
  otpInput: {
    width: 40,
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.line,
    textAlign: 'center',
    fontSize: Theme.fontSizes.lg,
    fontWeight: 'bold',
    color: Theme.colors.ink,
    fontFamily: Theme.fonts.body,
  },
  timerContainer: {
    marginBottom: Theme.spacing.xl,
  },
  timerText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.inkFaint,
  },
  resendLink: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    fontWeight: 'bold',
    color: Theme.colors.ochre,
  },
  button: {
    marginTop: Theme.spacing.md,
  },
  errorText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.danger,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    maxWidth: 320,
  },
});
