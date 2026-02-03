import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Shadows, Timing } from '../lib/constants';

interface QuickPanelProps {
  visible: boolean;
  onClose: () => void;
  dailyGoal: number;
  defaultAmount: number;
  onGoalPress: () => void;
  onAmountPress: () => void;
}

const PANEL_HEIGHT = 260;
const DRAG_THRESHOLD = 80;

export function QuickPanel({
  visible,
  onClose,
  dailyGoal,
  defaultAmount,
  onGoalPress,
  onAmountPress,
}: QuickPanelProps) {
  const router = useRouter();
  
  const translateY = useSharedValue(PANEL_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: Timing.fast });
      translateY.value = withSpring(0, Timing.spring.gentle);
    } else {
      backdropOpacity.value = withTiming(0, { duration: Timing.fast });
      translateY.value = withTiming(PANEL_HEIGHT, { duration: Timing.normal });
    }
  }, [visible]);

  const closePanel = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Only allow dragging down
      const newY = context.value.y + event.translationY;
      translateY.value = Math.max(0, newY);
    })
    .onEnd((event) => {
      if (event.translationY > DRAG_THRESHOLD || event.velocityY > 500) {
        translateY.value = withTiming(PANEL_HEIGHT, { duration: Timing.normal });
        runOnJS(closePanel)();
      } else {
        translateY.value = withSpring(0, Timing.spring.responsive);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const formatGoal = (ml: number) => {
    return (ml / 1000).toFixed(1).replace('.', ',');
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      router.push('/settings');
    }, 200);
  };

  const handleGoalPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      onGoalPress();
    }, 200);
  };

  const handleAmountPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      onAmountPress();
    }, 200);
  };

  if (!visible && translateY.value === PANEL_HEIGHT) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.panel, panelStyle]}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Quick options - pure text, no emojis */}
          <View style={styles.optionsContainer}>
            <Pressable style={styles.optionRow} onPress={handleGoalPress}>
              <Text style={styles.optionLabel}>Tagesziel</Text>
              <Text style={styles.optionValue}>{formatGoal(dailyGoal)} L</Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable style={styles.optionRow} onPress={handleAmountPress}>
              <Text style={styles.optionLabel}>Standardmenge</Text>
              <Text style={styles.optionValue}>{defaultAmount} ml</Text>
            </Pressable>
          </View>

          {/* Settings link - minimal */}
          <Pressable style={styles.settingsLink} onPress={handleSettingsPress}>
            <Text style={styles.settingsText}>Einstellungen</Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.04)', // Almost invisible
  },
  panel: {
    backgroundColor: '#FAFBFC', // Soft warm white
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingBottom: Spacing.xxxl,
    ...Shadows.md,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md + 4,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
  },
  optionsContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  optionLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: '#4B5563', // Soft dark gray
  },
  optionValue: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: '#9CA3AF', // Gentle gray
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  settingsLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  settingsText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
  },
});
