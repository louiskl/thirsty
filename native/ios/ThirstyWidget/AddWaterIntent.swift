import AppIntents
import WidgetKit

// MARK: - Add Water Intent

struct AddWaterIntent: AppIntent {
    static var title: LocalizedStringResource = "Wasser hinzufügen"
    static var description = IntentDescription("Fügt 250ml Wasser hinzu")
    
    private let appGroupIdentifier = "group.com.louiskl.thirsty"
    private let defaultAmount = 250
    
    func perform() async throws -> some IntentResult {
        guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
            return .result()
        }
        
        // Check and reset if new day
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let today = dateFormatter.string(from: Date())
        let storedDate = defaults.string(forKey: "date") ?? ""
        
        var currentConsumed = defaults.integer(forKey: "consumed")
        let goal = defaults.integer(forKey: "goal")
        
        // Reset if new day
        if storedDate != today {
            currentConsumed = 0
            defaults.set(today, forKey: "date")
        }
        
        // Add water
        let newConsumed = currentConsumed + defaultAmount
        defaults.set(newConsumed, forKey: "consumed")
        defaults.set(Date().timeIntervalSince1970, forKey: "lastUpdated")
        
        // Update percentage
        let percentage = goal > 0 ? Double(newConsumed) / Double(goal) : 0
        defaults.set(percentage, forKey: "percentage")
        
        // Flag that widget made a change (for app sync)
        defaults.set(true, forKey: "widgetUpdated")
        defaults.set(defaultAmount, forKey: "lastWidgetAmount")
        
        defaults.synchronize()
        
        // Reload widgets
        WidgetCenter.shared.reloadAllTimelines()
        
        return .result()
    }
}

// MARK: - Remove Water Intent

struct RemoveWaterIntent: AppIntent {
    static var title: LocalizedStringResource = "Wasser entfernen"
    static var description = IntentDescription("Entfernt 250ml Wasser")
    
    private let appGroupIdentifier = "group.com.louiskl.thirsty"
    private let defaultAmount = 250
    
    func perform() async throws -> some IntentResult {
        guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
            return .result()
        }
        
        // Check date
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let today = dateFormatter.string(from: Date())
        let storedDate = defaults.string(forKey: "date") ?? ""
        
        // If new day, nothing to remove
        if storedDate != today {
            defaults.set(today, forKey: "date")
            defaults.set(0, forKey: "consumed")
            defaults.set(0.0, forKey: "percentage")
            defaults.synchronize()
            WidgetCenter.shared.reloadAllTimelines()
            return .result()
        }
        
        let currentConsumed = defaults.integer(forKey: "consumed")
        let goal = defaults.integer(forKey: "goal")
        
        // Remove water (don't go below 0)
        let newConsumed = max(0, currentConsumed - defaultAmount)
        defaults.set(newConsumed, forKey: "consumed")
        defaults.set(Date().timeIntervalSince1970, forKey: "lastUpdated")
        
        // Update percentage
        let percentage = goal > 0 ? Double(newConsumed) / Double(goal) : 0
        defaults.set(percentage, forKey: "percentage")
        
        // Flag that widget made a change
        defaults.set(true, forKey: "widgetUpdated")
        defaults.set(-defaultAmount, forKey: "lastWidgetAmount")
        
        defaults.synchronize()
        
        // Reload widgets
        WidgetCenter.shared.reloadAllTimelines()
        
        return .result()
    }
}
