import SwiftUI
import WidgetKit

// MARK: - Accessory Rectangular View (Lock Screen Widget unter der Uhrzeit)

struct AccessoryRectangularView: View {
    let data: WaterData
    
    var body: some View {
        HStack(spacing: 10) {
            // Wassertropfen-Icon (größer)
            Image(systemName: "drop.fill")
                .font(.system(size: 32))
                .widgetAccentable()
            
            // Text mit Fortschritt
            VStack(alignment: .leading, spacing: 2) {
                Text("\(data.consumedLiters.replacingOccurrences(of: ".", with: ",")) von \(data.goalLiters.replacingOccurrences(of: ".", with: ",")) L")
                    .font(.system(size: 14, weight: .semibold))
                
                Text("getrunken")
                    .font(.system(size: 12))
                    .opacity(0.8)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Separates Widget für Rectangular-Ansicht (unter der Uhrzeit)

struct ThirstyRectangularWidget: Widget {
    let kind: String = "ThirstyRectangularWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WaterTimelineProvider()) { entry in
            AccessoryRectangularView(data: entry.waterData)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Wasser Status")
        .description("Zeigt deinen Wasserkonsum unter der Uhrzeit")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - Preview

#Preview(as: .accessoryRectangular) {
    ThirstyRectangularWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
    WaterEntry(date: .now, waterData: WaterData(consumed: 500, goal: 2000, percentage: 0.25, date: ""))
    WaterEntry(date: .now, waterData: WaterData(consumed: 2000, goal: 2000, percentage: 1.0, date: ""))
}
