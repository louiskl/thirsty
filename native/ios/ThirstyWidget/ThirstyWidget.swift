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
        return String(format: "%.2f", liters)
    }
    
    var goalLiters: String {
        let liters = Double(goal) / 1000.0
        return String(format: "%.2f", liters)
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
        case .accessoryCircular:
            AccessoryCircularView(data: entry.waterData)
        default:
            SmallWidgetView(data: entry.waterData)
        }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let data: WaterData
    
    var body: some View {
        VStack(spacing: 6) {
            // Glass - larger, more prominent
            WaterGlassView(
                fillPercentage: data.percentage,
                isGoalReached: data.isGoalReached
            )
            .frame(width: 50, height: 60)
            
            // Amount with German formatting
            Text("\(data.consumedLiters.replacingOccurrences(of: ".", with: ",")) L")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundColor(Color.textPrimary)
            
            // Goal
            Text("von \(data.goalLiters.replacingOccurrences(of: ".", with: ",")) L")
                .font(.system(size: 10, weight: .medium, design: .rounded))
                .foregroundColor(Color.textSecondary)
            
            // Interactive buttons - pill shape (two styles)
            HStack(spacing: 8) {
                // Minus button (secondary - light background)
                Button(intent: RemoveWaterIntent()) {
                    ZStack {
                        Capsule()
                            .fill(Color.buttonSecondaryBackground)
                            .frame(width: 44, height: 28)
                        
                        Image(systemName: "minus")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(Color.buttonSecondaryForeground)
                    }
                }
                .buttonStyle(.plain)
                
                // Plus button (primary - colored background)
                Button(intent: AddWaterIntent()) {
                    ZStack {
                        Capsule()
                            .fill(Color.buttonPrimaryBackground)
                            .frame(width: 44, height: 28)
                        
                        Image(systemName: "plus")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(Color.buttonPrimaryForeground)
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
        HStack(spacing: 24) {
            // Left side - Glass (larger, more prominent)
            WaterGlassView(
                fillPercentage: data.percentage,
                isGoalReached: data.isGoalReached
            )
            .frame(width: 80, height: 100)
            
            // Right side - Info and buttons
            VStack(alignment: .leading, spacing: 12) {
                // Amount with German formatting
                VStack(alignment: .leading, spacing: 2) {
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(data.consumedLiters.replacingOccurrences(of: ".", with: ","))
                            .font(.system(size: 36, weight: .light, design: .rounded))
                            .foregroundColor(Color.textPrimary)
                        
                        Text("L")
                            .font(.system(size: 20, weight: .regular, design: .rounded))
                            .foregroundColor(Color.textSecondary)
                    }
                    
                    Text("von \(data.goalLiters.replacingOccurrences(of: ".", with: ",")) L")
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundColor(Color.textSecondary)
                }
                
                Spacer()
                
                // Interactive buttons - pill shape (two styles)
                HStack(spacing: 10) {
                    // Minus button (secondary - light background)
                    Button(intent: RemoveWaterIntent()) {
                        ZStack {
                            Capsule()
                                .fill(Color.buttonSecondaryBackground)
                                .frame(width: 56, height: 36)
                            
                            Image(systemName: "minus")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(Color.buttonSecondaryForeground)
                        }
                    }
                    .buttonStyle(.plain)
                    
                    // Plus button (primary - colored background)
                    Button(intent: AddWaterIntent()) {
                        ZStack {
                            Capsule()
                                .fill(Color.buttonPrimaryBackground)
                                .frame(width: 56, height: 36)
                            
                            Image(systemName: "plus")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(Color.buttonPrimaryForeground)
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
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular])
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
