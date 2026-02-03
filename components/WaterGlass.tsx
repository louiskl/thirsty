import { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  G,
  Rect,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors, Timing } from '../lib/constants';
import { GlassStyle } from '../types';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaterGlassProps {
  fillPercentage: number;
  onTap: () => void;
  onLongPress: () => void;
  onSwipeDown?: () => void;
  isGoalReached?: boolean;
  glassStyle?: GlassStyle;
}

// Glass path generators for different styles
function createGlassPath(
  style: GlassStyle,
  svgWidth: number,
  svgHeight: number,
  padding: number
): string {
  const glassTop = padding;
  const glassBottom = svgHeight - padding;
  const height = glassBottom - glassTop;
  const centerX = svgWidth / 2;

  switch (style) {
    case 'round': {
      // Rounded, bulbous glass
      const topWidth = svgWidth * 0.55;
      const middleWidth = svgWidth * 0.75;
      const bottomWidth = svgWidth * 0.5;
      const midY = glassTop + height * 0.4;
      return `
        M ${centerX - topWidth/2 + 4} ${glassTop}
        Q ${centerX - topWidth/2} ${glassTop} ${centerX - topWidth/2} ${glassTop + 4}
        Q ${centerX - middleWidth/2 - 10} ${midY - 20} ${centerX - middleWidth/2} ${midY}
        Q ${centerX - middleWidth/2 + 5} ${glassBottom - 30} ${centerX - bottomWidth/2} ${glassBottom - 4}
        Q ${centerX - bottomWidth/2} ${glassBottom} ${centerX - bottomWidth/2 + 4} ${glassBottom}
        L ${centerX + bottomWidth/2 - 4} ${glassBottom}
        Q ${centerX + bottomWidth/2} ${glassBottom} ${centerX + bottomWidth/2} ${glassBottom - 4}
        Q ${centerX + middleWidth/2 - 5} ${glassBottom - 30} ${centerX + middleWidth/2} ${midY}
        Q ${centerX + middleWidth/2 + 10} ${midY - 20} ${centerX + topWidth/2} ${glassTop + 4}
        Q ${centerX + topWidth/2} ${glassTop} ${centerX + topWidth/2 - 4} ${glassTop}
        Z
      `;
    }
    case 'slim': {
      // Tall, slim glass
      const topWidth = svgWidth * 0.4;
      const bottomWidth = svgWidth * 0.35;
      const cornerRadius = 3;
      const left = centerX - topWidth/2;
      const right = centerX + topWidth/2;
      const bottomLeft = centerX - bottomWidth/2;
      const bottomRight = centerX + bottomWidth/2;
      return `
        M ${left + cornerRadius} ${glassTop}
        L ${right - cornerRadius} ${glassTop}
        Q ${right} ${glassTop} ${right} ${glassTop + cornerRadius}
        L ${bottomRight} ${glassBottom - cornerRadius}
        Q ${bottomRight} ${glassBottom} ${bottomRight - cornerRadius} ${glassBottom}
        L ${bottomLeft + cornerRadius} ${glassBottom}
        Q ${bottomLeft} ${glassBottom} ${bottomLeft} ${glassBottom - cornerRadius}
        L ${left} ${glassTop + cornerRadius}
        Q ${left} ${glassTop} ${left + cornerRadius} ${glassTop}
        Z
      `;
    }
    case 'wine': {
      // Wine glass with stem
      const bowlTop = glassTop;
      const bowlBottom = glassTop + height * 0.55;
      const stemTop = bowlBottom;
      const stemBottom = glassBottom - height * 0.12;
      const baseTop = stemBottom;
      const baseBottom = glassBottom;
      const bowlTopWidth = svgWidth * 0.5;
      const bowlMaxWidth = svgWidth * 0.65;
      const stemWidth = svgWidth * 0.06;
      const baseWidth = svgWidth * 0.4;
      const bowlMidY = bowlTop + (bowlBottom - bowlTop) * 0.5;
      return `
        M ${centerX - bowlTopWidth/2 + 4} ${bowlTop}
        Q ${centerX - bowlTopWidth/2} ${bowlTop} ${centerX - bowlTopWidth/2} ${bowlTop + 4}
        Q ${centerX - bowlMaxWidth/2 - 5} ${bowlMidY - 15} ${centerX - bowlMaxWidth/2} ${bowlMidY}
        Q ${centerX - bowlMaxWidth/2 + 10} ${bowlBottom - 10} ${centerX - stemWidth/2} ${bowlBottom}
        L ${centerX - stemWidth/2} ${stemBottom}
        Q ${centerX - baseWidth/2 - 5} ${stemBottom + 5} ${centerX - baseWidth/2} ${baseTop + 8}
        L ${centerX - baseWidth/2} ${baseBottom - 3}
        Q ${centerX - baseWidth/2} ${baseBottom} ${centerX - baseWidth/2 + 3} ${baseBottom}
        L ${centerX + baseWidth/2 - 3} ${baseBottom}
        Q ${centerX + baseWidth/2} ${baseBottom} ${centerX + baseWidth/2} ${baseBottom - 3}
        L ${centerX + baseWidth/2} ${baseTop + 8}
        Q ${centerX + baseWidth/2 + 5} ${stemBottom + 5} ${centerX + stemWidth/2} ${stemBottom}
        L ${centerX + stemWidth/2} ${bowlBottom}
        Q ${centerX + bowlMaxWidth/2 - 10} ${bowlBottom - 10} ${centerX + bowlMaxWidth/2} ${bowlMidY}
        Q ${centerX + bowlMaxWidth/2 + 5} ${bowlMidY - 15} ${centerX + bowlTopWidth/2} ${bowlTop + 4}
        Q ${centerX + bowlTopWidth/2} ${bowlTop} ${centerX + bowlTopWidth/2 - 4} ${bowlTop}
        Z
      `;
    }
    case 'beer': {
      // Beer mug with handle
      const topWidth = svgWidth * 0.55;
      const bottomWidth = svgWidth * 0.5;
      const cornerRadius = 6;
      const left = centerX - topWidth/2;
      const right = centerX + topWidth/2;
      const bottomLeftX = centerX - bottomWidth/2;
      const bottomRightX = centerX + bottomWidth/2;
      // Main body
      return `
        M ${left + cornerRadius} ${glassTop}
        L ${right - cornerRadius} ${glassTop}
        Q ${right} ${glassTop} ${right} ${glassTop + cornerRadius}
        L ${bottomRightX} ${glassBottom - cornerRadius}
        Q ${bottomRightX} ${glassBottom} ${bottomRightX - cornerRadius} ${glassBottom}
        L ${bottomLeftX + cornerRadius} ${glassBottom}
        Q ${bottomLeftX} ${glassBottom} ${bottomLeftX} ${glassBottom - cornerRadius}
        L ${left} ${glassTop + cornerRadius}
        Q ${left} ${glassTop} ${left + cornerRadius} ${glassTop}
        Z
      `;
    }
    case 'classic':
    default: {
      // Original tapered tumbler
      const topWidth = svgWidth * 0.75;
      const bottomWidth = topWidth * 0.75;
      const cornerRadius = 4;
      const left = centerX - topWidth/2;
      const right = centerX + topWidth/2;
      const bottomLeftX = centerX - bottomWidth/2;
      const bottomRightX = centerX + bottomWidth/2;
      return `
        M ${left + cornerRadius} ${glassTop}
        L ${right - cornerRadius} ${glassTop}
        Q ${right} ${glassTop} ${right} ${glassTop + cornerRadius}
        L ${bottomRightX} ${glassBottom - cornerRadius}
        Q ${bottomRightX} ${glassBottom} ${bottomRightX - cornerRadius} ${glassBottom}
        L ${bottomLeftX + cornerRadius} ${glassBottom}
        Q ${bottomLeftX} ${glassBottom} ${bottomLeftX} ${glassBottom - cornerRadius}
        L ${left} ${glassTop + cornerRadius}
        Q ${left} ${glassTop} ${left + cornerRadius} ${glassTop}
        Z
      `;
    }
  }
}

export function WaterGlass({
  fillPercentage,
  onTap,
  onLongPress,
  onSwipeDown,
  isGoalReached = false,
  glassStyle = 'classic',
}: WaterGlassProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Glass dimensions - more elegant proportions
  const glassWidth = screenWidth * 0.38;
  const glassHeight = screenHeight * 0.32;
  
  // SVG canvas
  const svgWidth = glassWidth + 20;
  const svgHeight = glassHeight + 20;
  const padding = 10;

  // Glass shape values for water calculations
  const glassTop = padding;
  const glassBottom = svgHeight - padding;
  const topWidth = glassWidth;

  // Create glass path based on style
  const glassPath = useMemo(() => {
    return createGlassPath(glassStyle, svgWidth, svgHeight, padding);
  }, [glassStyle, svgWidth, svgHeight, padding]);

  // Animation values
  const waterLevel = useSharedValue(0);
  const waveOffset = useSharedValue(0);
  const tapScale = useSharedValue(1);

  // Smooth water level animation - gentle and fluid
  useEffect(() => {
    waterLevel.value = withTiming(Math.min(fillPercentage / 100, 1), {
      duration: Timing.gentle,
      easing: Easing.out(Easing.cubic),
    });
  }, [fillPercentage]);

  // Very subtle continuous wave animation - slower, calmer
  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Water rectangle animation
  const waterHeight = glassHeight - 8;
  const animatedWaterProps = useAnimatedProps(() => {
    const currentHeight = waterHeight * waterLevel.value;
    const yPos = glassBottom - currentHeight - 4;
    return {
      y: yPos,
      height: Math.max(currentHeight, 0),
    };
  });

  // Wave path animation - whisper-soft movement
  const animatedWaveProps = useAnimatedProps(() => {
    const currentHeight = waterHeight * waterLevel.value;
    const waveY = glassBottom - currentHeight - 4;
    const phase = waveOffset.value * Math.PI * 2;
    // Even more subtle waves - barely perceptible, elegant
    const amplitude = 1.5 + waterLevel.value * 0.5;
    
    const waveWidth = topWidth + 10;
    const startX = (svgWidth - waveWidth) / 2;
    
    let path = `M ${startX} ${waveY}`;
    for (let x = 0; x <= waveWidth; x += 4) {
      const y = waveY + Math.sin((x / waveWidth) * Math.PI * 2.5 + phase) * amplitude;
      path += ` L ${startX + x} ${y}`;
    }
    path += ` L ${startX + waveWidth} ${svgHeight + 10}`;
    path += ` L ${startX} ${svgHeight + 10} Z`;
    
    return { d: path };
  });

  // Tap animation - refined, responsive
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  const handlePressIn = () => {
    tapScale.value = withTiming(0.98, { duration: Timing.instant });
  };

  const handlePressOut = () => {
    tapScale.value = withSpring(1, Timing.spring.responsive);
  };

  const handleTap = () => {
    // Soft, satisfying tap feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTap();
  };

  const handleLongPress = () => {
    // Slightly stronger for intentional action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };

  const handleSwipeDown = () => {
    if (onSwipeDown) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSwipeDown();
    }
  };

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      runOnJS(handlePressIn)();
    })
    .onEnd(() => {
      runOnJS(handleTap)();
    })
    .onFinalize(() => {
      runOnJS(handlePressOut)();
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(400)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const swipeDownGesture = Gesture.Pan()
    .onEnd((event) => {
      // Swipe down detected (positive Y velocity, traveled downward)
      if (event.velocityY > 500 && event.translationY > 50) {
        runOnJS(handleSwipeDown)();
      }
    });

  // Combine all gestures - swipe takes priority, then tap/long press
  const composedGesture = Gesture.Race(
    swipeDownGesture,
    Gesture.Exclusive(longPressGesture, tapGesture)
  );

  // Colors based on goal status - ultra-soft pastel palette
  const waterColor = isGoalReached ? '#A7F3D0' : '#BAE6FD';       // Soft pastels
  const waterColorLight = isGoalReached ? '#D1FAE5' : '#E0F2FE';  // Whisper light
  const waterColorDark = isGoalReached ? '#6EE7B7' : '#7DD3FC';   // Still gentle

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Svg 
          width={svgWidth} 
          height={svgHeight} 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <Defs>
            {/* Water gradient - subtle and clean */}
            <LinearGradient id="waterFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={waterColorLight} stopOpacity="0.85" />
              <Stop offset="60%" stopColor={waterColor} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={waterColorDark} stopOpacity="0.95" />
            </LinearGradient>

            {/* Clip path for water */}
            <ClipPath id="glassClip">
              <Path d={glassPath} />
            </ClipPath>
          </Defs>

          {/* Water fill */}
          <G clipPath="url(#glassClip)">
            <AnimatedRect
              x="0"
              width={svgWidth}
              fill="url(#waterFill)"
              animatedProps={animatedWaterProps}
            />
            {/* Wave surface */}
            <AnimatedPath
              fill={waterColorLight}
              opacity={0.5}
              animatedProps={animatedWaveProps}
            />
          </G>

          {/* Glass outline - whisper-thin, barely there */}
          <Path
            d={glassPath}
            stroke={Colors.glassStroke}
            strokeWidth={1.25}
            fill="none"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
