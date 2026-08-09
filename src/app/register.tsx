import baas from '@/kroxt';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import RubberStampBadge from '../components/RubberStampBadge';
import UnderlineInput from '../components/UnderlineInput';
import { Theme } from '../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!name.trim() || !email || !password || !confirmPassword) {
      setError('Please write your name and fill in all the pages.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords you typed do not match.');
      return;
    }

    setLoading(true);

    try {
      const session = await baas.auth.register({
        email: email,
        password: password,
        displayName: name
      });

      if (session.user) {
        // Navigate to OTP verification screen
        router.push({ pathname: '/otp', params: { email } });
        await baas.communication.sendOtp({
          email: email,
          purpose: "signup",
        });
      } else {
        setError('Could not create your diary. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.badgeContainer}>
          <RubberStampBadge icon="book-open" size={40} color={Theme.colors.ochre} rotation={-6} />
        </View>

        <Text style={styles.title}>New Journal</Text>
        <Text style={styles.subtitle}>Begin your writing journey today.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
          <UnderlineInput
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <UnderlineInput
            label="Email Address"
            placeholder="your.email@domain.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <UnderlineInput
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <UnderlineInput
            label="Confirm Password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <PrimaryButton
            title="Create my diary"
            onPress={handleRegister}
            variant="ochre"
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have a diary? </Text>
            <Pressable onPress={() => router.push('/')}>
              <Text style={styles.linkText}>Open it here</Text>
            </Pressable>
          </View>
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
  },
  form: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  button: {
    marginTop: Theme.spacing.lg,
  },
  errorText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.danger,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    maxWidth: 320,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  footerText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.inkFaint,
  },
  linkText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    fontWeight: 'bold',
    color: Theme.colors.ink,
  },
});
