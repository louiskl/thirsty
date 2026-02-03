import SwiftUI
import UIKit

// MARK: - Color Extensions

extension Color {
    // Primary water colors - blue-turquoise theme (matching React Native app mockup)
    static let water = Color(hex: "7DD3FC")
    static let waterLight = Color(hex: "E0F2FE")
    static let waterMid = Color(hex: "38BDF8")
    static let waterDark = Color(hex: "0EA5E9")
    
    // Success colors (goal reached - 3D gradient)
    static let success = Color(hex: "6EE7B7")
    static let successLight = Color(hex: "D1FAE5")
    static let successDark = Color(hex: "34D399")
    
    // Text colors
    static let textPrimary = Color(hex: "4B5563")
    static let textSecondary = Color(hex: "9CA3AF")
    static let textTertiary = Color(hex: "D1D5DB")
    
    // UI colors (softer, more elegant like mockup)
    static let widgetBackground = Color(hex: "FAFBFC")
    static let glassStroke = Color(hex: "E2E8F0")
    static let glassStrokeLight = Color(hex: "F1F5F9")
    static let glassShadow = Color(hex: "94A3B8").opacity(0.20)
    static let glassHighlight = Color.white.opacity(0.9)
    static let glassReflection = Color.white.opacity(0.5)
    static let buttonBackground = Color(hex: "F3F4F6")
    
    // Secondary button (Minus) - light/transparent background
    static let buttonSecondaryBackground = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(white: 1.0, alpha: 0.2)
            : UIColor(red: 0.95, green: 0.96, blue: 0.97, alpha: 1.0)
    })
    static let buttonSecondaryForeground = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.white
            : UIColor(red: 0.49, green: 0.73, blue: 0.99, alpha: 1.0)
    })
    
    // Primary button (Plus) - colored/blue background
    static let buttonPrimaryBackground = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 0.49, green: 0.73, blue: 0.99, alpha: 0.9)
            : UIColor(red: 0.49, green: 0.73, blue: 0.99, alpha: 1.0)
    })
    static let buttonPrimaryForeground = Color.white
    
    // Bubble colors
    static let bubble = Color.white.opacity(0.6)
    static let bubbleHighlight = Color.white.opacity(0.9)
    
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
