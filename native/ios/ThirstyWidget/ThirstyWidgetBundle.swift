import WidgetKit
import SwiftUI

@main
struct ThirstyWidgetBundle: WidgetBundle {
    var body: some Widget {
        ThirstyWidget()
        ThirstyProgressWidget()
    }
}
