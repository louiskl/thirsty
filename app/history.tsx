import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../lib/constants';
import { useWaterStore } from '../hooks/useWaterStore';

export default function HistoryScreen() {
  const { history, todayRecord, settings } = useWaterStore();

  // Combine today with history
  const allRecords = [todayRecord, ...history].slice(0, 7);

  // Calculate stats
  const totalConsumed = allRecords.reduce((sum, r) => sum + r.consumed, 0);
  const average = allRecords.length > 0 ? totalConsumed / allRecords.length : 0;
  const daysReached = allRecords.filter((r) => r.consumed >= r.goal).length;

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
        {/* Stats */}
        <Animated.View 
          style={styles.statsContainer}
          entering={FadeInDown.duration(400)}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {(average / 1000).toFixed(1)}
            </Text>
            <Text style={styles.statUnit}>L</Text>
            <Text style={styles.statLabel}>Durchschnitt</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daysReached}</Text>
            <Text style={styles.statUnit}>/{allRecords.length}</Text>
            <Text style={styles.statLabel}>Ziele erreicht</Text>
          </View>
        </Animated.View>

        {/* Week Chart */}
        <Animated.View 
          style={styles.chartSection}
          entering={FadeInDown.delay(100).duration(400)}
        >
          <View style={styles.chartContainer}>
            {allRecords.slice().reverse().map((record, index) => {
              const percentage = Math.min(
                (record.consumed / settings.dailyGoal) * 100,
                100
              );
              const isToday = index === allRecords.length - 1;
              const reached = record.consumed >= record.goal;

              return (
                <View key={record.date} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${percentage}%` },
                        reached && styles.barReached,
                        isToday && styles.barToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                    {isToday ? 'Heute' : format(parseISO(record.date), 'EEE', { locale: de })}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Goal line indicator */}
          <View style={styles.goalLineContainer}>
            <View style={styles.goalLine} />
            <Text style={styles.goalLineLabel}>Ziel</Text>
          </View>
        </Animated.View>

        {/* Daily List */}
        <View style={styles.listSection}>
          {allRecords.map((record, index) => {
            const isToday = index === 0;
            const date = parseISO(record.date);
            const percentage = Math.round(
              (record.consumed / record.goal) * 100
            );
            const reached = record.consumed >= record.goal;

            return (
              <Animated.View
                key={record.date}
                style={styles.listItem}
                entering={FadeInDown.delay(150 + index * 50).duration(300)}
              >
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemDay}>
                    {isToday ? 'Heute' : format(date, 'EEEE', { locale: de })}
                  </Text>
                  <Text style={styles.listItemDate}>
                    {format(date, 'd. MMMM', { locale: de })}
                  </Text>
                </View>
                
                <View style={styles.listItemRight}>
                  <Text
                    style={[
                      styles.listItemValue,
                      reached && styles.listItemValueReached,
                    ]}
                  >
                    {(record.consumed / 1000).toFixed(1)} L
                  </Text>
                  <Text style={styles.listItemPercentage}>{percentage}%</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
        </ScrollView>
      </SafeAreaView>
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
    paddingBottom: Spacing.xxxl,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.fonts.light,
    fontSize: Typography.sizes.largeTitle,
    color: Colors.text,
  },
  statUnit: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title3,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  statLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xl,
  },
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.water,
    borderRadius: Radius.sm,
    minHeight: 4,
  },
  barReached: {
    backgroundColor: Colors.success,
  },
  barToday: {
    backgroundColor: Colors.water,
  },
  barLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.tiny,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  barLabelToday: {
    fontFamily: Typography.fonts.semibold,
    color: Colors.text,
  },
  goalLineContainer: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.textTertiary,
    opacity: 0.3,
  },
  goalLineLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.tiny,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  listSection: {
    paddingHorizontal: Spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemDay: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.body,
    color: Colors.text,
  },
  listItemDate: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  listItemValue: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.body,
    color: Colors.text,
  },
  listItemValueReached: {
    color: Colors.success,
  },
  listItemPercentage: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
