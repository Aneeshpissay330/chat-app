import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type OnboardingState = {
  completed: boolean;
  step: number;
};

const initialState: OnboardingState = {
  completed: false,
  step: 0,
};

const slice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    completeOnboarding(state) {
      state.completed = true;
    },
    resetOnboarding(state) {
      state.completed = false;
      state.step = 0;
    },
  },
});

export const { setStep, completeOnboarding, resetOnboarding } = slice.actions;

export default slice.reducer;
