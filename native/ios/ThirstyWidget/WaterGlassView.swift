import SwiftUI

struct WaterGlassView: View {
    let fillPercentage: Double
    let isGoalReached: Bool
    
    // Animation state
    @State private var animatedPercentage: Double = 0
    @State private var waveOffset: Double = 0
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            
            ZStack {
                // Glass outline
                GlassShape()
                    .stroke(
                        Color.glassStroke,
                        style: StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round)
                    )
                
                // Water fill with gradient
                GlassShape()
                    .fill(
                        LinearGradient(
                            colors: isGoalReached
                                ? [Color.successLight, Color.success.opacity(0.9)]
                                : [Color.waterLight, Color.water.opacity(0.9)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .mask(
                        VStack {
                            Spacer()
                            Rectangle()
                                .frame(height: height * CGFloat(min(animatedPercentage, 1.0)))
                        }
                    )
                    .clipShape(GlassShape())
                
                // Wave effect at water surface
                if animatedPercentage > 0.05 && animatedPercentage < 0.98 {
                    WaveShape(offset: waveOffset, amplitude: 2)
                        .fill(
                            isGoalReached
                                ? Color.successLight.opacity(0.6)
                                : Color.waterLight.opacity(0.6)
                        )
                        .frame(height: 8)
                        .offset(y: height * (1 - CGFloat(animatedPercentage)) - height/2 + 4)
                        .clipShape(GlassShape())
                }
            }
        }
        .onAppear {
            // Animate water level
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                animatedPercentage = fillPercentage
            }
            
            // Subtle continuous wave animation
            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                waveOffset = .pi * 2
            }
        }
        .onChange(of: fillPercentage) { oldValue, newValue in
            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                animatedPercentage = newValue
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
        let cornerRadius: CGFloat = 4
        
        // Tapered glass shape (wider at top, narrower at bottom)
        let topWidth = width * 0.95
        let bottomWidth = width * 0.75
        
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
            let sine = sin(relativeX * .pi * 2 + offset)
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
        WaterGlassView(fillPercentage: 0.6, isGoalReached: false)
            .frame(width: 80, height: 100)
        
        WaterGlassView(fillPercentage: 1.0, isGoalReached: true)
            .frame(width: 80, height: 100)
    }
    .padding()
    .background(Color.widgetBackground)
}
