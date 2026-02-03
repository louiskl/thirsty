import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Widget Data

struct WaterData {
    let consumed: Int
    let goal: Int
    let percentage: Double
    let date: String
    
    var consumedLiters: String {
        let liters = Double(consumed) / 1000.0
        return String(format: "%.1f", liters)
    }
    
    var goalLiters: String {
        let liters = Double(goal) / 1000.0
        return String(format: "%.1f", liters)
    }
    
    var isGoalReached: Bool {
        consumed >= goal
    }
    
    static let placeholder = WaterData(consumed: 1200, goal: 2000, percentage: 0.6, date: "")
}

// MARK: - Timeline Entry

struct WaterEntry: TimelineEntry {
    let date: Date
    let waterData: WaterData
}

// MARK: - Timeline Provider

struct WaterTimelineProvider: TimelineProvider {
    private let appGroupIdentifier = "group.com.louiskl.thirsty"
    
    func placeholder(in context: Context) -> WaterEntry {
        WaterEntry(date: Date(), waterData: .placeholder)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (WaterEntry) -> Void) {
        let entry = WaterEntry(date: Date(), waterData: loadWaterData())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<WaterEntry>) -> Void) {
        let currentDate = Date()
        let waterData = loadWaterData()
        let entry = WaterEntry(date: currentDate, waterData: waterData)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate) ?? currentDate
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadWaterData() -> WaterData {
        guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
            return WaterData(consumed: 0, goal: 2000, percentage: 0, date: "")
        }
        
        let consumed = defaults.integer(forKey: "consumed")
        let goal = defaults.integer(forKey: "goal")
        let percentage = defaults.double(forKey: "percentage")
        let date = defaults.string(forKey: "date") ?? ""
        
        // Check if it's a new day
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let today = dateFormatter.string(from: Date())
        
        if date != today && !date.isEmpty {
            // New day, reset data
            return WaterData(consumed: 0, goal: goal > 0 ? goal : 2000, percentage: 0, date: today)
        }
        
        return WaterData(
            consumed: consumed,
            goal: goal > 0 ? goal : 2000,
            percentage: percentage,
            date: date
        )
    }
}

// MARK: - Widget View

struct ThirstyWidgetEntryView: View {
    var entry: WaterEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(data: entry.waterData)
        case .systemMedium:
            MediumWidgetView(data: entry.waterData)
        default:
            SmallWidgetView(data: entry.waterData)
        }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let data: WaterData
    
    var body: some View {
        VStack(spacing: 4) {
            // Glass
            WaterGlassView(
                fillPercentage: data.percentage,
                isGoalReached: data.isGoalReached
            )
            .frame(width: 44, height: 52)
            
            // Amount
            Text("\(data.consumedLiters)L")
                .font(.system(size: 20, weight: .semibold, design: .rounded))
                .foregroundColor(Color.textPrimary)
            
            // Goal
            Text("von \(data.goalLiters)L")
                .font(.system(size: 10, weight: .medium, design: .rounded))
                .foregroundColor(Color.textSecondary)
            
            // Interactive buttons
            HStack(spacing: 8) {
                // Minus button
                Button(intent: RemoveWaterIntent()) {
                    ZStack {
                        Circle()
                            .fill(Color.buttonBackground)
                            .frame(width: 32, height: 32)
                        
                        Image(systemName: "minus")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(Color.textSecondary)
                    }
                }
                .buttonStyle(.plain)
                
                // Plus button
                Button(intent: AddWaterIntent()) {
                    ZStack {
                        Circle()
                            .fill(data.isGoalReached ? Color.successLight : Color.waterLight)
                            .frame(width: 32, height: 32)
                        
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(data.isGoalReached ? Color.success : Color.water)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(8)
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let data: WaterData
    
    var body: some View {
        HStack(spacing: 20) {
                // Left side - Glass
                WaterGlassView(
                    fillPercentage: data.percentage,
                    isGoalReached: data.isGoalReached
                )
                .frame(width: 70, height: 90)
                
                // Right side - Info and buttons
                VStack(alignment: .leading, spacing: 8) {
                    // Amount
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(data.consumedLiters)L")
                            .font(.system(size: 32, weight: .semibold, design: .rounded))
                            .foregroundColor(Color.textPrimary)
                        
                        Text("von \(data.goalLiters)L")
                            .font(.system(size: 14, weight: .medium, design: .rounded))
                            .foregroundColor(Color.textSecondary)
                    }
                    
                    Spacer()
                    
                    // Interactive buttons
                    HStack(spacing: 12) {
                        // Minus button
                        Button(intent: RemoveWaterIntent()) {
                            ZStack {
                                Circle()
                                    .fill(Color.buttonBackground)
                                    .frame(width: 44, height: 44)
                                
                                Image(systemName: "minus")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(Color.textSecondary)
                            }
                        }
                        .buttonStyle(.plain)
                        
                        // Plus button
                        Button(intent: AddWaterIntent()) {
                            ZStack {
                                Circle()
                                    .fill(data.isGoalReached ? Color.successLight : Color.waterLight)
                                    .frame(width: 44, height: 44)
                                
                                Image(systemName: "plus")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(data.isGoalReached ? Color.success : Color.water)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                
            Spacer()
        }
        .padding(16)
    }
}

// MARK: - Widget Configuration

struct ThirstyWidget: Widget {
    let kind: String = "ThirstyWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WaterTimelineProvider()) { entry in
            ThirstyWidgetEntryView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Wasser Tracker")
        .description("Verfolge deinen täglichen Wasserkonsum")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    ThirstyWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
}

#Preview(as: .systemMedium) {
    ThirstyWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
}
