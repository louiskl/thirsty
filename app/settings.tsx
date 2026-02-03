import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '../lib/constants';
import { useWaterStore } from '../hooks/useWaterStore';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    setDailyGoal,
    toggleNotifications,
    setNotificationInterval,
    resetToday,
  } = useWaterStore();

  const handleGoalChange = (value: number) => {
    setDailyGoal(Math.round(value / 100) * 100);
  };

  const handleToggleNotifications = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleNotifications(value);
  };

  const handleIntervalSelect = (interval: number) => {
    Haptics.selectionAsync();
    setNotificationInterval(interval);
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetToday();
  };

  const intervalOptions = [
    { label: '30 min', value: 30 },
    { label: '1 h', value: 60 },
    { label: '2 h', value: 120 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.backgroundGradient}
        locations={Colors.backgroundGradientLocations}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Daily Goal */}
        <View style={styles.section}>
          <View style={styles.goalHeader}>
            <View style={styles.goalValueRow}>
              <Text style={styles.goalValue}>
                {(settings.dailyGoal / 1000).toFixed(1).replace('.', ',')}
              </Text>
              <Text style={styles.goalValueUnit}>Liter</Text>
            </View>
            <Text style={styles.goalUnit}>pro Tag</Text>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={1000}
            maximumValue={4000}
            step={100}
            value={settings.dailyGoal}
            onValueChange={handleGoalChange}
            minimumTrackTintColor={Colors.water}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={Colors.water}
          />
          
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1 L</Text>
            <Text style={styles.sliderLabel}>4 L</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Erinnerungen</Text>
              <Text style={styles.rowSubtitle}>
                Regelmäßige Benachrichtigungen
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.water }}
              thumbColor={Colors.background}
              ios_backgroundColor={Colors.border}
            />
          </View>

          {settings.notificationsEnabled && (
            <View style={styles.intervalSection}>
              <Text style={styles.intervalLabel}>Intervall</Text>
              <View style={styles.intervalOptions}>
                {intervalOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.intervalButton,
                      settings.notificationInterval === option.value &&
                        styles.intervalButtonActive,
                    ]}
                    onPress={() => handleIntervalSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.intervalButtonText,
                        settings.notificationInterval === option.value &&
                          styles.intervalButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* History Link */}
        <View style={styles.section}>
          <Pressable 
            style={styles.linkRow}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.linkText}>Verlauf anzeigen</Text>
            <ChevronIcon />
          </Pressable>
        </View>

        {/* Reset */}
        <View style={styles.section}>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Heute zurücksetzen</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.appName}>Thirsty</Text>
          <Text style={styles.version}>Version 1.0</Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Simple chevron icon
function ChevronIcon() {
  return (
    <View style={styles.chevron}>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  goalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalValue: {
    fontFamily: Typography.fonts.light,
    fontSize: Typography.sizes.hero,
    color: Colors.text,
    letterSpacing: Typography.letterSpacing.tighter,
  },
  goalValueUnit: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title2,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  goalUnit: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sliderLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.caption,
    color: Colors.textTertiary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: Colors.text,
  },
  rowSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  intervalSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  intervalLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  intervalOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: Colors.water,
  },
  intervalButtonText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  intervalButtonTextActive: {
    color: '#FFFFFF',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  linkText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: Colors.text,
  },
  chevron: {
    width: 12,
    height: 20,
    justifyContent: 'center',
  },
  chevronLine1: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: Colors.textTertiary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    top: 6,
  },
  chevronLine2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: Colors.textTertiary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
    top: 12,
  },
  resetButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  resetButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: '#EF4444', // Refined red
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  appName: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.body,
    color: Colors.textTertiary,
  },
  version: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
