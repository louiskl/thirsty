import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius, Shadows, Timing } from '../lib/constants';
import { GlassStyle } from '../types';

interface QuickPanelProps {
  visible: boolean;
  onClose: () => void;
  dailyGoal: number;
  defaultAmount: number;
  glassStyle: GlassStyle;
  onGoalPress: () => void;
  onAmountPress: () => void;
  onGlassStyleChange: (style: GlassStyle) => void;
}

// Glass style options with labels
const GLASS_STYLES: { id: GlassStyle; label: string }[] = [
  { id: 'classic', label: 'Klassisch' },
  { id: 'round', label: 'Rund' },
  { id: 'slim', label: 'Schlank' },
  { id: 'wine', label: 'Wein' },
  { id: 'beer', label: 'Krug' },
];

// Mini glass preview paths
function getGlassPreviewPath(style: GlassStyle, size: number): string {
  const padding = 2;
  const top = padding;
  const bottom = size - padding;
  const centerX = size / 2;
  
  switch (style) {
    case 'round': {
      const topW = size * 0.5;
      const midW = size * 0.7;
      const bottomW = size * 0.45;
      const midY = top + (bottom - top) * 0.4;
      return `M ${centerX - topW/2} ${top} Q ${centerX - midW/2 - 2} ${midY - 5} ${centerX - midW/2} ${midY} Q ${centerX - midW/2 + 2} ${bottom - 8} ${centerX - bottomW/2} ${bottom} L ${centerX + bottomW/2} ${bottom} Q ${centerX + midW/2 - 2} ${bottom - 8} ${centerX + midW/2} ${midY} Q ${centerX + midW/2 + 2} ${midY - 5} ${centerX + topW/2} ${top} Z`;
    }
    case 'slim': {
      const topW = size * 0.35;
      const bottomW = size * 0.3;
      return `M ${centerX - topW/2} ${top} L ${centerX + topW/2} ${top} L ${centerX + bottomW/2} ${bottom} L ${centerX - bottomW/2} ${bottom} Z`;
    }
    case 'wine': {
      const bowlTop = top;
      const bowlBottom = top + (bottom - top) * 0.5;
      const stemBottom = bottom - (bottom - top) * 0.12;
      const bowlW = size * 0.6;
      const stemW = size * 0.08;
      const baseW = size * 0.4;
      return `M ${centerX - bowlW/2} ${bowlTop} Q ${centerX - bowlW/2 - 3} ${bowlBottom - 5} ${centerX - stemW/2} ${bowlBottom} L ${centerX - stemW/2} ${stemBottom} L ${centerX - baseW/2} ${stemBottom + 2} L ${centerX - baseW/2} ${bottom} L ${centerX + baseW/2} ${bottom} L ${centerX + baseW/2} ${stemBottom + 2} L ${centerX + stemW/2} ${stemBottom} L ${centerX + stemW/2} ${bowlBottom} Q ${centerX + bowlW/2 + 3} ${bowlBottom - 5} ${centerX + bowlW/2} ${bowlTop} Z`;
    }
    case 'beer': {
      const topW = size * 0.55;
      const bottomW = size * 0.5;
      return `M ${centerX - topW/2} ${top} L ${centerX + topW/2} ${top} L ${centerX + bottomW/2} ${bottom} L ${centerX - bottomW/2} ${bottom} Z`;
    }
    case 'classic':
    default: {
      const topW = size * 0.6;
      const bottomW = size * 0.45;
      return `M ${centerX - topW/2} ${top} L ${centerX + topW/2} ${top} L ${centerX + bottomW/2} ${bottom} L ${centerX - bottomW/2} ${bottom} Z`;
    }
  }
}

const PANEL_HEIGHT = 380;
const DRAG_THRESHOLD = 80;

export function QuickPanel({
  visible,
  onClose,
  dailyGoal,
  defaultAmount,
  glassStyle,
  onGoalPress,
  onAmountPress,
  onGlassStyleChange,
}: QuickPanelProps) {
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  
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
    return (ml / 1000).toFixed(1);
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

  const handleGlassStyleSelect = (style: GlassStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onGlassStyleChange(style);
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

            <View style={styles.separator} />

            {/* Glass style selector */}
            <View style={styles.glassStyleSection}>
              <Text style={styles.optionLabel}>Glas-Design</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.glassStyleScroll}
              >
                {GLASS_STYLES.map((style) => (
                  <Pressable
                    key={style.id}
                    style={[
                      styles.glassStyleOption,
                      glassStyle === style.id && styles.glassStyleOptionSelected,
                    ]}
                    onPress={() => handleGlassStyleSelect(style.id)}
                  >
                    <Svg width={32} height={40} viewBox="0 0 32 40">
                      <Path
                        d={getGlassPreviewPath(style.id, 32)}
                        stroke={glassStyle === style.id ? '#7DD3FC' : Colors.textTertiary}
                        strokeWidth={1.5}
                        fill={glassStyle === style.id ? '#E0F2FE' : 'transparent'}
                        opacity={glassStyle === style.id ? 1 : 0.6}
                      />
                    </Svg>
                    <Text style={[
                      styles.glassStyleLabel,
                      glassStyle === style.id && styles.glassStyleLabelSelected,
                    ]}>
                      {style.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
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
  glassStyleSection: {
    paddingVertical: Spacing.lg,
  },
  glassStyleScroll: {
    flexDirection: 'row',
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  glassStyleOption: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 60,
  },
  glassStyleOptionSelected: {
    backgroundColor: 'rgba(186, 230, 253, 0.2)',
  },
  glassStyleLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  glassStyleLabelSelected: {
    color: '#7DD3FC',
    fontFamily: Typography.fonts.medium,
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
