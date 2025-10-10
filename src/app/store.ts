import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import contactsReducer from '../features/contacts';
import chatReducer from '../features/chat';
import messageReducer from '../features/messages';
import onboardingReducer from '../features/onboarding';

const rootReducer = combineReducers({
  contacts: contactsReducer,
  chats: chatReducer,
  messages: messageReducer
  , onboarding: onboardingReducer
  // add more slices here (e.g., auth)
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['contacts', 'chats', 'messages', 'onboarding'], // persist contacts slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
