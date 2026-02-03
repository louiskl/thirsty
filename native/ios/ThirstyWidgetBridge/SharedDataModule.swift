import Foundation
import WidgetKit

@objc(SharedDataModule)
class SharedDataModule: NSObject {
  
  private let appGroupIdentifier = "group.com.louiskl.thirsty"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func updateWidgetData(_ consumed: Int, goal: Int) {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
      return
    }
    
    // Store water data
    defaults.set(consumed, forKey: "consumed")
    defaults.set(goal, forKey: "goal")
    defaults.set(Date().timeIntervalSince1970, forKey: "lastUpdated")
    
    // Calculate percentage for quick access
    let percentage = goal > 0 ? Double(consumed) / Double(goal) : 0
    defaults.set(percentage, forKey: "percentage")
    
    // Store today's date to detect day changes
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd"
    defaults.set(dateFormatter.string(from: Date()), forKey: "date")
    
    defaults.synchronize()
    
    // Reload widget timeline
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
  
  @objc
  func addWaterFromWidget(_ amount: Int) {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
      return
    }
    
    let currentConsumed = defaults.integer(forKey: "consumed")
    let newConsumed = max(0, currentConsumed + amount)
    let goal = defaults.integer(forKey: "goal")
    
    defaults.set(newConsumed, forKey: "consumed")
    defaults.set(Date().timeIntervalSince1970, forKey: "lastUpdated")
    
    let percentage = goal > 0 ? Double(newConsumed) / Double(goal) : 0
    defaults.set(percentage, forKey: "percentage")
    
    defaults.synchronize()
    
    // Reload widget
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
