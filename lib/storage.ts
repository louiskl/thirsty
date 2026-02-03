import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyRecord, UserSettings } from '../types';
import { Defaults } from './constants';

const KEYS = {
  TODAY_RECORD: 'thirsty_today_record',
  SETTINGS: 'thirsty_settings',
  HISTORY: 'thirsty_history',
} as const;

// Helper to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Default values
export function getDefaultSettings(): UserSettings {
  return {
    dailyGoal: Defaults.dailyGoal,
    notificationsEnabled: false,
    notificationInterval: Defaults.notificationInterval,
    quietHoursStart: Defaults.quietHoursStart,
    quietHoursEnd: Defaults.quietHoursEnd,
  };
}

export function getDefaultTodayRecord(goal: number): DailyRecord {
  return {
    date: getTodayDateString(),
    consumed: 0,
    goal,
    entries: [],
  };
}

// Storage functions
export async function loadSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      // Merge with defaults to handle migration (new properties get defaults)
      const saved = JSON.parse(data);
      return { ...getDefaultSettings(), ...saved };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return getDefaultSettings();
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function loadTodayRecord(goal: number): Promise<DailyRecord> {
  try {
    const data = await AsyncStorage.getItem(KEYS.TODAY_RECORD);
    if (data) {
      const record: DailyRecord = JSON.parse(data);
      const today = getTodayDateString();
      
      // Check if the stored record is from today
      if (record.date === today) {
        return record;
      }
      
      // If it's a different day, archive the old record first
      if (record.consumed > 0) {
        await archiveRecord(record);
      }
    }
  } catch (error) {
    console.error('Error loading today record:', error);
  }
  return getDefaultTodayRecord(goal);
}

export async function saveTodayRecord(record: DailyRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.TODAY_RECORD, JSON.stringify(record));
  } catch (error) {
    console.error('Error saving today record:', error);
  }
}

export async function loadHistory(): Promise<DailyRecord[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.HISTORY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
  return [];
}

async function archiveRecord(record: DailyRecord): Promise<void> {
  try {
    const history = await loadHistory();
    
    // Check if this record is already in history
    const existingIndex = history.findIndex((r) => r.date === record.date);
    if (existingIndex >= 0) {
      history[existingIndex] = record;
    } else {
      // Add to beginning of history
      history.unshift(record);
    }
    
    // Keep only the last 30 days
    const trimmedHistory = history.slice(0, 30);
    
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error archiving record:', error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.TODAY_RECORD,
      KEYS.SETTINGS,
      KEYS.HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
