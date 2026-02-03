import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Shadows, Defaults } from '../lib/constants';

interface AmountSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAmount: (amount: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AmountButton({
  amount,
  onPress,
  index,
}: {
  amount: number;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 50;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      style={[styles.amountButton, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={styles.amountValue}>{amount}</Text>
      <Text style={styles.amountUnit}>ml</Text>
    </AnimatedPressable>
  );
}

export function AmountSheet({ visible, onClose, onSelectAmount }: AmountSheetProps) {
  const [customAmount, setCustomAmount] = useState('');
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(300);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      sheetTranslateY.value = withSpring(0, { damping: 25, stiffness: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      sheetTranslateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const handleSelectAmount = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectAmount(amount);
    onClose();
  };

  const handleCustomSubmit = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0 && amount <= 2000) {
      handleSelectAmount(amount);
      setCustomAmount('');
    }
  };

  const handleClose = () => {
    setCustomAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Menge wählen</Text>

          {/* Quick amounts */}
          <View style={styles.amountsGrid}>
            {Defaults.amountOptions.map((amount, index) => (
              <AmountButton
                key={amount}
                amount={amount}
                index={index}
                onPress={() => handleSelectAmount(amount)}
              />
            ))}
          </View>

          {/* Custom input */}
          <View style={styles.customContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="Andere Menge"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={handleCustomSubmit}
                maxLength={4}
              />
              <Text style={styles.inputUnit}>ml</Text>
            </View>
            
            {customAmount.length > 0 && (
              <Pressable style={styles.addButton} onPress={handleCustomSubmit}>
                <Text style={styles.addButtonText}>Hinzufügen</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.04)', // Almost invisible
  },
  sheet: {
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
  title: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.title3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  amountsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  amountButton: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Soft gray
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  amountValue: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title2,
    color: '#4B5563', // Soft dark gray
  },
  amountUnit: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  customContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  inputUnit: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.water,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.body,
    color: '#FFFFFF',
  },
});
