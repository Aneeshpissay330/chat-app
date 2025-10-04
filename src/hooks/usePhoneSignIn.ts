import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type UsePhoneAuthReturn = {
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  confirmResult: FirebaseAuthTypes.ConfirmationResult | null;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  // actions
  sendOtp: (phone?: string) => Promise<void>;
  confirmCode: (otp?: string) => Promise<void>;
  reset: () => void;
};

export function usePhoneAuth(): UsePhoneAuthReturn {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmResult, setConfirmResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const normalized = useMemo(() => phoneNumber.trim(), [phoneNumber]);

  const validateE164 = (num: string) => /^\+[1-9]\d{1,14}$/.test(num);

  const sendOtp = useCallback(async (phone?: string) => {
    const target = (phone ?? normalized).replace(/\s+/g, '');
    if (!validateE164(target)) {
      setError('Enter a valid phone number in E.164 format, e.g. +91xxxxxxxxxx');
      return;
    }
    try {
      setError(null);
      setIsSending(true);
      const confirmation = await auth().signInWithPhoneNumber(target);
      if (!mounted.current) return;
      setConfirmResult(confirmation);
    } catch (e: any) {
      if (!mounted.current) return;
      setError(e?.message ?? 'Failed to send OTP');
    } finally {
      if (mounted.current) setIsSending(false);
    }
  }, [normalized]);

  const confirmCode = useCallback(async (otp?: string) => {
    if (!confirmResult) return;
    const codeToUse = (otp ?? code).trim();
    if (!codeToUse) {
      setError('Please enter the OTP');
      return;
    }
    try {
      setError(null);
      setIsVerifying(true);
      await confirmResult.confirm(codeToUse);
      // onAuthStateChanged will fire on success
    } catch (e: any) {
      setError(e?.message ?? 'Invalid or expired code');
    } finally {
      if (mounted.current) setIsVerifying(false);
    }
  }, [confirmResult, code]);

  const reset = useCallback(() => {
    setConfirmResult(null);
    setCode('');
    setError(null);
  }, []);

  return {
    phoneNumber,
    setPhoneNumber,
    code,
    setCode,
    confirmResult,
    isSending,
    isVerifying,
    error,
    sendOtp,
    confirmCode,
    reset,
  };
}