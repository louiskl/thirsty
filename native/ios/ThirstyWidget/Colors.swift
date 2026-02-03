import SwiftUI

// MARK: - Color Extensions

extension Color {
    // Primary water colors (matching React Native app)
    static let water = Color(hex: "BAE6FD")
    static let waterLight = Color(hex: "E0F2FE")
    static let waterDark = Color(hex: "7DD3FC")
    
    // Success colors (goal reached)
    static let success = Color(hex: "6EE7B7")
    static let successLight = Color(hex: "D1FAE5")
    
    // Text colors
    static let textPrimary = Color(hex: "4B5563")
    static let textSecondary = Color(hex: "9CA3AF")
    static let textTertiary = Color(hex: "D1D5DB")
    
    // UI colors
    static let widgetBackground = Color(hex: "FAFBFC")
    static let glassStroke = Color(hex: "E5E7EB")
    static let buttonBackground = Color(hex: "F3F4F6")
    
    // Hex color initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
