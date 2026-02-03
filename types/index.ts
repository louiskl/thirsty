// Thirsty App - TypeScript Interfaces

export interface WaterEntry {
  id: string;
  amount: number;      // ml
  timestamp: string;   // ISO string
}

export interface DailyRecord {
  date: string;        // "2026-02-03" Format
  consumed: number;    // ml
  goal: number;        // ml
  entries: WaterEntry[];
}

export interface UserSettings {
  dailyGoal: number;            // ml (default: 2000)
  notificationsEnabled: boolean;
  notificationInterval: number;  // Minuten
  quietHoursStart: string;       // "22:00"
  quietHoursEnd: string;         // "07:00"
}

export interface WaterStore {
  // State
  todayRecord: DailyRecord;
  settings: UserSettings;
  history: DailyRecord[];
  isLoading: boolean;
  
  // Actions
  addWater: (amount: number) => void;
  removeLastEntry: () => void;
  setDailyGoal: (goal: number) => void;
  toggleNotifications: (enabled: boolean) => void;
  setNotificationInterval: (interval: number) => void;
  setQuietHours: (start: string, end: string) => void;
  loadData: () => Promise<void>;
  resetToday: () => void;
}
