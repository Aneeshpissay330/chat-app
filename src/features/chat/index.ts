import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { subscribeMyChats } from '../../services/chat';
import type { ChatRow } from '../../utils/chat';

type ChatsState = {
  rows: ChatRow[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
};

const initialState: ChatsState = { rows: [], status: 'idle', error: null };
let unsub: null | (() => void) = null;

export const syncMyChats = createAsyncThunk<void, void, { state: RootState }>(
  'chats/syncMyChats',
  async (_, thunkApi) => {
    if (unsub) unsub();
    return new Promise<void>((resolve) => {
      unsub = subscribeMyChats((rows) => {
        thunkApi.dispatch(setChats(rows));
        resolve(); // first emission resolves
      });
    });
  }
);

const slice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<ChatRow[]>) {
      state.rows = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearChats(state) {
      state.rows = [];
      state.status = 'idle';
      state.error = null;
      unsub?.();
      unsub = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(syncMyChats.pending, (s) => { s.status = 'loading'; s.error = null; });
    b.addCase(syncMyChats.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message ?? 'Failed'; });
  },
});

export const { setChats, clearChats } = slice.actions;
export const selectChatRows = (s: RootState) => s.chats.rows;
export const selectChatsStatus = (s: RootState) => s.chats.status;
export default slice.reducer;
