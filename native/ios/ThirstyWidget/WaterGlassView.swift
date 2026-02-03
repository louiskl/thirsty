import SwiftUI

struct WaterGlassView: View {
    let fillPercentage: Double
    let isGoalReached: Bool
    
    // Animation state
    @State private var animatedPercentage: Double = 0
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let shadowHeight: CGFloat = 8
            let glassHeight = height - shadowHeight
            
            ZStack {
                // Shadow under glass
                Ellipse()
                    .fill(
                        RadialGradient(
                            colors: [Color.glassShadow, Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: width * 0.4
                        )
                    )
                    .frame(width: width * 0.7, height: shadowHeight * 2)
                    .offset(y: glassHeight / 2 + 2)
                
                // Glass container
                ZStack {
                    // Glass body - outer stroke (very subtle like mockup)
                    GlassShape()
                        .stroke(Color.glassStroke.opacity(0.8), lineWidth: 1.0)
                        .frame(width: width, height: glassHeight)
                    
                    // Glass body - fill with subtle gradient
                    GlassShape()
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.12), Color.white.opacity(0.08), Color.white.opacity(0.14)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: width, height: glassHeight)
                    
                    // Inner glass stroke for depth (subtle)
                    GlassShape()
                        .stroke(Color.glassStrokeLight, lineWidth: 0.5)
                        .padding(2)
                        .frame(width: width, height: glassHeight)
                        .opacity(0.4)
                    
                    // Water fill with gradient - blue theme matching mockup
                    GlassShape()
                        .fill(
                            LinearGradient(
                                colors: isGoalReached
                                    ? [Color.successLight, Color.success.opacity(0.88), Color.successDark.opacity(0.92)]
                                    : [Color.waterLight.opacity(0.90), Color.water.opacity(0.92), Color.waterMid.opacity(0.95), Color.waterDark.opacity(0.98)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .mask(
                            VStack(spacing: 0) {
                                Spacer(minLength: 0)
                                Rectangle()
                                    .frame(height: glassHeight * CGFloat(min(animatedPercentage, 1.0)))
                            }
                        )
                        .clipShape(GlassShape())
                        .frame(width: width, height: glassHeight)
                    
                    // Wave effect removed for widgets - causes visual artifacts at small sizes
                    
                    // Bubbles (static for widgets - no continuous animation)
                    if animatedPercentage > 0.15 {
                        BubblesView(
                            fillPercentage: animatedPercentage,
                            glassWidth: width,
                            glassHeight: glassHeight
                        )
                        .clipShape(GlassShape())
                        .frame(width: width, height: glassHeight)
                    }
                    
                    // Glass highlight - top rim
                    GlassHighlight(width: width)
                        .offset(y: -glassHeight / 2 + 3)
                    
                    // Side reflection - left
                    SideReflection(glassHeight: glassHeight)
                        .offset(x: -width / 2 + 6)
                }
                .offset(y: -shadowHeight / 2)
            }
        }
        .onAppear {
            // Animate water level
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                animatedPercentage = fillPercentage
            }
        }
        .onChange(of: fillPercentage) { oldValue, newValue in
            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                animatedPercentage = newValue
            }
        }
    }
}

// MARK: - Glass Highlight

struct GlassHighlight: View {
    let width: CGFloat
    
    var body: some View {
        Capsule()
            .fill(
                LinearGradient(
                    colors: [Color.white.opacity(0.95), Color.white.opacity(0.5), Color.white.opacity(0)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .frame(width: width * 0.55, height: 2.5)
    }
}

// MARK: - Side Reflection

struct SideReflection: View {
    let glassHeight: CGFloat
    
    var body: some View {
        Capsule()
            .fill(Color.glassReflection)
            .frame(width: 2, height: glassHeight * 0.65)
            .opacity(0.5)
    }
}

// MARK: - Bubbles View

struct BubblesView: View {
    let fillPercentage: Double
    let glassWidth: CGFloat
    let glassHeight: CGFloat
    
    // Fixed bubble positions for widget - smaller, fewer bubbles for elegance
    private let bubbleData: [(x: CGFloat, y: CGFloat, size: CGFloat)] = [
        (0.35, 0.35, 2.2),
        (0.58, 0.55, 1.8),
        (0.42, 0.72, 1.5),
        (0.65, 0.42, 1.6),
    ]
    
    var body: some View {
        ZStack {
            ForEach(0..<bubbleData.count, id: \.self) { index in
                let bubble = bubbleData[index]
                let waterTop = 1.0 - fillPercentage
                let bubbleY = waterTop + bubble.y * fillPercentage
                
                if bubbleY > waterTop && bubbleY < 1.0 {
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.bubbleHighlight, Color.bubble],
                                center: .topLeading,
                                startRadius: 0,
                                endRadius: bubble.size
                            )
                        )
                        .frame(width: bubble.size, height: bubble.size)
                        .position(
                            x: glassWidth * bubble.x,
                            y: glassHeight * bubbleY
                        )
                        .opacity(0.45)  // More subtle
                }
            }
        }
    }
}

// MARK: - Glass Shape

struct GlassShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let width = rect.width
        let height = rect.height
        // More rounded corners for elegant look
        let cornerRadius: CGFloat = min(width, height) * 0.08
        
        // Slimmer tapered glass shape (narrower, more elegant)
        let topWidth = width * 0.85      // Slimmer top
        let bottomWidth = width * 0.62   // More tapered bottom
        
        let topLeft = CGPoint(x: (width - topWidth) / 2, y: 0)
        let topRight = CGPoint(x: (width + topWidth) / 2, y: 0)
        let bottomLeft = CGPoint(x: (width - bottomWidth) / 2, y: height)
        let bottomRight = CGPoint(x: (width + bottomWidth) / 2, y: height)
        
        // Start from top-left with rounded corner
        path.move(to: CGPoint(x: topLeft.x + cornerRadius, y: topLeft.y))
        
        // Top edge
        path.addLine(to: CGPoint(x: topRight.x - cornerRadius, y: topRight.y))
        
        // Top-right corner
        path.addQuadCurve(
            to: CGPoint(x: topRight.x, y: topRight.y + cornerRadius),
            control: topRight
        )
        
        // Right edge (tapered)
        path.addLine(to: CGPoint(x: bottomRight.x, y: bottomRight.y - cornerRadius))
        
        // Bottom-right corner
        path.addQuadCurve(
            to: CGPoint(x: bottomRight.x - cornerRadius, y: bottomRight.y),
            control: bottomRight
        )
        
        // Bottom edge
        path.addLine(to: CGPoint(x: bottomLeft.x + cornerRadius, y: bottomLeft.y))
        
        // Bottom-left corner
        path.addQuadCurve(
            to: CGPoint(x: bottomLeft.x, y: bottomLeft.y - cornerRadius),
            control: bottomLeft
        )
        
        // Left edge (tapered)
        path.addLine(to: CGPoint(x: topLeft.x, y: topLeft.y + cornerRadius))
        
        // Top-left corner
        path.addQuadCurve(
            to: CGPoint(x: topLeft.x + cornerRadius, y: topLeft.y),
            control: topLeft
        )
        
        path.closeSubpath()
        
        return path
    }
}

// MARK: - Wave Shape

struct WaveShape: Shape {
    var offset: Double
    var amplitude: CGFloat
    
    var animatableData: Double {
        get { offset }
        set { offset = newValue }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        let midY = height / 2
        
        path.move(to: CGPoint(x: 0, y: midY))
        
        for x in stride(from: 0, through: width, by: 1) {
            let relativeX = x / width
            let sine = sin(relativeX * .pi * 3 + offset)
            let y = midY + amplitude * CGFloat(sine)
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        WaterGlassView(fillPercentage: 0.4, isGoalReached: false)
            .frame(width: 80, height: 100)
        
        WaterGlassView(fillPercentage: 0.7, isGoalReached: false)
            .frame(width: 80, height: 100)
        
        WaterGlassView(fillPercentage: 1.0, isGoalReached: true)
            .frame(width: 80, height: 100)
    }
    .padding()
    .background(Color.widgetBackground)
}
