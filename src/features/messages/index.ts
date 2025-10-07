import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import {
  ensureDMChat,
  subscribeMessages,
  subscribePresence,
  markChatRead,
  setTyping,
  sendText,
  sendImage,
  sendVideo,
  sendAudio,
  sendFile,
} from '../../services/chat';

export type Message = {
  id: string;
  text?: string;
  createdAt: string;
  userId: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  url?: string;
  width?: number; height?: number; size?: number; name?: string; mime?: string;
};

type ChatState = {
  chatId?: string;
  messages: Message[];
  presenceText: string;
  status: 'idle' | 'loading' | 'ready' | 'failed';
  error?: string | null;
};

type MessagesState = {
  byOtherUid: Record<string, ChatState>;
};

const initialState: MessagesState = { byOtherUid: {} };

const unsubMap: Record<string, { msgs?: () => void; presence?: () => void }> = {};

export const openDmChat = createAsyncThunk<
  { otherUid: string; chatId: string },
  { otherUid: string }
>('messages/openDmChat', async ({ otherUid }) => {
  const chatId = await ensureDMChat(otherUid);
  return { otherUid, chatId };
});

export const startSubscriptions = createAsyncThunk<
  void,
  { otherUid: string; chatId: string; isSelf: boolean }
>('messages/startSubscriptions', async ({ otherUid, chatId, isSelf }, thunkApi) => {
  // cleanup old
  unsubMap[otherUid]?.msgs?.(); unsubMap[otherUid]?.presence?.();

  unsubMap[otherUid] = {};
  unsubMap[otherUid].msgs = subscribeMessages(chatId, (docs) => {
    const mapped: Message[] = docs.map((d) => ({
      id: d.id,
      text: d.text,
      createdAt: d.createdAt.toDate().toISOString(),
      userId: d.senderId,
      type: d.type,
      url: d.url,
      width: d.width, height: d.height, size: d.size, name: d.name, mime: d.mime,
    }));
    thunkApi.dispatch(setMessages({ otherUid, messages: mapped }));
  });

  if (!isSelf) {
    unsubMap[otherUid].presence = subscribePresence(otherUid, (isOnline, lastActive) => {
      const txt = isOnline
        ? 'Online'
        : lastActive
        ? `Last seen ${Math.max(1, Math.round((Date.now() - lastActive.getTime()) / 60000))}m ago`
        : 'Offline';
      thunkApi.dispatch(setPresence({ otherUid, presenceText: txt }));
    });
  } else {
    thunkApi.dispatch(setPresence({ otherUid, presenceText: '' }));
  }
});

export const markReadNow = createAsyncThunk<void, { chatId: string }>(
  'messages/markReadNow', async ({ chatId }) => { await markChatRead(chatId); }
);

export const setTypingNow = createAsyncThunk<void, { chatId: string; typing: boolean }>(
  'messages/setTypingNow', async ({ chatId, typing }) => { await setTyping(chatId, typing); }
);

export const sendTextNow = createAsyncThunk<void, { chatId: string; text: string }>(
  'messages/sendTextNow', async ({ chatId, text }) => { await sendText(chatId, text); }
);

// Convenience media thunks
export const sendImageNow = createAsyncThunk<void, { chatId: string; localPath: string; mime?: string; width?: number; height?: number; size?: number }>(
  'messages/sendImageNow', async (p) => { await sendImage(p.chatId, p); }
);
export const sendVideoNow = createAsyncThunk<void, { chatId: string; localPath: string; mime?: string; width?: number; height?: number; size?: number; durationMs?: number }>(
  'messages/sendVideoNow', async (p) => { await sendVideo(p.chatId, p); }
);
export const sendAudioNow = createAsyncThunk<void, { chatId: string; localPath: string; size?: number; mime?: string; durationMs?: number; name?: string }>(
  'messages/sendAudioNow', async (p) => { await sendAudio(p.chatId, p); }
);
export const sendFileNow = createAsyncThunk<void, { chatId: string; localPath: string; mime?: string; size?: number; name?: string }>(
  'messages/sendFileNow', async (p) => { await sendFile(p.chatId, p); }
);

const slice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<{ otherUid: string; messages: Message[] }>) {
      const s = state.byOtherUid[action.payload.otherUid] ?? { messages: [], presenceText: '', status: 'idle' };
      s.messages = action.payload.messages;
      s.status = 'ready';
      state.byOtherUid[action.payload.otherUid] = s as ChatState;
    },
    setPresence(state, action: PayloadAction<{ otherUid: string; presenceText: string }>) {
      const s = state.byOtherUid[action.payload.otherUid] ?? { messages: [], presenceText: '', status: 'idle' };
      s.presenceText = action.payload.presenceText;
      state.byOtherUid[action.payload.otherUid] = s as ChatState;
    },
    clearChatState(state, action: PayloadAction<{ otherUid: string }>) {
      const key = action.payload.otherUid;
      unsubMap[key]?.msgs?.(); unsubMap[key]?.presence?.();
      delete unsubMap[key];
      delete state.byOtherUid[key];
    },
  },
  extraReducers: (b) => {
    b.addCase(openDmChat.pending, (state, action) => {
      const otherUid = (action.meta.arg as any).otherUid;
      state.byOtherUid[otherUid] = { chatId: undefined, messages: [], presenceText: '', status: 'loading' };
    });
    b.addCase(openDmChat.fulfilled, (state, { payload }) => {
      const s = state.byOtherUid[payload.otherUid] ?? { messages: [], presenceText: '', status: 'idle' };
      s.chatId = payload.chatId;
      s.status = 'ready';
      state.byOtherUid[payload.otherUid] = s;
    });
    b.addCase(openDmChat.rejected, (state, { meta, error }) => {
      const otherUid = (meta.arg as any).otherUid;
      state.byOtherUid[otherUid] = { chatId: undefined, messages: [], presenceText: '', status: 'failed', error: error.message ?? 'Failed to open chat' };
    });
  },
});

export const { setMessages, setPresence, clearChatState } = slice.actions;

export const selectChatIdByOther = (s: RootState, otherUid: string) =>
  s.messages.byOtherUid[otherUid]?.chatId;

export const selectMessagesByOther = (s: RootState, otherUid: string) =>
  s.messages.byOtherUid[otherUid]?.messages ?? [];

export const selectPresenceByOther = (s: RootState, otherUid: string) =>
  s.messages.byOtherUid[otherUid]?.presenceText ?? '';

export const selectMsgStatusByOther = (s: RootState, otherUid: string) =>
  s.messages.byOtherUid[otherUid]?.status ?? 'idle';

export default slice.reducer;
