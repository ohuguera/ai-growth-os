import { Zap } from 'lucide-react';
import { GlassCard, Btn } from '../design-system';

export const PlaceholderPage = ({ title, icon: Icon, color, description }: {
  title: string;
  icon: any;
  color: string;
  description: string;
}) => (
  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <GlassCard style={{ textAlign: 'center', padding: '60px 40px' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <Icon size={40} color={color} />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>{title}</h2>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>{description}</p>
      <Btn icon={Zap} label="Em Breve — Notifique-me" variant="primary" />
    </GlassCard>
  </div>
);
