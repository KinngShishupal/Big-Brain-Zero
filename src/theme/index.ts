/** Dark neon + glass. Gradients use RN's built-in CSS `backgroundImage`. */
export const colors = {
  background: '#0E0726',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.62)',
  textFaint: 'rgba(255, 255, 255, 0.38)',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.14)',
  glassBorder: 'rgba(255, 255, 255, 0.16)',
  pink: '#FF4FD8',
  violet: '#8B5CFF',
  cyan: '#2EE6FF',
  lime: '#B6FF3B',
  orange: '#FF9F2E',
  red: '#FF3D6E',
  gold: '#FFD84D',
  overlay: 'rgba(8, 3, 22, 0.72)',
} as const;

export const gradients = {
  screen: 'linear-gradient(160deg, #1B0B45 0%, #0E0726 55%, #061833 100%)',
  pink: 'linear-gradient(135deg, #FF4FD8 0%, #FF7A59 100%)',
  violet: 'linear-gradient(135deg, #8B5CFF 0%, #4F7BFF 100%)',
  cyan: 'linear-gradient(135deg, #2EE6FF 0%, #2E8BFF 100%)',
  lime: 'linear-gradient(135deg, #B6FF3B 0%, #2EDB8A 100%)',
  red: 'linear-gradient(135deg, #FF3D6E 0%, #FF7A2E 100%)',
  gold: 'linear-gradient(135deg, #FFD84D 0%, #FF9F2E 100%)',
  glass:
    'linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)',
  progress: 'linear-gradient(90deg, #2EE6FF 0%, #8B5CFF 50%, #FF4FD8 100%)',
} as const;

export type GradientName = keyof typeof gradients;

/** Neon glow per accent, used as boxShadow. */
export const glow = {
  pink: '0px 8px 28px rgba(255, 79, 216, 0.45)',
  violet: '0px 8px 28px rgba(139, 92, 255, 0.45)',
  cyan: '0px 8px 28px rgba(46, 230, 255, 0.4)',
  lime: '0px 8px 28px rgba(182, 255, 59, 0.38)',
  red: '0px 8px 28px rgba(255, 61, 110, 0.5)',
  gold: '0px 8px 28px rgba(255, 216, 77, 0.45)',
  glass: '0px 12px 40px rgba(0, 0, 0, 0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = { sm: 10, md: 18, lg: 28, pill: 999 } as const;

/** Minimum touch target (dp) per Android accessibility guidance. */
export const TOUCH_MIN = 48;
