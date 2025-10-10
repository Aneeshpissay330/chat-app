import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setStep, completeOnboarding } from '../../../features/onboarding';
import cards from './data';
import { ProgressBar } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function OnboardingCarousel() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation() as any;
  const theme = useTheme();
  const colors = (theme as any)?.colors ?? {};
  const scrollRef = React.useRef<ScrollView | null>(null);
  const dispatch = useAppDispatch();
  const storedStep = useAppSelector((s) => s.onboarding?.step ?? 0);
  const [current, setCurrent] = React.useState<number>(storedStep ?? 0);

  function goTo(i: number) {
    const clamped = Math.max(0, Math.min(cards.length - 1, i));
    setCurrent(clamped);
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
  }

  function onNext() {
    if (current < cards.length - 1) goTo(current + 1);
    else {
      dispatch(completeOnboarding());
      // No direct navigation here — top-level Navigation will switch to the main app when onboardingCompleted becomes true
    }
  }

  function onSkip() {
    dispatch(completeOnboarding());
    // top-level Navigation listens to onboarding.completed and will render main Stacks
  }

  function onClose() {
    dispatch(completeOnboarding());
    // top-level Navigation listens to onboarding.completed and will render main Stacks
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== current) setCurrent(idx);
  }

  // initialize from persisted step
  React.useEffect(() => {
    if (storedStep && storedStep !== current) {
      setCurrent(storedStep);
      setTimeout(() => scrollRef.current?.scrollTo({ x: storedStep * width, animated: false }), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // write back step to redux when current changes
  React.useEffect(() => {
    dispatch(setStep(current));
  }, [current, dispatch]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.surface ?? '#fff' }]}>      
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onSkip}>
          <Text style={[styles.skipText, { color: colors.primary ?? '#7A6FF0' }]}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={{ color: colors.onSurfaceVariant ?? '#8A8A9E', fontSize: 20 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: cards.length * width }}
      >
        {cards.map((c, i) => (
          <View key={c.id} style={[styles.slide, { width }]}>            
            <Image source={{ uri: c.image }} style={styles.image} resizeMode="contain" />
            <View style={styles.slideText}>
              <Text style={[styles.title, { color: colors.onSurface ?? '#1E1E28' }]}>{c.title}</Text>
              {c.lines.map((l, j) => (
                <Text key={j} style={[styles.subtitle, { color: colors.onSurfaceVariant ?? '#8A8A9E' }]}>{l}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>        
        <View style={styles.progressWrap}>
          <ProgressBar progress={(current + 1) / cards.length} color={colors.primary ?? '#7A6FF0'} style={styles.progress} />
        </View>

        <TouchableOpacity onPress={onNext} style={[styles.nextButton, { backgroundColor: colors.primary ?? '#7A6FF0' }]}>
          <Text style={[styles.nextText, { color: colors.onPrimary ?? '#fff' }]}>{current === cards.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { height: 64, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  skipText: { fontSize: 16, fontWeight: '600' },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  image: { width: Math.min(320, width - 80), height: Math.min(320, width - 80), marginBottom: 20 },
  slideText: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bottomNav: { height: 96, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  progressWrap: { flex: 1, paddingHorizontal: 8 },
  progress: { height: 8, borderRadius: 8 },
  nextButton: { paddingHorizontal: 18, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
