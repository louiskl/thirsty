import { useState, useRef } from 'react';
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
  FadeIn,
  FadeOut,
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
    setGlassStyle,
    isLoading,
  } = useWaterStore();

  const [showAmountSheet, setShowAmountSheet] = useState(false);
  const [showQuickPanel, setShowQuickPanel] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [feedbackAmount, setFeedbackAmount] = useState<number | null>(null);
  const isFirstTap = useRef(true);

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
    // Hide hint after first tap
    if (isFirstTap.current) {
      isFirstTap.current = false;
      setShowHint(false);
    }
    
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

  // Format liters nicely
  const formatLiters = (ml: number) => {
    const liters = ml / 1000;
    if (liters >= 1) {
      return liters.toFixed(1);
    }
    return liters.toFixed(2);
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
              glassStyle={settings.glassStyle}
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

          {/* Hint - only show initially, subtle */}
          {showHint && (
            <Animated.View 
              entering={FadeIn.delay(600).duration(500)}
              exiting={FadeOut.duration(400)}
              style={styles.hintContainer}
            >
              <Text style={styles.hintText}>
                Tippe auf das Glas
              </Text>
              <Text style={styles.hintSubtext}>
                um {Defaults.tapAmount} ml hinzuzufügen
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Swipe-up indicator - gentle chevron at bottom, tappable */}
        <GestureDetector gesture={swipeUpGesture}>
          <View style={styles.swipeArea}>
            <Pressable onPress={openQuickPanel} hitSlop={20}>
              <SwipeUpIndicator />
            </Pressable>
          </View>
        </GestureDetector>
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
        glassStyle={settings.glassStyle}
        onGoalPress={() => router.push('/settings')}
        onAmountPress={() => setShowAmountSheet(true)}
        onGlassStyleChange={setGlassStyle}
      />
    </View>
  );
}

// Swipe-up indicator - gentle chevron pointing up
function SwipeUpIndicator() {
  return (
    <View style={styles.chevronContainer}>
      <View style={styles.chevronLine1} />
      <View style={styles.chevronLine2} />
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
  hintContainer: {
    position: 'absolute',
    bottom: Spacing.xxxl,
    alignItems: 'center',
  },
  hintText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
  },
  hintSubtext: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  swipeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.lg,
  },
  chevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronLine1: {
    width: 14,
    height: 2,
    backgroundColor: Colors.textTertiary,
    borderRadius: 1,
    transform: [{ rotate: '-40deg' }],
  },
  chevronLine2: {
    width: 14,
    height: 2,
    backgroundColor: Colors.textTertiary,
    borderRadius: 1,
    transform: [{ rotate: '40deg' }],
    marginLeft: -5,
  },
});
