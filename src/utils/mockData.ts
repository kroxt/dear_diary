export interface DiaryEntry {
  id: string;
  title?: string;
  body: string;
  date: string; // E.g., "August 9, 2026"
  mood: 'happy' | 'neutral' | 'sad';
}

const INITIAL_MOCK_ENTRIES: DiaryEntry[] = [
  {
    id: '1',
    title: 'A quiet morning in the garden',
    body: 'I spent an hour sipping tea and reading by the rose bushes. The air was crisp, and the sun felt warm on my shoulders. It is nice when time slows down like this.',
    date: 'August 9, 2026',
    mood: 'happy',
  },
  {
    id: '2',
    title: 'Rainy Tuesday afternoon',
    body: 'The rain hasn\'t stopped all day. I stayed inside, made a hot bowl of soup, and worked on some sketches. Feeling a bit sluggish but overall peaceful.',
    date: 'August 8, 2026',
    mood: 'neutral',
  },
  {
    id: '3',
    title: 'Coffee spill disaster',
    body: 'Dropped my favorite ceramic mug right before my morning call. Coffee went everywhere, including all over my fresh shirt. Just one of those frustrating mornings where everything feels off.',
    date: 'August 7, 2026',
    mood: 'sad',
  },
  {
    id: '4',
    title: 'Found a second-hand bookshop',
    body: 'Stumbled upon a tiny bookshop called "The Old Parchment" on Elm Street. Found a beautiful leather-bound poetry book from the 1920s. A true treasure!',
    date: 'August 5, 2026',
    mood: 'happy',
  },
  {
    id: '5',
    title: 'Struggling to find words',
    body: 'Tried to write the next chapter of my journal but my thoughts felt scattered. I decided to shut the book and take a long walk around the reservoir to clear my head.',
    date: 'August 4, 2026',
    mood: 'neutral',
  },
];

let mockEntries: DiaryEntry[] = [...INITIAL_MOCK_ENTRIES];
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function subscribeToMockData(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Helper to toggle between populated and empty states for demo purposes
export function toggleMockEntriesEmpty(empty: boolean) {
  if (empty) {
    mockEntries = [];
  } else {
    mockEntries = [...INITIAL_MOCK_ENTRIES];
  }
  notifyListeners();
  return Promise.resolve(mockEntries);
}

export function getMockEntries(): Promise<DiaryEntry[]> {
  // MOCK — replace with real Kroxt database fetch later:
  // return baas.db.collection('entries').find({ order: 'desc' })
  return Promise.resolve([...mockEntries]);
}

export function saveMockEntry(entryData: Omit<DiaryEntry, 'id' | 'date'> & { id?: string }): Promise<DiaryEntry> {
  // MOCK — replace with real Kroxt database insertion/update later:
  // if (entryData.id) {
  //   return baas.db.collection('entries').update(entryData.id, entryData)
  // } else {
  //   return baas.db.collection('entries').create(entryData)
  // }
  
  if (entryData.id) {
    // Edit existing
    mockEntries = mockEntries.map(e => {
      if (e.id === entryData.id) {
        return {
          ...e,
          title: entryData.title,
          body: entryData.body,
          mood: entryData.mood,
        };
      }
      return e;
    });
    const updated = mockEntries.find(e => e.id === entryData.id)!;
    notifyListeners();
    return Promise.resolve(updated);
  } else {
    // Create new
    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    
    const newEntry: DiaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: entryData.title,
      body: entryData.body,
      mood: entryData.mood,
      date: dateStr,
    };
    
    mockEntries = [newEntry, ...mockEntries];
    notifyListeners();
    return Promise.resolve(newEntry);
  }
}

export function deleteMockEntry(id: string): Promise<{ success: boolean }> {
  // MOCK — replace with real Kroxt database deletion later:
  // return baas.db.collection('entries').delete(id)
  
  mockEntries = mockEntries.filter(e => e.id !== id);
  notifyListeners();
  return Promise.resolve({ success: true });
}

// Authentication Mock Functions
export function mockLogin(email: string, password?: string): Promise<{ success: boolean; message?: string }> {
  // MOCK — replace with real Kroxt login call later:
  // return baas.auth.login({ email, password })
  
  if (!email || !email.includes('@')) {
    return Promise.resolve({ success: false, message: 'Please enter a valid email address.' });
  }
  return Promise.resolve({ success: true });
}

export function mockRegister(email: string, password?: string, confirmPassword?: string, name?: string): Promise<{ success: boolean; message?: string }> {
  // MOCK — replace with real Kroxt registration call later:
  // return baas.auth.register({ name, email, password })
  
  if (!email || !email.includes('@')) {
    return Promise.resolve({ success: false, message: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 8) {
    return Promise.resolve({ success: false, message: 'Password must be at least 8 characters.' });
  }
  if (password !== confirmPassword) {
    return Promise.resolve({ success: false, message: 'Passwords do not match.' });
  }
  return Promise.resolve({ success: true });
}

export function mockVerifyOTP(code: string): Promise<{ success: boolean; message?: string }> {
  // MOCK — replace with real Kroxt OTP verification call later:
  // return baas.auth.verifyOTP({ code })
  
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return Promise.resolve({ success: false, message: 'Please enter a valid 6-digit code.' });
  }
  return Promise.resolve({ success: true });
}
