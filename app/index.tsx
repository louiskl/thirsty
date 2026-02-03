import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Defaults, Timing } from '../lib/constants';
import { WaterGlass } from '../components/WaterGlass';
import { AmountSheet } from '../components/AmountSheet';
import { QuickPanel } from '../components/QuickPanel';
import { useWaterStore } from '../hooks/useWaterStore';
import { useNotifications } from '../hooks/useNotifications';

export default function MainScreen() {
  const router = useRouter();
  const {
    todayRecord,
    settings,
    addWater,
    removeWater,
    isLoading,
  } = useWaterStore();

  const [showAmountSheet, setShowAmountSheet] = useState(false);
  const [showQuickPanel, setShowQuickPanel] = useState(false);
  const [feedbackAmount, setFeedbackAmount] = useState<number | null>(null);

  // Setup notifications
  useNotifications({ settings });

  // Calculate progress
  const fillPercentage = Math.min(
    (todayRecord.consumed / settings.dailyGoal) * 100,
    100
  );
  const isGoalReached = todayRecord.consumed >= settings.dailyGoal;

  // Refined feedback animation - smooth, purposeful
  const feedbackOpacity = useSharedValue(0);
  const feedbackTranslateY = useSharedValue(0);
  const feedbackScale = useSharedValue(0.9);

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [
      { translateY: feedbackTranslateY.value },
      { scale: feedbackScale.value },
    ],
  }));

  const showFeedback = (amount: number) => {
    setFeedbackAmount(amount);
    // Whisper-soft appearance - very understated
    feedbackOpacity.value = withSequence(
      withTiming(0.5, { duration: Timing.normal, easing: Easing.out(Easing.ease) }),
      withDelay(800, withTiming(0, { duration: Timing.slow }))
    );
    // Gentle float upward - minimal movement
    feedbackTranslateY.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(-12, { duration: 1800, easing: Easing.out(Easing.quad) })
    );
    // No scale animation - keep it static and elegant
    feedbackScale.value = 1;
  };

  const handleTap = () => {
    addWater(Defaults.tapAmount);
    showFeedback(Defaults.tapAmount);
  };

  const handleLongPress = () => {
    setShowAmountSheet(true);
  };

  const handleSelectAmount = (amount: number) => {
    addWater(amount);
    showFeedback(amount);
  };

  // Handle swipe down on glass to remove water
  const handleSwipeDown = () => {
    if (todayRecord.consumed > 0) {
      removeWater(Defaults.tapAmount);
      showFeedback(-Defaults.tapAmount);
    }
  };

  // Open QuickPanel handler
  const openQuickPanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowQuickPanel(true);
  };

  // Swipe-up gesture to open QuickPanel - works from anywhere on screen
  const swipeUpGesture = Gesture.Pan()
    .onEnd((event) => {
      // Swipe up detected (negative Y velocity, traveled upward)
      if (event.velocityY < -500 && event.translationY < -50) {
        runOnJS(openQuickPanel)();
      }
    });

  // Format liters nicely - German style with comma
  const formatLiters = (ml: number) => {
    const liters = ml / 1000;
    return liters.toFixed(2).replace('.', ',');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={Colors.backgroundGradient}
          locations={Colors.backgroundGradientLocations}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium gradient background */}
      <LinearGradient
        colors={Colors.backgroundGradient}
        locations={Colors.backgroundGradientLocations}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Main Content - Clean, no header */}
        <View style={styles.content}>
          {/* Glass with feedback */}
          <View style={styles.glassContainer}>
            <WaterGlass
              fillPercentage={fillPercentage}
              onTap={handleTap}
              onLongPress={handleLongPress}
              onSwipeDown={handleSwipeDown}
              isGoalReached={isGoalReached}
            />
            
            {/* Refined feedback badge - whisper subtle */}
            <Animated.View style={[styles.feedbackBadge, feedbackStyle]}>
              <Text style={styles.feedbackText}>
                {feedbackAmount !== null && feedbackAmount >= 0 ? '+' : ''}{feedbackAmount} ml
              </Text>
            </Animated.View>
          </View>

          {/* Amount display - Large, confident typography */}
          <View style={styles.amountContainer}>
            <View style={styles.amountRow}>
              <Text style={styles.amountValue}>{formatLiters(todayRecord.consumed)}</Text>
              <Text style={styles.amountUnit}>L</Text>
            </View>
            <Text style={styles.goalText}>
              von {formatLiters(settings.dailyGoal)} L
            </Text>
          </View>

          {/* Plus/Minus Buttons - Pill-shaped, modern design */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.minusButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => {
                if (todayRecord.consumed > 0) {
                  removeWater(Defaults.tapAmount);
                  showFeedback(-Defaults.tapAmount);
                }
              }}
              onLongPress={handleLongPress}
            >
              <Text style={styles.minusIcon}>−</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.plusButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleTap}
              onLongPress={handleLongPress}
            >
              <Text style={styles.plusIcon}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Swipe-up gesture area - invisible, no indicator */}
        <GestureDetector gesture={swipeUpGesture}>
          <View style={styles.swipeArea} />
      </SafeAreaView>

      {/* Amount Sheet */}
      <AmountSheet
        visible={showAmountSheet}
        onClose={() => setShowAmountSheet(false)}
        onSelectAmount={handleSelectAmount}
      />

      {/* Quick Panel - Swipe up */}
      <QuickPanel
        visible={showQuickPanel}
        onClose={() => setShowQuickPanel(false)}
        dailyGoal={settings.dailyGoal}
        defaultAmount={Defaults.tapAmount}
        onGoalPress={() => router.push('/settings')}
        onAmountPress={() => setShowAmountSheet(true)}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.lg,
  },
  glassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Extra space for the glass shadow
    marginBottom: Spacing.md,
  },
  feedbackBadge: {
    position: 'absolute',
    top: '40%',
    // No background - just floating text
  },
  feedbackText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.footnote,
    color: Colors.water,
    letterSpacing: Typography.letterSpacing.wide,
  },
  amountContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountValue: {
    fontFamily: Typography.fonts.light,
    fontSize: Typography.sizes.display,
    color: Colors.text,
    letterSpacing: Typography.letterSpacing.tighter,
    lineHeight: Typography.sizes.display * Typography.lineHeights.tight,
  },
  amountUnit: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title2,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  goalText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    letterSpacing: Typography.letterSpacing.normal,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionButton: {
    width: 72,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  plusButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  minusIcon: {
    fontFamily: Typography.fonts.medium,
    fontSize: 24,
    color: Colors.water,
    lineHeight: 28,
  },
  plusIcon: {
    fontFamily: Typography.fonts.medium,
    fontSize: 24,
    color: Colors.water,
    lineHeight: 28,
  },
  swipeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
});
