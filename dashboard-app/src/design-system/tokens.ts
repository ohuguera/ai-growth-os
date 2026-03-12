/**
 * GUARDIAN AIOX — Design Tokens
 *
 * REGRA: Use APENAS estes tokens. Nunca use px/rem avulso fora daqui.
 * REGRA: Antes de criar qualquer componente visual, consulte este arquivo.
 */

export const tokens = {
  space: {
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  font: {
    size: {
      '2xs': '10px',
      xs: '11px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '30px',
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  color: {
    primary: '#0A84FF',
    secondary: '#BF5AF2',
    success: '#32D74B',
    warning: '#FF9500',
    danger: '#FF3B30',
    copy: '#FF2D55',
    bg: '#000000',
    surface: 'rgba(28, 28, 30, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#f5f5f7',
    textSecondary: '#86868b',
    tiktok: '#FF0050',
    instagram: '#E1306C',
    youtube: '#FF0000',
    igaming: '#0A84FF',
    grandesMarcas: '#BF5AF2',
  },
  shadow: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    glow: (color: string) => `0 0 20px ${color}40`,
  },
  transition: {
    fast: 'all 0.15s ease',
    smooth: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
} as const;
