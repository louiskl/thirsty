# 🌊 Thirsty – Feature- & System-Roadmap

> **Ziel:** Eine extrem hochwertige, lokale, private, ästhetische Hydration-App mit tiefem System-Integration-Fokus (Apple-Ökosystem first).

---

## 🔥 PRIORITY 1 – Fundament (Must-Have)

### 1. HealthKit Integration (Top-Priorität)
- [ ] Bidirektionale HealthKit-Integration
- [ ] Wasseraufnahme wird in Apple Health geschrieben
- [ ] Optional: Wasseraufnahme aus Apple Health lesen
- [ ] Nutzung von `HKQuantityTypeIdentifier.dietaryWater`
- [ ] Vollständig lokal, kein Server
- [ ] Transparente Berechtigungsabfrage mit Erklärung
- [ ] Live-Sync: App ↔ Widget ↔ Apple Watch ↔ Health App
- [ ] Fallback: Wenn HealthKit deaktiviert → App funktioniert weiterhin lokal

> ➡️ Das ist das Herz der App. Ohne das keine „System-App-Qualität".

### 2. Realistische Glas-Physik (Device Motion)
- [ ] CoreMotion / DeviceMotion Integration
- [ ] Wasser reagiert auf Neigung & Bewegung des Geräts
- [ ] Schwappt realistisch nach links/rechts
- [ ] Trägheit, Verzögerung, sanfte Dämpfung
- [ ] Kein Verschütten, immer physikalisch „geschlossen"
- [ ] Leichtes Wellen-Shading
- [ ] Minimale Lichtreflexion
- [ ] Deaktivierbar (Accessibility / Battery)

> ➡️ Apple liebt subtile Physics, wenn sie Sinn machen.
> ➡️ Das hier ist dein „wow, das fühlt sich lebendig an"-Moment.

---

## 📱 CORE APP EXPERIENCE

### 3. Main App Screen (Zen-First)
- [x] Ein Screen, ein Fokus: Das Glas
- [x] Glas nimmt ~70–80% der Höhe ein
- [x] Klar definierte, hochwertige Glasform
- [x] Große Zahl-Anzeige (z.B. 1.25 L)
- [x] Sekundär: von X L (Tagesziel)
- [x] Tap auf Glas → +Standardmenge
- [ ] Long-Press → Quick-Picker
- [x] Keine Buttons sichtbar, wenn nicht nötig
- [x] Sanfte Haptics bei jeder Aktion

### 4. Swipe-Up Control Layer
- [x] Settings ohne „Settings-Screen-Look"
- [x] Tagesziel einstellbar
- [x] Standardmenge wählbar (z.B. 200 / 250 / 300 ml)
- [x] Erinnerungen (Smart Toggle)
- [x] Minimal, ruhig, Apple-Style

---

## 🧩 WIDGET-ÖKOSYSTEM

### 5. Home Screen Widgets
- [x] **Small Widget** – Glas + Füllstand + +/- Buttons
- [x] **Medium Widget** – Glas + Text + +/- Aktionen
- [ ] **Large Widget** – Glas + Tagesziel + Fortschrittsanzeige
- [ ] Widget-Styles: Hell, Dunkel, Transparent, Getönt (System-Accent)
- [x] Perfekter Kontrast in allen Modi
- [x] Keine toten Flächen, kein unnötiger Padding

### 6. Lock Screen Widgets (iOS 16+)
- [x] **Inline** (über der Uhr) – 💧 X.XXL von Y.YYL
- [x] **Circular** – Fortschrittsring mit Wassertropfen
- [x] **Rectangular** – Wassertropfen + Literzahl + "getrunken"
- [x] **Progress Rectangular** – Fortschrittsbalken + Literzahl
- [x] Extrem kontraststark
- [x] In jeder Wallpaper-Situation lesbar

### 7. Widget-Synchronisation
- [x] App → Home Screen Widgets (bidirektional)
- [x] App → Lock Screen Widgets
- [x] Home Screen Widgets → App
- [x] Home Screen Widgets → Lock Screen Widgets
- [x] Explizites Reload aller Widget-Kinds

---

## ⌚ APPLE WATCH (Companion App)

### 8. Vollwertige Apple Watch App
- [ ] Native Watch App (kein Mirror)
- [ ] Wasser hinzufügen
- [ ] Tagesfortschritt anzeigen
- [ ] Ziel anzeigen
- [ ] **Komplikationen:** Circular, Modular, Inline
- [ ] Haptische Erinnerungen
- [ ] Automatische Sync mit iPhone & HealthKit

> ➡️ Watch-Support = Apple-Award-Credibility.

---

## 🧠 INTELLIGENTE ERINNERUNGEN

### 9. Smarte Push-Benachrichtigungen
- [x] Grundlegende Erinnerungen
- [ ] Intelligente Trigger (Tageszeit, Füllstand, historisches Verhalten)
- [ ] Beispiele: „Es ist 14:30 – heute fehlen dir noch 1.1 L"
- [ ] Keine festen Intervalle
- [ ] Respektiert Fokus-Modi

---

## 🗣️ SYSTEM-INTEGRATION

### 10. Siri Shortcuts
- [ ] „Hey Siri, füge 250 ml Wasser hinzu"
- [ ] „Wie viel habe ich heute getrunken?"
- [ ] Automationen: Beim Aufstehen, Nach Workout, Beim Heimkommen

### 11. Live Activities (optional, später)
- [ ] Temporäre Anzeige: „Heute noch 600 ml"
- [ ] Besonders gut nach Sport oder langen Tagen

---

## 🎨 PERSONALISIERUNG (KURATIERT)

### 12. Farb- & Stil-Presets
- [ ] Presets: Arctic, Ocean, Mint, Monochrome
- [ ] Automatisch an System-Accent
- [ ] Dark / Light Mode Support
- [ ] Einheitlich für App, Widgets, Watch

---

## ♿ ACCESSIBILITY & QUALITY

### 13. Accessibility
- [ ] Reduce Motion → keine Glas-Physik
- [ ] Dynamic Type Support
- [ ] VoiceOver-Support
- [x] Haptics (implementiert)
- [ ] Haptics abschaltbar

---

## 🔒 PRIVACY & TECH

### 14. Privacy-First
- [x] Keine Accounts
- [x] Keine Cloud
- [x] Alles lokal (AsyncStorage + App Group UserDefaults)
- [ ] HealthKit = Nutzerkontrolle

---

## 📊 FORTSCHRITT

| Bereich | Status |
|---------|--------|
| Core App | ✅ Grundlegend fertig |
| Home Screen Widgets | ✅ Small + Medium fertig |
| Lock Screen Widgets | ✅ Alle 4 Typen fertig |
| Widget-Sync | ✅ Vollständig bidirektional |
| HealthKit | ⏳ Noch nicht begonnen |
| Apple Watch | ⏳ Noch nicht begonnen |
| Glas-Physik | ⏳ Noch nicht begonnen |
| Siri Shortcuts | ⏳ Noch nicht begonnen |

---

## 🧠 ZUSAMMENFASSUNG

> **Thirsty ist keine „Water Tracker App".**
> **Thirsty ist eine native System-Erfahrung für Hydration.**

---

*Zuletzt aktualisiert: Februar 2026*
