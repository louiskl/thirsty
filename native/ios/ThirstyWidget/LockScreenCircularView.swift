import SwiftUI
import WidgetKit

// MARK: - Accessory Circular View (Lock Screen 1x1 Widget)

struct AccessoryCircularView: View {
    let data: WaterData
    
    var body: some View {
        Gauge(value: min(data.percentage, 1.0)) {
            Image(systemName: "drop.fill")
                .font(.system(size: 12))
        }
        .gaugeStyle(.accessoryCircularCapacity)
        .widgetAccentable()
    }
}

// MARK: - Preview

#Preview(as: .accessoryCircular) {
    ThirstyWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
    WaterEntry(date: .now, waterData: WaterData(consumed: 500, goal: 2000, percentage: 0.25, date: ""))
    WaterEntry(date: .now, waterData: WaterData(consumed: 2000, goal: 2000, percentage: 1.0, date: ""))
}
