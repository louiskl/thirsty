# Thirsty 💧

Eine aesthetische React Native App zum Wasserzaehlen mit minimalistischem Design und sanften Animationen.

## Features

- **Animierter Fortschrittskreis** - Visualisierung des taeglichen Wasserverbrauchs
- **Quick-Add Buttons** - Schnelles Hinzufuegen von 100ml, 250ml oder 500ml
- **Custom Amount** - Eigene Menge hinzufuegen
- **Tagesziel** - Anpassbares taegliches Wasserziel (1L - 4L)
- **Verlaufshistorie** - Wochenansicht mit Balkendiagramm
- **Push-Benachrichtigungen** - Erinnerungen zum Wassertrinken
- **Erfolgsanimation** - Feier bei erreichtem Tagesziel

## Tech Stack

- **Expo** (SDK 54)
- **React Native** with TypeScript
- **Expo Router** (file-based navigation)
- **React Native Reanimated** (animations)
- **React Native SVG** (progress circle)
- **AsyncStorage** (data persistence)
- **Expo Notifications** (reminders)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Projektstruktur

```
thirsty/
├── app/                      # Expo Router Screens
│   ├── _layout.tsx           # Root Layout
│   ├── index.tsx             # MainScreen
│   ├── settings.tsx          # Einstellungen
│   └── history.tsx           # Verlaufshistorie
├── components/
│   ├── WaterProgress.tsx     # Animierter Fortschrittskreis
│   ├── AddWaterButton.tsx    # Button zum Hinzufuegen
│   ├── QuickAddButtons.tsx   # Schnellauswahl
│   ├── WeekChart.tsx         # Wochendiagramm
│   └── GoalReachedModal.tsx  # Erfolgsanimation
├── hooks/
│   ├── useWaterStore.ts      # State Management
│   └── useNotifications.ts   # Benachrichtigungen
├── lib/
│   ├── storage.ts            # AsyncStorage Wrapper
│   └── constants.ts          # Design Konstanten
└── types/
    └── index.ts              # TypeScript Interfaces
```

## Design

### Farbpalette

- **Primary:** `#4FC3F7` (Hellblau)
- **Secondary:** `#0288D1` (Dunkelblau)
- **Background:** `#FAFAFA`
- **Success:** `#66BB6A` (Gruen)

## Lizenz

MIT
