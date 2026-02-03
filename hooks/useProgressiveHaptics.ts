import { useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';

/**
 * Progressive haptic feedback hook
 * Creates a "filling" sensation with fast-to-slow haptic pulses
 */
export function useProgressiveHaptics() {
  const isRunning = useRef(false);

  /**
   * Play a progressive haptic sequence that starts fast and slows down
   * Simulates the feeling of water filling a glass
   */
  const playFillHaptic = useCallback(async () => {
    if (isRunning.current) return;
    isRunning.current = true;

    try {
      // Fast start - rapid pulses
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(40);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(50);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Slowing down
      await delay(70);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Gentle finish
      await delay(150);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      isRunning.current = false;
    }
  }, []);

  /**
   * Play a reverse progressive haptic (for removing water)
   * Starts slow, gets faster - like draining
   */
  const playDrainHaptic = useCallback(async () => {
    if (isRunning.current) return;
    isRunning.current = true;

    try {
      // Slow start
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(120);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Speeding up
      await delay(80);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(50);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      isRunning.current = false;
    }
  }, []);

  /**
   * Simple tap feedback
   */
  const playTapHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  /**
   * Goal reached celebration haptic
   */
  const playGoalReachedHaptic = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await delay(200);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return {
    playFillHaptic,
    playDrainHaptic,
    playTapHaptic,
    playGoalReachedHaptic,
  };
}

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
