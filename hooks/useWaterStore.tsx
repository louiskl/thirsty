import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { NativeModules, Platform, AppState, AppStateStatus } from 'react-native';
import { DailyRecord, UserSettings, WaterEntry } from '../types';
import {
  loadSettings,
  saveSettings,
  loadTodayRecord,
  saveTodayRecord,
  loadHistory,
  getDefaultSettings,
  getDefaultTodayRecord,
  generateId,
} from '../lib/storage';

// Widget sync module (iOS only)
const { SharedDataModule } = NativeModules;

// Sync data to widget (iOS only)
const syncToWidget = (consumed: number, goal: number) => {
  if (Platform.OS === 'ios' && SharedDataModule?.updateWidgetData) {
    try {
      SharedDataModule.updateWidgetData(consumed, goal);
    } catch (error) {
      console.warn('Failed to sync to widget:', error);
    }
  }
};

// Get data from widget (iOS only) - returns null if no widget updates
const getWidgetData = async (): Promise<{
  consumed: number;
  goal: number;
  widgetUpdated: boolean;
} | null> => {
  if (Platform.OS === 'ios' && SharedDataModule?.getWidgetData) {
    try {
      const data = await SharedDataModule.getWidgetData();
      return data;
    } catch (error) {
      console.warn('Failed to get widget data:', error);
      return null;
    }
  }
  return null;
};

interface WaterStoreState {
  todayRecord: DailyRecord;
  settings: UserSettings;
  history: DailyRecord[];
  isLoading: boolean;
  showGoalReached: boolean;
}

interface WaterStoreActions {
  addWater: (amount: number) => void;
  removeWater: (amount: number) => void;
  removeLastEntry: () => void;
  setDailyGoal: (goal: number) => void;
  toggleNotifications: (enabled: boolean) => void;
  setNotificationInterval: (interval: number) => void;
  setQuietHours: (start: string, end: string) => void;
  loadData: () => Promise<void>;
  resetToday: () => void;
  dismissGoalReached: () => void;
}

type WaterStore = WaterStoreState & WaterStoreActions;

const WaterStoreContext = createContext<WaterStore | null>(null);

interface WaterStoreProviderProps {
  children: ReactNode;
}

export function WaterStoreProvider({ children }: WaterStoreProviderProps) {
  const [todayRecord, setTodayRecord] = useState<DailyRecord>(() =>
    getDefaultTodayRecord(getDefaultSettings().dailyGoal)
  );
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalReached, setShowGoalReached] = useState(false);
  const hasShownGoalReached = useRef(false);
  const appState = useRef(AppState.currentState);
  const skipNextWidgetSync = useRef(false); // Flag to skip one widget sync

  // Load data on mount
  useEffect(() => {
    loadDataWithWidgetSync();
  }, []);

  // Sync to widget when todayRecord changes
  useEffect(() => {
    if (!isLoading) {
      if (skipNextWidgetSync.current) {
        skipNextWidgetSync.current = false;
        return;
      }
      syncToWidget(todayRecord.consumed, settings.dailyGoal);
    }
  }, [todayRecord.consumed, settings.dailyGoal, isLoading]);

  // Listen for app state changes to reload data when coming back to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // When app comes to foreground, sync with widget
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        await syncFromWidget();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);
  
  // Sync FROM widget - check if widget has newer data
  const syncFromWidget = async () => {
    const widgetData = await getWidgetData();
    if (!widgetData) return;
    
    // Compare with current app data
    setTodayRecord((currentRecord) => {
      if (widgetData.consumed !== currentRecord.consumed) {
        console.log('Widget sync: widget has', widgetData.consumed, 'app has', currentRecord.consumed);
        
        // Skip the next widget sync since we're syncing FROM widget
        skipNextWidgetSync.current = true;
        
        const diff = widgetData.consumed - currentRecord.consumed;
        return {
          ...currentRecord,
          consumed: widgetData.consumed,
          entries: diff !== 0 ? [
            ...currentRecord.entries,
            {
              id: generateId(),
              amount: diff,
              timestamp: new Date().toISOString(),
            },
          ] : currentRecord.entries,
        };
      }
      return currentRecord;
    });
  };

  // Save today's record when it changes
  useEffect(() => {
    if (!isLoading) {
      saveTodayRecord(todayRecord);
      
      // Check if goal was reached
      if (
        todayRecord.consumed >= settings.dailyGoal &&
        !hasShownGoalReached.current
      ) {
        hasShownGoalReached.current = true;
        setShowGoalReached(true);
      }
    }
  }, [todayRecord, isLoading, settings.dailyGoal]);

  // Save settings when they change
  useEffect(() => {
    if (!isLoading) {
      saveSettings(settings);
    }
  }, [settings, isLoading]);

  const loadDataWithWidgetSync = async () => {
    setIsLoading(true);
    try {
      const [loadedSettings, loadedHistory] = await Promise.all([
        loadSettings(),
        loadHistory(),
      ]);
      
      setSettings(loadedSettings);
      setHistory(loadedHistory);
      
      // Load app data
      const loadedTodayRecord = await loadTodayRecord(loadedSettings.dailyGoal);
      
      // Check widget data - use widget value if different (widget might have newer data)
      const widgetData = await getWidgetData();
      
      let finalRecord = loadedTodayRecord;
      
      if (widgetData && widgetData.consumed !== loadedTodayRecord.consumed) {
        console.log('Initial load: Widget has', widgetData.consumed, 'AsyncStorage has', loadedTodayRecord.consumed);
        // Use the widget data as it might be more recent
        const diff = widgetData.consumed - loadedTodayRecord.consumed;
        finalRecord = {
          ...loadedTodayRecord,
          consumed: widgetData.consumed,
          entries: diff !== 0 ? [
            ...loadedTodayRecord.entries,
            {
              id: generateId(),
              amount: diff,
              timestamp: new Date().toISOString(),
            },
          ] : loadedTodayRecord.entries,
        };
        // Skip widget sync since we just got data from widget
        skipNextWidgetSync.current = true;
      }
      
      setTodayRecord(finalRecord);
      
      // Check if goal was already reached today
      if (finalRecord.consumed >= loadedSettings.dailyGoal) {
        hasShownGoalReached.current = true;
      }
      
      // Only sync to widget if we didn't just get data from widget
      if (!skipNextWidgetSync.current) {
        syncToWidget(finalRecord.consumed, loadedSettings.dailyGoal);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadData = async () => {
    await loadDataWithWidgetSync();
  };

  const addWater = useCallback((amount: number) => {
    const entry: WaterEntry = {
      id: generateId(),
      amount,
      timestamp: new Date().toISOString(),
    };

    setTodayRecord((prev) => ({
      ...prev,
      consumed: prev.consumed + amount,
      entries: [...prev.entries, entry],
    }));
  }, []);

  const removeWater = useCallback((amount: number) => {
    // Create a negative entry to track the removal
    const entry: WaterEntry = {
      id: generateId(),
      amount: -amount,
      timestamp: new Date().toISOString(),
    };

    setTodayRecord((prev) => ({
      ...prev,
      consumed: Math.max(0, prev.consumed - amount), // Never go below 0
      entries: [...prev.entries, entry],
    }));
  }, []);

  const removeLastEntry = useCallback(() => {
    setTodayRecord((prev) => {
      if (prev.entries.length === 0) return prev;
      
      const lastEntry = prev.entries[prev.entries.length - 1];
      return {
        ...prev,
        consumed: Math.max(0, prev.consumed - lastEntry.amount),
        entries: prev.entries.slice(0, -1),
      };
    });
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    setSettings((prev) => ({ ...prev, dailyGoal: goal }));
    setTodayRecord((prev) => ({ ...prev, goal }));
  }, []);

  const toggleNotifications = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, notificationsEnabled: enabled }));
  }, []);

  const setNotificationInterval = useCallback((interval: number) => {
    setSettings((prev) => ({ ...prev, notificationInterval: interval }));
  }, []);

  const setQuietHours = useCallback((start: string, end: string) => {
    setSettings((prev) => ({
      ...prev,
      quietHoursStart: start,
      quietHoursEnd: end,
    }));
  }, []);

  const resetToday = useCallback(() => {
    hasShownGoalReached.current = false;
    setTodayRecord(getDefaultTodayRecord(settings.dailyGoal));
  }, [settings.dailyGoal]);

  const dismissGoalReached = useCallback(() => {
    setShowGoalReached(false);
  }, []);

  const value: WaterStore = {
    todayRecord,
    settings,
    history,
    isLoading,
    showGoalReached,
    addWater,
    removeWater,
    removeLastEntry,
    setDailyGoal,
    toggleNotifications,
    setNotificationInterval,
    setQuietHours,
    loadData,
    resetToday,
    dismissGoalReached,
  };

  return (
    <WaterStoreContext.Provider value={value}>
      {children}
    </WaterStoreContext.Provider>
  );
}

export function useWaterStore(): WaterStore {
  const context = useContext(WaterStoreContext);
  if (!context) {
    throw new Error('useWaterStore must be used within a WaterStoreProvider');
  }
  return context;
}
