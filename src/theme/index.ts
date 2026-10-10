/** Loud, goofy palette. */
export const colors = {
  background: '#FFF3C4',
  surface: '#FFFFFF',
  surfaceAlt: '#FFE58A',
  border: '#2B1B3D',
  text: '#2B1B3D',
  textMuted: '#6E5A85',
  primary: '#FF4FA3',
  primaryDark: '#C9277A',
  secondary: '#3EC6FF',
  secondaryDark: '#1E8FC2',
  lime: '#8BE04E',
  limeDark: '#5DAA27',
  danger: '#FF3B3B',
  dangerDark: '#B81E1E',
  white: '#FFFFFF',
  overlay: 'rgba(43, 27, 61, 0.7)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const radius = { sm: 8, md: 16, lg: 24, pill: 999 } as const;

/** Minimum touch target (dp) per Android accessibility guidance. */
export const TOUCH_MIN = 48;
