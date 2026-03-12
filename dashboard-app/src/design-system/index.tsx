import { type ReactNode } from 'react';

// --- DESIGN SYSTEM ---

export const G = {
  colors: {
    primary: '#0A84FF',
    secondary: '#BF5AF2',
    success: '#32D74B',
    warning: '#FF9500',
    danger: '#FF3B30',
    copy: '#FF2D55',
    background: '#000000',
    glass: 'rgba(28, 28, 30, 0.4)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    tiktok: '#FF0050',
    instagram: '#E1306C',
    youtube: '#FF0000',
  }
};

export const Btn = ({ icon: Icon, label, variant = 'primary', onClick, small }: {
  icon?: any;
  label: string;
  variant?: string;
  onClick?: () => void;
  small?: boolean;
}) => {
  const base: any = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: small ? '7px 12px' : '10px 16px',
    borderRadius: '8px', border: 'none', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s', fontSize: small ? '12px' : '14px',
    whiteSpace: 'nowrap'
  };
  const vs: any = {
    primary: { background: G.colors.primary, color: '#fff' },
    secondary: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${G.colors.glassBorder}` },
    glass: { background: G.colors.glass, color: '#fff', backdropFilter: 'blur(10px)' },
    action: { background: 'linear-gradient(135deg, #FF9500, #FF2D55)', color: '#fff' },
    dark: { background: '#1c1c1e', color: '#fff', border: `1px solid ${G.colors.glassBorder}` },
    success: { background: G.colors.success, color: '#000' },
    purple: { background: G.colors.secondary, color: '#fff' },
    tiktok: { background: G.colors.tiktok, color: '#fff' },
    instagram: { background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff' },
    youtube: { background: G.colors.youtube, color: '#fff' },
  };
  return (
    <button style={{ ...base, ...vs[variant] }} onClick={onClick} className="btn-hover">
      {Icon && <Icon size={small ? 14 : 18} />}
      {label}
    </button>
  );
};

export const GlassCard = ({ children, style }: { children: ReactNode; style?: any }) => (
  <div className="glass-panel" style={style}>{children}</div>
);

export const Badge = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    background: `${color}20`, color, border: `1px solid ${color}40`,
    borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700',
    letterSpacing: '0.5px'
  }}>{label}</span>
);
