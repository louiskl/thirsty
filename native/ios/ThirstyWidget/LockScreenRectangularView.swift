import SwiftUI
import WidgetKit

// MARK: - Accessory Rectangular View (Lock Screen Widget über der Uhrzeit)

struct AccessoryRectangularView: View {
    let data: WaterData
    
    var body: some View {
        HStack(spacing: 8) {
            // Wassertropfen-Icon
            Image(systemName: "drop.fill")
                .font(.system(size: 24))
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

// MARK: - Preview

#Preview(as: .accessoryRectangular) {
    ThirstyWidget()
} timeline: {
    WaterEntry(date: .now, waterData: .placeholder)
    WaterEntry(date: .now, waterData: WaterData(consumed: 500, goal: 2000, percentage: 0.25, date: ""))
    WaterEntry(date: .now, waterData: WaterData(consumed: 2000, goal: 2000, percentage: 1.0, date: ""))
}
