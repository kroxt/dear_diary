import baas from '@/kroxt';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MoodChip, { MoodType } from '../components/MoodChip';
import UnderlineInput from '../components/UnderlineInput';
import { Theme } from '../constants/theme';

export default function NewEntryScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');

    if (!body.trim()) {
      setError('Write something before saving.');
      return;
    }

    setLoading(true);

    try {
      await baas.collection("lists").create({
        title: title.trim(),                    // The diary entry title (string)
        body: body.trim(),                      // The main entry body text (string)
        mood: mood,                             // The mood chip value ('happy' | 'neutral' | 'sad')
        date: new Date().toLocaleDateString('en-US', {  // Date formatted for the UI cards
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      });
      router.back();
    } catch (err) {
      setError('Could not save your page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Configure Custom Header Buttons Inline */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={loading} style={styles.headerButton}>
              <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <UnderlineInput
          label="Title (Optional)"
          placeholder="Give this page a name..."
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />

        <View style={styles.moodSection}>
          <Text style={styles.sectionLabel}>How was your day?</Text>
          <View style={styles.moodContainer}>
            <MoodChip
              mood="happy"
              label="Good day"
              selected={mood === 'happy'}
              onPress={() => setMood('happy')}
            />
            <MoodChip
              mood="neutral"
              label="Just okay"
              selected={mood === 'neutral'}
              onPress={() => setMood('neutral')}
            />
            <MoodChip
              mood="sad"
              label="Rough day"
              selected={mood === 'sad'}
              onPress={() => setMood('sad')}
            />
          </View>
        </View>

        <View style={styles.bodySection}>
          <Text style={styles.sectionLabel}>Your Entry</Text>
          <UnderlineInput
            placeholder="Dear Diary, today was..."
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={10}
            style={styles.bodyInput}
            activeColor={Theme.colors.ink}
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
    padding: Theme.spacing.md,
  },
  headerButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  cancelText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.inkFaint,
  },
  saveText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    fontWeight: 'bold',
    color: Theme.colors.ochre,
  },
  errorText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.danger,
    marginBottom: Theme.spacing.md,
  },
  titleInput: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.xl,
    fontWeight: '700',
  },
  moodSection: {
    marginVertical: Theme.spacing.md,
  },
  sectionLabel: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.inkFaint,
    marginBottom: Theme.spacing.sm,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  bodySection: {
    marginTop: Theme.spacing.md,
  },
  bodyInput: {
    minHeight: 180,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
});
