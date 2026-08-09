import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Platform, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import RubberStampBadge from '../components/RubberStampBadge';
import { Theme } from '../constants/theme';
import baas from '../kroxt';
import { DiaryEntry, subscribeToMockData, toggleMockEntriesEmpty } from '../utils/mockData';

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View style={[skeletonStyles.card, { opacity }]}>
      <View style={skeletonStyles.cardHeader}>
        <View style={skeletonStyles.dateLine} />
        <View style={skeletonStyles.dot} />
      </View>
      <View style={skeletonStyles.titleLine} />
      <View style={skeletonStyles.bodyLine} />
      <View style={[skeletonStyles.bodyLine, { width: '60%' }]} />
    </Animated.View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.line,
    borderRadius: Theme.borderRadius.card,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  dateLine: {
    height: 10,
    width: '35%',
    borderRadius: 6,
    backgroundColor: Theme.colors.paperDim,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.paperDim,
  },
  titleLine: {
    height: 14,
    width: '55%',
    borderRadius: 6,
    backgroundColor: Theme.colors.paperDim,
    marginBottom: Theme.spacing.sm,
  },
  bodyLine: {
    height: 11,
    width: '90%',
    borderRadius: 6,
    backgroundColor: Theme.colors.paperDim,
    marginBottom: Theme.spacing.xs,
  },
});

export default function EntryListScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const lists = await baas.collection("lists").find();
      const mappedData: DiaryEntry[] = lists.map(item => {
        return {
          id: item._id,
          title: item.data.title || '',
          body: item.data.body || '',
          mood: item.data.mood || 'neutral',
          date: item.data.date || new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
        };
      });
      setEntries(mappedData);
    } catch (err) {
      console.log("Error fetching entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  useEffect(() => {
    // Fetch active user context
    const fetchUser = async () => {
      try {
        const user = await baas.auth.getCachedUser();
        if (user) {
          setUsername(user.displayName || user.name || 'Writer');
        }
      } catch (err) {
        console.log("Could not load cached user context:", err);
      }
    };
    fetchUser();

    // Subscribe to realtime changes on the "lists" collection
    const channel = baas.realtime.collection("lists").subscribe();

    channel.on("created", (doc: any) => {
      const newEntry: DiaryEntry = {
        id: doc._id,
        title: doc.data.title || '',
        body: doc.data.body || '',
        mood: doc.data.mood || 'neutral',
        date: doc.data.date || new Date(doc.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
      };
      setEntries(prev => [newEntry, ...prev.filter(e => e.id !== newEntry.id)]);
    });

    channel.on("updated", (doc: any) => {
      const updatedEntry: DiaryEntry = {
        id: doc._id,
        title: doc.data.title || '',
        body: doc.data.body || '',
        mood: doc.data.mood || 'neutral',
        date: doc.data.date || new Date(doc.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
      };
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    });

    channel.on("deleted", ({ documentId }: { documentId: string }) => {
      setEntries(prev => prev.filter(e => e.id !== documentId));
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchEntries]);

  const handleToggleEmpty = async () => {
    const nextEmptyState = !isEmptyState;
    setIsEmptyState(nextEmptyState);
    await toggleMockEntriesEmpty(nextEmptyState);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await baas.auth.logout();
      router.replace('/');
    } catch (err) {
      console.log("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  const getMoodColor = (mood: DiaryEntry['mood']) => {
    switch (mood) {
      case 'happy':
        return Theme.colors.moodHappy;
      case 'neutral':
        return Theme.colors.moodNeutral;
      case 'sad':
        return Theme.colors.moodSad;
      default:
        return Theme.colors.ink;
    }
  };

  const renderItem = ({ item }: { item: DiaryEntry }) => {
    return (
      <Pressable
        onPress={() => router.push({
          pathname: '/detail',
          params: {
            id: item.id,
            title: item.title || '',
            body: item.body,
            mood: item.mood,
            date: item.date,
          }
        })}
        style={({ pressed }) => [
          styles.card,
          {
            opacity: pressed ? 0.9 : 1.0,
            transform: pressed ? [{ scale: 0.99 }] : [],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{item.date}</Text>
          <View style={[styles.moodDot, { backgroundColor: getMoodColor(item.mood) }]} />
        </View>

        {item.title ? (
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
        ) : null}

        <Text style={styles.cardBody} numberOfLines={2}>
          {item.body}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Welcome Header & Logout */}
      <View style={styles.welcomeHeader}>
        <View>
          <Text style={styles.welcomeSubtitle}>Welcome back,</Text>
          <Text style={styles.welcomeTitle}>{username || 'Dear Writer'}</Text>
        </View>
        <Pressable style={[styles.logoutButton, isLoggingOut && { opacity: 0.6 }]} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut
            ? <ActivityIndicator size="small" color={Theme.colors.danger} />
            : (
              <>
                <Feather name="log-out" size={16} color={Theme.colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )
          }
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RubberStampBadge icon="edit-3" size={50} color={Theme.colors.inkFaint} rotation={-6} />
          <Text style={styles.emptyText}>No entries yet — write your first one.</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push('/new')}>
            <Text style={styles.emptyButtonText}>Begin writing</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push('/new')}
        style={({ pressed }) => [
          styles.fab,
          {
            opacity: pressed ? 0.85 : 1.0,
          },
        ]}
      >
        <Feather name="plus" size={24} color={Theme.colors.white} />
      </Pressable>

      {/* Powered by Kroxt BaaS */}
      <View style={styles.poweredBy} pointerEvents="none">
        <Text style={styles.poweredByText}>Powered by </Text>
        <Text style={styles.poweredByBrand}>Kroxt BaaS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.paper,
  },
  demoHeader: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xs,
    alignItems: 'flex-end',
  },
  demoToggle: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.paperDim,
    borderWidth: 1,
    borderColor: Theme.colors.line,
  },
  demoToggleText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.ink,
    fontWeight: 'bold',
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: 100, // Make sure not to cover entries with FAB
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.line,
    borderRadius: Theme.borderRadius.card,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  cardDate: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.inkFaint,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.lg,
    fontWeight: '700',
    color: Theme.colors.ink,
    marginBottom: Theme.spacing.xs,
  },
  cardBody: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.inkFaint,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    marginTop: -40,
  },
  emptyText: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.inkFaint,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
    maxWidth: 240,
    lineHeight: 24,
  },
  emptyButton: {
    marginTop: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  emptyButtonText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.ochre,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: Theme.spacing.lg,
    bottom: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.line,
    marginBottom: Theme.spacing.md,
  },
  welcomeSubtitle: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.inkFaint,
  },
  welcomeTitle: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.lg,
    fontWeight: '700',
    color: Theme.colors.ink,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.button,
    borderWidth: 1,
    borderColor: 'rgba(140, 58, 43, 0.25)',
    backgroundColor: 'rgba(140, 58, 43, 0.05)',
  },
  logoutText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    fontWeight: 'bold',
    color: Theme.colors.danger,
  },
  poweredBy: {
    position: 'absolute',
    bottom: Theme.spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poweredByText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.inkFaint,
    opacity: 0.5,
  },
  poweredByBrand: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    fontWeight: 'bold',
    color: Theme.colors.inkFaint,
    opacity: 0.5,
  },
});
