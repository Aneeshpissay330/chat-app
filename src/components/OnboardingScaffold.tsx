import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useTheme } from '../theme';

const { width } = Dimensions.get('window');

type Props = {
  title: string;
  lines: string[];
  image: string;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
  onGoTo?: (i: number) => void;
};

export default function OnboardingScaffold({
  title,
  lines,
  image,
  index,
  total,
  onNext,
  onSkip,
  onClose,
  onGoTo,
}: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colors = (theme as any)?.colors ?? {};

  const [barWidth, setBarWidth] = React.useState<number>(0);

  // PanResponder for swipe left/right navigation
  const panRef = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Start responding when horizontal movement is more pronounced than vertical
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderRelease: (_e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const { dx, dy, vx } = gestureState;
        // threshold for swipe
        const SWIPE_DISTANCE = 60;
        const SWIPE_VELOCITY = 0.2;

        if (dx < -SWIPE_DISTANCE && Math.abs(vx) > SWIPE_VELOCITY) {
          // swipe left -> next
          onNext && onNext();
        } else if (dx > SWIPE_DISTANCE && Math.abs(vx) > SWIPE_VELOCITY) {
          // swipe right -> previous
          if (onGoTo && index > 0) {
            onGoTo(index - 1);
          }
        }
      },
    })
  ).current;

  return (
  <View
      {...panRef.panHandlers}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.surface ?? '#FFFFFF' }]}
    >
      {/* Top nav */}
      <View style={styles.topNav} pointerEvents="box-none">
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.primary ?? '#7A6FF0' }]}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.onSurfaceVariant ?? '#8A8A9E' }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.onSurface ?? '#1E1E28' }]}>{title}</Text>
          {lines.map((l, i) => (
            <Text key={i} style={[styles.subtitle, { color: colors.onSurfaceVariant ?? '#8A8A9E' }]}>
              {l}
            </Text>
          ))}
        </View>
      </View>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Progress bar (react-native-paper) replaces dots */}
        <Pressable
          onPressIn={(e: any) => {
            const x = e.nativeEvent.locationX as number;
            if (!onGoTo || barWidth === 0) return;
            const target = Math.floor((x / barWidth) * total);
            const clamped = Math.max(0, Math.min(total - 1, target));
            onGoTo(clamped);
          }}
          onLayout={(e: any) => setBarWidth(e.nativeEvent.layout.width)}
          style={styles.progressWrap}
          accessibilityRole="adjustable"
          accessibilityLabel={`Onboarding progress ${index + 1} of ${total}`}
        >
          <ProgressBar
            progress={((index + 1) / total)}
            color={colors.primary ?? '#7A6FF0'}
            style={[styles.progressBackground, { backgroundColor: colors.surfaceVariant ?? '#F1F0F6' }]}
          />
        </Pressable>

        <TouchableOpacity onPress={onNext} style={[styles.nextButton, { backgroundColor: colors.primary ?? '#7A6FF0' }]} activeOpacity={0.85}>
          <Text style={[styles.nextText, { color: colors.onPrimary ?? '#fff' }]}>{index === total - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  skipButton: {},
  skipText: { color: '#7A6FF0', fontSize: 16, fontWeight: '600' },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#8A8A9E', fontSize: 20 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  image: { width: Math.min(320, width - 80), height: Math.min(320, width - 80), marginBottom: 20 },
  textWrap: { alignItems: 'center', paddingHorizontal: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1E28', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#8A8A9E', textAlign: 'center', lineHeight: 20 },
  bottomNav: { height: 96, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 8, marginHorizontal: 6 },
  dotActive: { backgroundColor: '#7A6FF0', transform: [{ scale: 1.2 }] },
  dotInactive: { backgroundColor: '#E6E6EB' },
  progressWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 8 },
  progressBackground: { height: 8, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%' },
  nextButton: {
    backgroundColor: '#7A6FF0',
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
