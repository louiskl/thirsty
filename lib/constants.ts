// Thirsty App - Design System
// Modern. Elegant. Living.
// 3D glass with depth, reflections, and character.

// Premium color palette - vibrant yet soft, with 3D depth
// Modern turquoise tones for a fresh, clean appearance
export const Colors = {
  // Primary - Turquoise water tones with depth (for 3D effect)
  water: '#5EEAD4',           // Main turquoise (fresh, modern)
  waterLight: '#99F6E4',      // Top of water (lighter turquoise)
  waterDark: '#2DD4BF',       // Bottom of water (deeper turquoise)
  waterDeep: '#14B8A6',       // Deepest turquoise tone
  
  // Backgrounds - Warm, natural
  background: '#FAFBFC',       // Hint of warmth, not pure white
  backgroundSecondary: '#F3F4F6', // Soft gray tint
  
  // Background Gradient - Like morning mist
  backgroundGradient: ['#FAFBFC', '#F8FAFC', '#F1F5F9'] as const,
  backgroundGradientLocations: [0, 0.5, 1] as readonly number[],
  
  // Glass - 3D effect colors
  glassStroke: '#CBD5E1',     // Glass outline (slightly stronger)
  glassStrokeLight: '#E2E8F0', // Inner glass outline
  glassFill: 'rgba(255, 255, 255, 0.15)',
  glassHighlight: 'rgba(255, 255, 255, 0.85)', // Top rim highlight
  glassReflection: 'rgba(255, 255, 255, 0.4)', // Side reflection
  glassShadow: 'rgba(148, 163, 184, 0.25)',    // Shadow under glass
  glassInnerShadow: 'rgba(0, 0, 0, 0.03)',     // Inner depth
  
  // Bubbles
  bubble: 'rgba(255, 255, 255, 0.6)',
  bubbleHighlight: 'rgba(255, 255, 255, 0.9)',
  
  // Text - Soft grays, never black
  text: '#4B5563',             // Soft dark gray (was #1A1A1A)
  textSecondary: '#9CA3AF',    // Gentle secondary
  textTertiary: '#D1D5DB',     // Whisper tertiary
  
  // Semantic - Pastel success
  success: '#6EE7B7',          // Soft mint green (was #10B981)
  successLight: '#D1FAE5',     // Very soft green
  successDark: '#34D399',      // Deeper green for gradient
  
  // Utility
  border: '#F3F4F6',           // Almost invisible
  borderSubtle: '#E5E7EB',     // Soft when needed
  overlay: 'rgba(0, 0, 0, 0.06)', // Almost transparent (was 0.3)
  overlayLight: 'rgba(255, 255, 255, 0.92)',
  
  // Gradients (as arrays for LinearGradient)
  waterGradient: ['#CCFBF1', '#5EEAD4', '#2DD4BF', '#14B8A6'] as const,
  waterGradientLocations: [0, 0.35, 0.7, 1] as readonly number[],
  successGradient: ['#D1FAE5', '#6EE7B7', '#34D399'] as const,
  successGradientLocations: [0, 0.5, 1] as readonly number[],
} as const;

// Typography - Inter font family
// Light for display, Regular for body, Medium for labels, Semibold for emphasis
export const Typography = {
  // Font families - Inter
  fonts: {
    light: 'Inter_300Light',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
  },
  
  // Font weights (fallback when fonts not loaded)
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
  
  // Font sizes - generous, confident sizing
  sizes: {
    tiny: 11,         // Micro labels
    caption: 13,      // Secondary info
    footnote: 15,     // Small body
    body: 17,         // Primary body
    callout: 20,      // Emphasized body
    title3: 22,       // Small titles
    title2: 28,       // Section titles
    title1: 34,       // Screen titles
    largeTitle: 42,   // Hero titles
    display: 72,      // Main liter value - bigger for impact
    hero: 96,         // Maximum impact
  },
  
  // Line heights
  lineHeights: {
    tight: 1.0,       // For display numbers
    snug: 1.15,       // For titles
    normal: 1.35,     // For body
    relaxed: 1.5,     // For readability
  },
  
  // Letter spacing - refined for Inter
  letterSpacing: {
    tighter: -1.5,    // For large display numbers
    tight: -0.5,      // For titles
    normal: 0,        // Default
    wide: 0.3,        // For small caps/labels
  },
} as const;

// Spacing - generous whitespace, room to breathe
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
  massive: 128,
} as const;

// Border radius - soft, friendly corners
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// Animation timing - smooth, purposeful, never jarring
export const Timing = {
  instant: 100,       // Micro-feedback
  fast: 200,          // Quick responses
  normal: 350,        // Standard transitions
  slow: 500,          // Deliberate movements
  gentle: 700,        // Soft, flowing animations
  verySlow: 1000,     // Dramatic reveals
  
  // Spring configurations for Reanimated
  spring: {
    // Gentle, natural feeling
    gentle: { damping: 20, stiffness: 150 },
    // Responsive but soft
    responsive: { damping: 18, stiffness: 200 },
    // Snappy for buttons
    snappy: { damping: 22, stiffness: 300 },
    // Bouncy for feedback
    bouncy: { damping: 12, stiffness: 180 },
    // Water fill - smoother, more fluid-like motion
    waterFill: { damping: 16, stiffness: 100 },
    // Bubble float - even gentler
    bubble: { damping: 28, stiffness: 60 },
  },
} as const;

// Parallax configuration
export const Parallax = {
  // How much the water moves with device tilt (in pixels)
  waterOffset: 8,
  // How much bubbles move (more than water for depth effect)
  bubbleOffset: 12,
  // How much the glass highlight moves
  highlightOffset: 4,
  // Smoothing factor (0-1, higher = smoother but slower)
  smoothing: 0.15,
  // Update interval in ms (lower = smoother but more CPU)
  updateInterval: 33, // ~30fps
} as const;

// Bubble configuration - subtle and elegant
export const Bubbles = {
  // Number of bubbles (fewer for cleaner look)
  count: 5,
  // Size range (min, max) as percentage of glass width - smaller, more delicate
  sizeRange: [0.025, 0.055] as const,
  // Speed range (min, max) in seconds for full rise - slower, more graceful
  speedRange: [4, 8] as const,
  // Horizontal wobble amplitude as percentage of glass width - subtle movement
  wobbleAmplitude: 0.03,
} as const;

// Shadow styles - whisper-soft depth
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Barely visible - for subtle separation
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  // Soft lift
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  // Floating elements
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  // Modals and sheets
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

// Default app values
export const Defaults = {
  dailyGoal: 2000,           // ml
  tapAmount: 250,            // ml per tap
  notificationInterval: 60,  // minutes
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  
  // Amount options for long-press
  amountOptions: [100, 200, 250, 500],
} as const;

// Glass dimensions (relative to screen) - slimmer, more elegant proportions
export const GlassDimensions = {
  widthRatio: 0.40,   // 40% of screen width (slimmer)
  heightRatio: 0.36,  // 36% of screen height
  strokeWidth: 1.5,   // Thinner stroke for elegance
  cornerRadius: 12,   // More rounded corners
  topWidthRatio: 0.75,    // Top width relative to glass width
  bottomWidthRatio: 0.55, // Bottom width relative to glass width (more tapered)
} as const;
