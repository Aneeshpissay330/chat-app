import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findUsersByPhones } from '../../services/findUserByPhones'; // ensure this returns an array
import { handleContactPermission } from '../../permission'; // your helper from index.tsx

export type DeviceContact = {
  recordID: string;
  displayName?: string;
  phoneNumbers: { label?: string; number: string }[];
};

export type MatchedUser = {
  id: string;
  uid: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  searchablePhones?: string[];
};

type ContactsState = {
  deviceContacts: DeviceContact[];
  matchedUsers: MatchedUser[];     // users found in Firestore by phone
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
  lastSynced?: number | null;
};

const initialState: ContactsState = {
  deviceContacts: [],
  matchedUsers: [],
  status: 'idle',
  error: null,
  lastSynced: null,
};

// India-focused variants: always ensure +91 form present
export function normalizeVariants(raw: string): string[] {
  const cleaned = (raw ?? '').replace(/[^\d]/g, '');
  let finalE164 = '';

  if (cleaned.length === 10) finalE164 = `+91${cleaned}`;
  else if (cleaned.length === 12 && cleaned.startsWith('91')) finalE164 = `+${cleaned}`;
  else if (cleaned.length === 11 && cleaned.startsWith('0')) finalE164 = `+91${cleaned.slice(1)}`;

  const last10 = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;

  const uniq = new Set<string>();
  if (finalE164) uniq.add(finalE164);
  if (cleaned) uniq.add(cleaned);
  if (last10) uniq.add(last10);
  return Array.from(uniq);
}

export function extractPhoneNumbers(contacts: DeviceContact[]): string[] {
  const out: string[] = [];
  for (const c of contacts) {
    for (const p of c.phoneNumbers ?? []) {
      if (p?.number) out.push(p.number);
    }
  }
  return out;
}

/**
 * Sync device contacts, exclude my own number, and find matched users in Firestore.
 * Pass your own phone number (from useUserDoc) so we exclude it *before* querying.
 */
export const syncContacts = createAsyncThunk<
  { deviceContacts: DeviceContact[]; matchedUsers: MatchedUser[]; now: number },
  { myPhoneNumber?: string } | void,
  { state: RootState }
>('contacts/sync', async (arg, thunkApi) => {
  try {
    // Permission
    const perm = await handleContactPermission('request');
    // If blocked/denied, bail with empty data (you can open settings elsewhere)
    if (perm === 'blocked' || perm === 'denied') {
      return { deviceContacts: [], matchedUsers: [], now: Date.now() };
    }

    // Fetch device contacts
    const deviceContacts = (await Contacts.getAll()) as unknown as DeviceContact[];

    // Extract raw phone numbers
    const allNumbers = extractPhoneNumbers(deviceContacts);

    // // Exclude my number BEFORE hitting Firestore
    // const myPhone = (arg as any)?.myPhoneNumber;
    // const mySet = new Set(myPhone ? normalizeVariants(myPhone) : []);
    // const filteredNumbers = allNumbers.filter((n) => {
    //   const variants = normalizeVariants(n);
    //   return !variants.some((v) => mySet.has(v));
    // });

    // Query Firestore for matched users
    const matchedUsers = await findUsersByPhones(allNumbers);

    return { deviceContacts, matchedUsers, now: Date.now() };
  } catch (e: any) {
    return thunkApi.rejectWithValue(e?.message ?? 'Failed to sync contacts');
  }
});

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearContacts(state) {
      state.deviceContacts = [];
      state.matchedUsers = [];
      state.error = null;
      state.status = 'idle';
      state.lastSynced = null;
    },
    setMatchedUsers(state, action: PayloadAction<MatchedUser[]>) {
      state.matchedUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncContacts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(syncContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.deviceContacts = action.payload.deviceContacts;
        state.matchedUsers = action.payload.matchedUsers;
        state.lastSynced = action.payload.now;
      })
      .addCase(syncContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Unknown error';
      });
  },
});

export const { clearContacts, setMatchedUsers } = contactsSlice.actions;

// Selectors
export const selectContactsStatus = (s: RootState) => s.contacts.status;
export const selectDeviceContacts = (s: RootState) => s.contacts.deviceContacts;
export const selectMatchedUsers = (s: RootState) => s.contacts.matchedUsers;
export const selectLastSynced = (s: RootState) => s.contacts.lastSynced;

export default contactsSlice.reducer;
