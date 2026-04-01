/**
 * CYBERCORE CSS — Design Tokens
 * Ponte TypeScript para uso em inline styles.
 * Todos os valores referenciam CSS custom properties do cybercore-css.
 */

export const colors = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bgBase:     'var(--color-bg-primary)',    // #0d0e14 (void-500)
  bgCard:     'var(--color-bg-secondary)',  // #12141d (void-400)
  bgSurface:  'var(--color-bg-tertiary)',   // #181a25 (void-300)
  bgElevated: 'var(--color-bg-elevated)',   // #1f2230 (void-200)

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:   'var(--color-text-primary)',    // #f0f1f5
  textSecondary: 'var(--color-text-secondary)',  // #b2b7c7
  textMuted:     'var(--color-text-muted)',      // #747d99

  // ── Borders ─────────────────────────────────────────────────────────────────
  border:      'var(--color-border-default)', // #2a2d3a
  borderLight: 'var(--cyber-void-100)',       // #2a2d3a lighter

  // ── Brand palette ───────────────────────────────────────────────────────────
  primary:   'var(--cyber-cyan-500)',     // #00f0ff — neon cyan
  secondary: '#0066ff',                  // electric blue (custom)
  alert:     'var(--cyber-magenta-500)', // #ff2a6d — neon pink/red
  success:   'var(--cyber-green-500)',   // #05ffa1 — neon green
  warning:   'var(--cyber-yellow-500)', // #fcee0a — neon yellow

  // ── Muted tints ─────────────────────────────────────────────────────────────
  primaryMuted:  'color-mix(in srgb, var(--cyber-cyan-500) 12%, transparent)',
  alertMuted:    'color-mix(in srgb, var(--cyber-magenta-500) 12%, transparent)',
  successMuted:  'color-mix(in srgb, var(--cyber-green-500) 12%, transparent)',
  secondaryMuted:'color-mix(in srgb, #0066ff 12%, transparent)',
} as const

export const glow = {
  cyan:    'var(--glow-cyan)',     // 0 0 20px #00f0ff, 40px, 80px
  magenta: 'var(--glow-magenta)', // 0 0 20px #ff2a6d, 40px
  green:   'var(--glow-green)',   // 0 0 20px #05ffa1, 40px
  yellow:  'var(--glow-yellow)',  // 0 0 20px #fcee0a, 40px
  text:    'var(--glow-text-cyan)',
  // Variantes suaves para uso cotidiano
  cyanSoft:    '0 0 12px color-mix(in srgb, var(--cyber-cyan-500) 35%, transparent)',
  magentaSoft: '0 0 12px color-mix(in srgb, var(--cyber-magenta-500) 35%, transparent)',
  greenSoft:   '0 0 12px color-mix(in srgb, var(--cyber-green-500) 35%, transparent)',
} as const

export const radius = {
  sm:    'var(--radius-sm)',   // 2px
  md:    'var(--radius-md)',   // 4px
  lg:    'var(--radius-lg)',   // 8px
  cyber: 'var(--radius-cyber)', // 0 12px 0 12px — assimétrico cyberpunk
  full:  'var(--radius-full)', // 9999px
} as const

export const transition = {
  fast:  'var(--transition-fast)',                               // 150ms ease
  base:  'var(--transition-base)',                               // 300ms ease
  slow:  'var(--transition-slow)',                               // 500ms ease
  cyber: 'all var(--duration-normal) var(--ease-cyber)',         // cubic-bezier cyberpunk
} as const

export const font = {
  display: 'var(--font-display)', // Rajdhani / Orbitron
  body:    'var(--font-body)',    // Exo 2
  mono:    'var(--font-mono)',    // JetBrains Mono
} as const
