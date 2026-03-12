import { useState } from 'react';
import { Calendar, Target, Megaphone, FileText, Plus, Clock, ChevronRight, Lightbulb, CircleDashed } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { events, type CalendarEvent } from '../data/events';

const EventCard = ({ event }: { event: CalendarEvent }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard style={{ padding: '20px', border: `1px solid ${event.categoryColor}20` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>{event.emoji}</div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px' }}>{event.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              <Clock size={12} /> {event.date}
            </div>
            <Badge label={event.category} color={event.categoryColor} />
          </div>
        </div>
      </div>

      {/* Campaign */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>SUGESTÃO DE CAMPANHA</div>
        <p style={{ fontSize: '13px', lineHeight: '1.5' }}>{event.campaign}</p>
      </div>

      {/* Offer */}
      <div style={{ background: `${G.colors.success}08`, border: `1px solid ${G.colors.success}20`, borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', color: G.colors.success, fontWeight: '700', marginBottom: '4px' }}>🎁 SUGESTÃO DE OFERTA</div>
        <p style={{ fontSize: '13px', lineHeight: '1.5' }}>{event.offer}</p>
      </div>

      {/* Ideas expandable */}
      {expanded && (
        <div className="fade-in" style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: G.colors.warning, fontWeight: '700', marginBottom: '8px' }}>💡 IDEIAS DE CONTEÚDO</div>
          {event.suggestions.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
              <ChevronRight size={12} color={G.colors.warning} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
        <Btn icon={FileText} label="Gerar Roteiro" variant="primary" small />
        <Btn icon={Megaphone} label="Criar Campanha" variant="action" small />
        <Btn icon={ImageIcon} label="Gerar Criativos" variant="purple" small />
        <Btn
          icon={expanded ? CircleDashed : Lightbulb}
          label={expanded ? 'Recolher' : 'Ver Ideias'}
          variant="dark"
          small
          onClick={() => setExpanded(!expanded)}
        />
      </div>
    </GlassCard>
  );
};

export const CalendarioCampanhas = () => {
  const [monthFilter, setMonthFilter] = useState('Todos');
  const months = ['Todos', ...Array.from(new Set(events.map(e => e.month)))];
  const filtered = monthFilter === 'Todos' ? events : events.filter(e => e.month === monthFilter);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <GlassCard style={{ background: 'linear-gradient(135deg,rgba(255,45,85,0.15),rgba(255,149,0,0.1))', border: '1px solid rgba(255,45,85,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#FF2D55,#FF9500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={26} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Calendário de Campanhas 2026</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Planeje suas campanhas iGaming com antecedência</p>
            </div>
          </div>
          <Btn icon={Plus} label="Adicionar Evento" variant="action" />
        </div>
      </GlassCard>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Eventos Planejados', value: '6', color: G.colors.copy, icon: Calendar },
          { label: 'Campanhas Sugeridas', value: '6', color: G.colors.warning, icon: Megaphone },
          { label: 'Oportunidades', value: '18', color: G.colors.success, icon: Target },
        ].map(s => (
          <GlassCard key={s.label} style={{ textAlign: 'center', padding: '20px' }}>
            <s.icon size={28} color={s.color} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Month Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {months.map(m => (
          <button key={m} onClick={() => setMonthFilter(m)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: monthFilter === m ? G.colors.copy : 'rgba(255,255,255,0.08)',
            color: monthFilter === m ? '#fff' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filtered.map((e, i) => <EventCard key={i} event={e} />)}
      </div>
    </div>
  );
};
