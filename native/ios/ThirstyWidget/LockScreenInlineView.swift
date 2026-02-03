import SwiftUI
import WidgetKit

// MARK: - Accessory Inline View (Lock Screen Widget über der Uhrzeit - Datumsbereich)

struct AccessoryInlineView: View {
    let data: WaterData
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "drop.fill")
                .widgetAccentable()
            
            Text("\(data.consumedLiters.replacingOccurrences(of: ".", with: ","))L von \(data.goalLiters.replacingOccurrences(of: ".", with: ","))L")
        }
    }
}

// MARK: - Separates Widget für Inline-Ansicht (über der Uhrzeit, Datumsbereich)

struct ThirstyInlineWidget: Widget {
    let kind: String = "ThirstyInlineWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WaterTimelineProvider()) { entry in
            AccessoryInlineView(data: entry.waterData)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Wasser Inline")
        .description("Kompakte Anzeige über der Uhrzeit")
        .supportedFamilies([.accessoryInline])
    }
}

// MARK: - Preview

#Preview(as: .accessoryInline) {
    ThirstyInlineWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
}
