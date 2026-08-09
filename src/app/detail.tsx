import baas from '@/kroxt';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MoodChip, { MoodType } from '../components/MoodChip';
import UnderlineInput from '../components/UnderlineInput';
import { Theme } from '../constants/theme';
import { deleteMockEntry, DiaryEntry, saveMockEntry } from '../utils/mockData';

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    body?: string;
    mood?: MoodType;
    date?: string;
  }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMood, setEditMood] = useState<MoodType>('neutral');
  const [editBody, setEditBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      // 1. If we have params passed in (avoiding network fetch)
      if (params.id && params.body) {
        const found: DiaryEntry = {
          id: params.id,
          title: params.title || '',
          body: params.body,
          mood: params.mood || 'neutral',
          date: params.date || '',
        };
        setEntry(found);
        setEditTitle(found.title || '');
        setEditMood(found.mood);
        setEditBody(found.body);
        return;
      }

      // 2. Fallback: If only ID is present (e.g. fresh reload or deep link)
      try {
        const data = await baas.collection("lists").get(params.id);
        if (data) {
          const found: DiaryEntry = {
            id: data._id,
            title: data.data.title || '',
            body: data.data.body || '',
            mood: data.data.mood || 'neutral',
            date: data.data.date || new Date(data.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
          };
          setEntry(found);
          setEditTitle(found.title || '');
          setEditMood(found.mood);
          setEditBody(found.body);
        }
      } catch (err) {
        console.log("Error fetching entry detail:", err);
      }
    };
    fetchEntry();
  }, [params.id, params.body, params.title, params.mood, params.date, isEditing]);

  if (!entry) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>This page seems to have vanished.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = async () => {
    setError('');

    if (!editBody.trim()) {
      setError('Write something before saving.');
      return;
    }

    setLoading(true);

    try {
      // Update in Kroxt collection
      await baas.collection("lists").update(entry.id, {
        title: editTitle.trim(),
        body: editBody.trim(),
        mood: editMood,
      });

      // Update local screen state
      const updated: DiaryEntry = {
        ...entry,
        title: editTitle.trim(),
        body: editBody.trim(),
        mood: editMood,
      };
      setEntry(updated);
      setIsEditing(false);
    } catch (err) {
      setError('Could not update your page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Page?',
      'Are you sure you want to tear this page out of your diary forever?',
      [
        { text: 'Keep page', style: 'cancel' },
        {
          text: 'Tear it out',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Delete from Kroxt collection
              await baas.collection("lists").delete(entry.id);
              router.back();
            } catch (err) {
              setIsDeleting(false);
              Alert.alert('Error', 'Could not delete this entry.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getMoodLabel = (m: MoodType) => {
    if (m === 'happy') return 'Good day';
    if (m === 'sad') return 'Rough day';
    return 'Just okay';
  };

  const getMoodColor = (m: MoodType) => {
    if (m === 'happy') return Theme.colors.moodHappy;
    if (m === 'sad') return Theme.colors.moodSad;
    return Theme.colors.moodNeutral;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Configure Custom Header Options dynamically */}
      <Stack.Screen
        options={{
          headerLeft: isEditing
            ? () => (
                <Pressable
                  onPress={() => {
                    setIsEditing(false);
                    setEditTitle(entry.title || '');
                    setEditMood(entry.mood);
                    setEditBody(entry.body);
                    setError('');
                  }}
                  style={styles.headerButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              )
            : undefined, // default back arrow in view mode
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {isEditing ? (
                <Pressable onPress={handleSave} disabled={loading} style={styles.headerButton}>
                  <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable onPress={() => setIsEditing(true)} style={styles.headerButton} disabled={isDeleting}>
                    <Text style={[styles.editText, isDeleting && { opacity: 0.4 }]}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={handleDelete} style={styles.headerButton} disabled={isDeleting}>
                    {isDeleting
                      ? <ActivityIndicator size="small" color={Theme.colors.danger} />
                      : <Text style={styles.deleteText}>Delete</Text>
                    }
                  </Pressable>
                </>
              )}
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          // EDITING MODE
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <UnderlineInput
              label="Title"
              placeholder="Give this page a name..."
              value={editTitle}
              onChangeText={setEditTitle}
              style={styles.titleInputEdit}
            />

            <View style={styles.moodSection}>
              <Text style={styles.sectionLabel}>How was your day?</Text>
              <View style={styles.moodContainer}>
                <MoodChip
                  mood="happy"
                  label="Good day"
                  selected={editMood === 'happy'}
                  onPress={() => setEditMood('happy')}
                />
                <MoodChip
                  mood="neutral"
                  label="Just okay"
                  selected={editMood === 'neutral'}
                  onPress={() => setEditMood('neutral')}
                />
                <MoodChip
                  mood="sad"
                  label="Rough day"
                  selected={editMood === 'sad'}
                  onPress={() => setEditMood('sad')}
                />
              </View>
            </View>

            <View style={styles.bodySection}>
              <Text style={styles.sectionLabel}>Your Entry</Text>
              <UnderlineInput
                placeholder="Write your thoughts..."
                value={editBody}
                onChangeText={setEditBody}
                multiline
                numberOfLines={10}
                style={styles.bodyInputEdit}
                activeColor={Theme.colors.ink}
              />
            </View>
          </View>
        ) : (
          // VIEW MODE
          <View style={styles.pageContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.dateText}>{entry.date}</Text>
              
              <View
                style={[
                  styles.moodPillStatic,
                  { borderColor: getMoodColor(entry.mood) }
                ]}
              >
                <Text style={[styles.moodPillText, { color: getMoodColor(entry.mood) }]}>
                  {getMoodLabel(entry.mood)}
                </Text>
              </View>
            </View>

            {entry.title ? <Text style={styles.entryTitle}>{entry.title}</Text> : null}

            <View style={styles.separator} />

            <Text style={styles.entryBody}>{entry.body}</Text>
          </View>
        )}
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  editText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.ink,
    marginRight: Theme.spacing.sm,
  },
  deleteText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.danger,
    fontWeight: '600',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.paper,
    padding: Theme.spacing.lg,
  },
  notFoundText: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.inkFaint,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  backButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.ink,
  },
  backButtonText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.white,
    fontWeight: 'bold',
  },
  // View mode styles
  pageContainer: {
    padding: Theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  dateText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.inkFaint,
  },
  moodPillStatic: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.pill,
    paddingVertical: Theme.spacing.xs / 2,
    paddingHorizontal: Theme.spacing.sm,
  },
  moodPillText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    fontWeight: '600',
  },
  entryTitle: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.xl,
    fontWeight: '700',
    color: Theme.colors.ink,
    marginBottom: Theme.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.line,
    marginBottom: Theme.spacing.lg,
  },
  entryBody: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.ink,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  // Edit mode styles
  formContainer: {
    width: '100%',
  },
  errorText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.danger,
    marginBottom: Theme.spacing.md,
  },
  titleInputEdit: {
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
  bodyInputEdit: {
    minHeight: 240,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
});
