import SwiftUI
import WidgetKit

// MARK: - Accessory Progress View (Lock Screen Widget mit Fortschrittsbalken)

struct AccessoryProgressView: View {
    let data: WaterData
    
    var body: some View {
        VStack(spacing: 4) {
            // Progress bar mit Tropfen-Icon (größer)
            ProgressView(value: min(data.percentage, 1.0)) {
                HStack {
                    Image(systemName: "drop.fill")
                        .font(.system(size: 14))
                    Spacer()
                }
            }
            .progressViewStyle(.linear)
            .widgetAccentable()
            
            // Text mit Menge (deutsche Formatierung)
            Text("\(data.consumedLiters.replacingOccurrences(of: ".", with: ","))L / \(data.goalLiters.replacingOccurrences(of: ".", with: ","))L")
                .font(.system(size: 12, weight: .medium))
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
    }
}

// MARK: - Separates Widget für Progress-Ansicht

struct ThirstyProgressWidget: Widget {
    let kind: String = "ThirstyProgressWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WaterTimelineProvider()) { entry in
            AccessoryProgressView(data: entry.waterData)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Wasser Fortschritt")
        .description("Zeigt deinen Fortschritt als Balken")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - Preview

#Preview(as: .accessoryRectangular) {
    ThirstyProgressWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
    WaterEntry(date: .now, waterData: WaterData(consumed: 500, goal: 2000, percentage: 0.25, date: ""))
    WaterEntry(date: .now, waterData: WaterData(consumed: 2000, goal: 2000, percentage: 1.0, date: ""))
}
