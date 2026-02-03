import { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
  runOnJS,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  G,
  Rect,
  Ellipse,
  Circle,
} from 'react-native-svg';
import { DeviceMotion } from 'expo-sensors';
import { Colors, Timing, Parallax, Bubbles, GlassDimensions } from '../lib/constants';
import { GlassStyle } from '../types';
import { useProgressiveHaptics } from '../hooks/useProgressiveHaptics';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

interface WaterGlassProps {
  fillPercentage: number;
  onTap: () => void;
  onLongPress: () => void;
  onSwipeDown?: () => void;
  isGoalReached?: boolean;
  glassStyle?: GlassStyle;
}

interface BubbleData {
  id: number;
  x: number; // 0-1 relative position
  size: number; // 0-1 relative size
  speed: number; // seconds for full rise
  delay: number; // initial delay
}

// Generate random bubbles
function generateBubbles(count: number): BubbleData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 0.2 + Math.random() * 0.6, // Keep bubbles in center 60%
    size: Bubbles.sizeRange[0] + Math.random() * (Bubbles.sizeRange[1] - Bubbles.sizeRange[0]),
    speed: Bubbles.speedRange[0] + Math.random() * (Bubbles.speedRange[1] - Bubbles.speedRange[0]),
    delay: Math.random() * 2000,
  }));
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
  const { playFillHaptic, playDrainHaptic, playTapHaptic } = useProgressiveHaptics();

  // Glass dimensions - slimmer, more elegant proportions
  const glassWidth = screenWidth * GlassDimensions.widthRatio;
  const glassHeight = screenHeight * GlassDimensions.heightRatio;
  
  // SVG canvas with extra space for shadow
  const shadowPadding = 30;
  const svgWidth = glassWidth + 40;
  const svgHeight = glassHeight + shadowPadding + 20;
  const padding = 15;

  // Glass shape values
  const glassTop = padding;
  const glassBottom = svgHeight - shadowPadding - padding;
  const glassInnerHeight = glassBottom - glassTop;
  const centerX = svgWidth / 2;

  // Tapered glass dimensions - slimmer, more elegant (wider at top, narrower at bottom)
  const topWidth = glassWidth * GlassDimensions.topWidthRatio;
  const bottomWidth = glassWidth * GlassDimensions.bottomWidthRatio;

  // Animation values
  const waterLevel = useSharedValue(0);
  const waveOffset = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const prevFillPercentage = useSharedValue(fillPercentage);
  
  // Parallax values
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  // Bubbles
  const [bubbles] = useState(() => generateBubbles(Bubbles.count));
  const bubbleAnimations = bubbles.map(() => useSharedValue(0));

  // Setup parallax with device motion
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupMotion = async () => {
      const { status } = await DeviceMotion.requestPermissionsAsync();
      if (status === 'granted') {
        DeviceMotion.setUpdateInterval(Parallax.updateInterval);
        subscription = DeviceMotion.addListener((data) => {
          if (data.rotation) {
            // Smooth the values
            tiltX.value = withTiming(
              data.rotation.gamma * Parallax.waterOffset,
              { duration: 100 }
            );
            tiltY.value = withTiming(
              data.rotation.beta * Parallax.waterOffset,
              { duration: 100 }
            );
          }
        });
      }
    };

    setupMotion();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Start bubble animations
  useEffect(() => {
    bubbleAnimations.forEach((anim, index) => {
      const bubble = bubbles[index];
      anim.value = withDelay(
        bubble.delay,
        withRepeat(
          withTiming(1, { 
            duration: bubble.speed * 1000, 
            easing: Easing.linear 
          }),
          -1,
          false
        )
      );
    });
  }, []);

  // Water level animation with progressive haptics
  useEffect(() => {
    const isAdding = fillPercentage > prevFillPercentage.value;
    const isRemoving = fillPercentage < prevFillPercentage.value;
    prevFillPercentage.value = fillPercentage;

    // Play appropriate haptic
    if (isAdding) {
      playFillHaptic();
    } else if (isRemoving) {
      playDrainHaptic();
    }

    // Animate water level with spring physics
    const targetLevel = Math.min(fillPercentage / 100, 1);
    
    // Slight overshoot then settle (like real liquid)
    waterLevel.value = withSequence(
      withTiming(targetLevel * 1.015, { 
        duration: 250, 
        easing: Easing.out(Easing.quad) 
      }),
      withSpring(targetLevel, Timing.spring.waterFill)
    );
  }, [fillPercentage]);

  // Continuous wave animation
  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Glass path (tapered tumbler shape with soft rounded corners)
  const glassPath = useMemo(() => {
    const cornerRadius = GlassDimensions.cornerRadius;
    const left = centerX - topWidth / 2;
    const right = centerX + topWidth / 2;
    const bottomLeft = centerX - bottomWidth / 2;
    const bottomRight = centerX + bottomWidth / 2;

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
  }, [centerX, topWidth, bottomWidth, glassTop, glassBottom]);

  // Inner glass path (for depth effect)
  const innerGlassPath = useMemo(() => {
    const inset = 3;
    const cornerRadius = GlassDimensions.cornerRadius - 2;
    const left = centerX - topWidth / 2 + inset;
    const right = centerX + topWidth / 2 - inset;
    const bottomLeft = centerX - bottomWidth / 2 + inset;
    const bottomRight = centerX + bottomWidth / 2 - inset;
    const top = glassTop + inset;
    const bottom = glassBottom - inset;

    return `
      M ${left + cornerRadius} ${top}
      L ${right - cornerRadius} ${top}
      Q ${right} ${top} ${right} ${top + cornerRadius}
      L ${bottomRight} ${bottom - cornerRadius}
      Q ${bottomRight} ${bottom} ${bottomRight - cornerRadius} ${bottom}
      L ${bottomLeft + cornerRadius} ${bottom}
      Q ${bottomLeft} ${bottom} ${bottomLeft} ${bottom - cornerRadius}
      L ${left} ${top + cornerRadius}
      Q ${left} ${top} ${left + cornerRadius} ${top}
      Z
    `;
  }, [centerX, topWidth, bottomWidth, glassTop, glassBottom]);

  // Water rectangle animation with parallax
  const waterHeight = glassInnerHeight - 8;
  const animatedWaterProps = useAnimatedProps(() => {
    const currentHeight = waterHeight * waterLevel.value;
    const yPos = glassBottom - currentHeight - 4;
    return {
      y: yPos,
      height: Math.max(currentHeight, 0),
      x: -5 + tiltX.value, // Parallax offset
    };
  });

  // Wave path animation
  const animatedWaveProps = useAnimatedProps(() => {
    const currentHeight = waterHeight * waterLevel.value;
    const waveY = glassBottom - currentHeight - 4;
    const phase = waveOffset.value * Math.PI * 2;
    const amplitude = 2 + waterLevel.value * 1.5;
    
    const waveWidth = topWidth + 20;
    const startX = (svgWidth - waveWidth) / 2 + tiltX.value;
    
    let path = `M ${startX} ${waveY}`;
    for (let x = 0; x <= waveWidth; x += 3) {
      const y = waveY + Math.sin((x / waveWidth) * Math.PI * 3 + phase) * amplitude;
      path += ` L ${startX + x} ${y}`;
    }
    path += ` L ${startX + waveWidth} ${svgHeight + 10}`;
    path += ` L ${startX} ${svgHeight + 10} Z`;
    
    return { d: path };
  });

  // Bubble animated props - more subtle and elegant
  const createBubbleProps = (index: number) => {
    const bubble = bubbles[index];
    const anim = bubbleAnimations[index];
    
    return useAnimatedProps(() => {
      const progress = anim.value;
      const waterTop = glassBottom - waterHeight * waterLevel.value;
      const startY = glassBottom - 12;
      const endY = waterTop + 8;
      
      // Bubble rises from bottom of water to top - smoother curve
      const y = interpolate(progress, [0, 1], [startY, endY]);
      
      // Horizontal wobble - gentler movement
      const wobble = Math.sin(progress * Math.PI * 3) * (topWidth * Bubbles.wobbleAmplitude);
      const baseX = centerX - topWidth * 0.25 + bubble.x * topWidth * 0.5;
      const x = baseX + wobble + tiltX.value * 1.2;
      
      // Fade in at start and out near top - more subtle
      let opacity = 0.45;
      if (progress < 0.15) {
        opacity = interpolate(progress, [0, 0.15], [0, 0.45]);
      } else if (progress > 0.75) {
        opacity = interpolate(progress, [0.75, 1], [0.45, 0]);
      }
      
      // Only show if water level is high enough
      const visible = waterLevel.value > 0.12 && y > waterTop;
      
      return {
        cx: x,
        cy: y,
        r: visible ? bubble.size * topWidth : 0,
        opacity: visible ? opacity : 0,
      };
    });
  };

  // Tap animation
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  const handlePressIn = () => {
    tapScale.value = withTiming(0.97, { duration: Timing.instant });
  };

  const handlePressOut = () => {
    tapScale.value = withSpring(1, Timing.spring.responsive);
  };

  const handleTap = () => {
    playTapHaptic();
    onTap();
  };

  const handleLongPress = () => {
    playTapHaptic();
    onLongPress();
  };

  const handleSwipeDown = () => {
    if (onSwipeDown) {
      playTapHaptic();
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
      if (event.velocityY > 500 && event.translationY > 50) {
        runOnJS(handleSwipeDown)();
      }
    });

  const composedGesture = Gesture.Race(
    swipeDownGesture,
    Gesture.Exclusive(longPressGesture, tapGesture)
  );

  // Colors based on goal status - turquoise theme
  const waterColors = isGoalReached 
    ? { light: '#D1FAE5', mid: '#6EE7B7', dark: '#34D399', deep: '#10B981' }
    : { light: '#CCFBF1', mid: '#5EEAD4', dark: '#2DD4BF', deep: '#14B8A6' };

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Svg 
          width={svgWidth} 
          height={svgHeight} 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <Defs>
            {/* Water gradient - turquoise with depth */}
            <LinearGradient id="waterFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={waterColors.light} stopOpacity="0.85" />
              <Stop offset="30%" stopColor={waterColors.mid} stopOpacity="0.88" />
              <Stop offset="65%" stopColor={waterColors.dark} stopOpacity="0.92" />
              <Stop offset="100%" stopColor={waterColors.deep} stopOpacity="0.95" />
            </LinearGradient>

            {/* Glass highlight gradient (top rim) - more elegant */}
            <LinearGradient id="glassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>

            {/* Side reflection gradient - softer, more diffused */}
            <LinearGradient id="sideReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>

            {/* Glass body gradient - subtle transparency */}
            <LinearGradient id="glassBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
            </LinearGradient>

            {/* Shadow gradient - softer, more natural */}
            <RadialGradient id="shadowGradient" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#94A3B8" stopOpacity="0.18" />
              <Stop offset="60%" stopColor="#94A3B8" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
            </RadialGradient>

            {/* Clip path for water */}
            <ClipPath id="glassClip">
              <Path d={innerGlassPath} />
            </ClipPath>

            {/* Bubble gradient - more transparent */}
            <RadialGradient id="bubbleGradient" cx="30%" cy="30%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </RadialGradient>

            {/* Inner highlight for glass depth */}
            <LinearGradient id="innerHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Shadow under glass */}
          <Ellipse
            cx={centerX}
            cy={glassBottom + shadowPadding / 2 + 5}
            rx={bottomWidth * 0.6}
            ry={8}
            fill="url(#shadowGradient)"
          />

          {/* Glass body - outer stroke */}
          <Path
            d={glassPath}
            stroke={Colors.glassStroke}
            strokeWidth={GlassDimensions.strokeWidth}
            fill="url(#glassBodyGradient)"
          />

          {/* Glass inner stroke for depth */}
          <Path
            d={innerGlassPath}
            stroke={Colors.glassStrokeLight}
            strokeWidth={0.75}
            fill="url(#innerHighlight)"
            opacity={0.6}
          />

          {/* Water fill */}
          <G clipPath="url(#glassClip)">
            <AnimatedRect
              width={svgWidth + 10}
              fill="url(#waterFill)"
              animatedProps={animatedWaterProps}
            />
            
            {/* Wave surface */}
            <AnimatedPath
              fill={waterColors.light}
              opacity={0.6}
              animatedProps={animatedWaveProps}
            />

            {/* Bubbles */}
            {bubbles.map((_, index) => (
              <AnimatedCircle
                key={index}
                fill="url(#bubbleGradient)"
                animatedProps={createBubbleProps(index)}
              />
            ))}
          </G>

          {/* Glass highlight - top rim (elegant, prominent) */}
          <Path
            d={`
              M ${centerX - topWidth / 2 + 12} ${glassTop + 1.5}
              L ${centerX + topWidth / 2 - 12} ${glassTop + 1.5}
            `}
            stroke="url(#glassHighlight)"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />

          {/* Side reflection - left (main highlight) */}
          <Path
            d={`
              M ${centerX - topWidth / 2 + 6} ${glassTop + 18}
              L ${centerX - bottomWidth / 2 + 5} ${glassBottom - 18}
            `}
            stroke={Colors.glassReflection}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />

          {/* Side reflection - left secondary (subtle) */}
          <Path
            d={`
              M ${centerX - topWidth / 2 + 12} ${glassTop + 22}
              L ${centerX - bottomWidth / 2 + 10} ${glassBottom - 22}
            `}
            stroke={Colors.glassReflection}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.25}
          />

          {/* Side reflection - right (very subtle) */}
          <Path
            d={`
              M ${centerX + topWidth / 2 - 10} ${glassTop + 30}
              L ${centerX + bottomWidth / 2 - 8} ${glassBottom - 30}
            `}
            stroke={Colors.glassReflection}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.2}
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
