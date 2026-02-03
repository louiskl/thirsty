import { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Shadows, Timing } from '../lib/constants';

interface GoalReachedModalProps {
  visible: boolean;
  onClose: () => void;
}

export function GoalReachedModal({ visible, onClose }: GoalReachedModalProps) {
  const backdropOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.96);
  const contentTranslateY = useSharedValue(8);
  const checkScale = useSharedValue(0.8);
  const checkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Single, satisfying haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Elegant backdrop fade
      backdropOpacity.value = withTiming(1, { 
        duration: Timing.normal,
        easing: Easing.out(Easing.ease)
      });
      
      // Content entrance - smooth, no bounce
      contentOpacity.value = withTiming(1, { duration: Timing.normal });
      contentScale.value = withTiming(1, { 
        duration: Timing.slow, 
        easing: Easing.out(Easing.cubic) 
      });
      contentTranslateY.value = withTiming(0, {
        duration: Timing.slow,
        easing: Easing.out(Easing.cubic)
      });
      
      // Checkmark - subtle appearance with gentle pulse
      checkOpacity.value = withDelay(150, withTiming(1, { duration: Timing.fast }));
      checkScale.value = withDelay(150, withSequence(
        withTiming(1.04, { duration: Timing.normal, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: Timing.fast })
      ));
      
      // Text fades in slightly after
      textOpacity.value = withDelay(250, withTiming(1, { duration: Timing.normal }));
    } else {
      // Graceful exit
      backdropOpacity.value = withTiming(0, { duration: Timing.fast });
      contentOpacity.value = withTiming(0, { duration: Timing.fast });
      contentScale.value = withTiming(0.96, { duration: Timing.fast });
      contentTranslateY.value = withTiming(8, { duration: Timing.fast });
      checkScale.value = withTiming(0.8, { duration: Timing.instant });
      checkOpacity.value = withTiming(0, { duration: Timing.instant });
      textOpacity.value = withTiming(0, { duration: Timing.instant });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      { scale: contentScale.value },
      { translateY: contentTranslateY.value },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Elegant light backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Content - minimal, elegant */}
        <Animated.View style={[styles.content, contentStyle]}>
          {/* Refined success checkmark */}
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            <View style={styles.checkCircle}>
              <CheckIcon />
            </View>
          </Animated.View>

          {/* Text with staggered fade */}
          <Animated.View style={textStyle}>
            <Text style={styles.title}>Tagesziel erreicht</Text>
            <Text style={styles.message}>
              Gut gemacht! Du hast heute genug getrunken.
            </Text>
          </Animated.View>

          {/* Minimal button */}
          <Pressable style={styles.button} onPress={handleClose}>
            <Text style={styles.buttonText}>Weiter</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Simple checkmark icon
function CheckIcon() {
  return (
    <View style={styles.checkIcon}>
      <View style={styles.checkLine1} />
      <View style={styles.checkLine2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Soft light backdrop
  },
  content: {
    backgroundColor: '#FAFBFC',
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    ...Shadows.md,
  },
  checkContainer: {
    marginBottom: Spacing.xl,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6EE7B7', // Soft mint green
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 28,
    height: 22,
    position: 'relative',
  },
  checkLine1: {
    position: 'absolute',
    width: 10,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    left: 3,
    top: 13,
  },
  checkLine2: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
    left: 8,
    top: 9,
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.title3,
    color: '#4B5563', // Soft dark gray
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: '#9CA3AF', // Gentle gray
    textAlign: 'center',
    lineHeight: Typography.sizes.body * Typography.lineHeights.relaxed,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: '#6EE7B7', // Soft mint green
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.body,
    color: '#FFFFFF',
  },
});
