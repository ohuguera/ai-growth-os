import {
  LayoutDashboard, Map, GitBranch, Sliders,
  Video, Library, Wifi, Layers,
  Eye, Star, TrendingUp, Zap, Tag,
  FileText, Megaphone, Lightbulb, Type,
  Scissors, Film, Tv,
  Hash, Gift, Package, Briefcase,
  CalendarCheck, ListChecks, PenLine,
} from 'lucide-react';
import { useMode } from '../store/modeContext';

export const sidebarSections = [
  {
    title: 'MEU DIA',
    items: [
      { id: 'hoje',       label: 'Hoje',           icon: CalendarCheck, color: '#0A84FF' },
      { id: 'producao',   label: 'Produção',        icon: ListChecks,    color: '#30D158' },
      { id: 'copy_roteiro', label: 'Copy & Roteiro', icon: PenLine,      color: '#FF2D55' },
    ]
  },
  {
    title: 'CENTRAL',
    items: [
      { id: 'central', label: 'Central de Controle', icon: LayoutDashboard, color: '#0A84FF' },
      { id: 'agentes', label: 'Mapa de Agentes', icon: Map, color: '#BF5AF2' },
      { id: 'fluxo', label: 'Fluxo do Sistema', icon: GitBranch, color: '#30D158' },
    ]
  },
  {
    title: 'MODO DE INTELIGÊNCIA',
    items: [
      { id: 'seletor', label: 'Seletor de Modo', icon: Sliders, color: '#FF9500' },
      { id: 'modo_igaming', label: 'Modo iGaming', icon: Zap, color: '#0A84FF', modeOnly: 'igaming' as const },
      { id: 'modo_marcas', label: 'Modo Grandes Marcas', icon: Star, color: '#BF5AF2', modeOnly: 'grandes_marcas' as const },
    ]
  },
  {
    title: 'MINERAÇÃO',
    items: [
      { id: 'radar_videos', label: 'Radar de Vídeos Virais', icon: Video, color: '#FF0050' },
      { id: 'biblioteca_anuncios', label: 'Biblioteca de Anúncios', icon: Library, color: '#FF9500' },
      { id: 'fontes', label: 'Fontes Monitoradas', icon: Wifi, color: '#30D158' },
      { id: 'sugestoes_formatos', label: 'Sugestões de Formatos', icon: Layers, color: '#0A84FF' },
    ]
  },
  {
    title: 'INTELIGÊNCIA',
    items: [
      { id: 'concorrentes', label: 'Concorrentes iGaming', icon: Eye, color: '#FF3B30' },
      { id: 'grandes_marcas', label: 'Grandes Marcas', icon: Star, color: '#BF5AF2' },
      { id: 'ofertas_alta', label: 'Ofertas em Alta', icon: Gift, color: '#32D74B' },
      { id: 'hooks_alta', label: 'Hooks em Alta', icon: TrendingUp, color: '#FF9500' },
      { id: 'formatos_alta', label: 'Formatos em Alta', icon: Layers, color: '#30D158' },
    ]
  },
  {
    title: 'CRIAÇÃO',
    items: [
      { id: 'roteiros', label: 'Gerador de Roteiros', icon: FileText, color: '#BF5AF2' },
      { id: 'campanha', label: 'Ideias de Campanha', icon: Megaphone, color: '#FF9500' },
      { id: 'formato', label: 'Ideias de Formato', icon: Lightbulb, color: '#0A84FF' },
      { id: 'copy', label: 'Sugestões de Copy', icon: Type, color: '#FF2D55' },
    ]
  },
  {
    title: 'PRODUÇÃO',
    items: [
      { id: 'cortes', label: 'Cortes de Live', icon: Scissors, color: '#FF2D55' },
      { id: 'editor', label: 'Editor de Vídeo', icon: Film, color: '#0A84FF' },
      { id: 'clipes', label: 'Clipes Gerados', icon: Tv, color: '#30D158' },
    ]
  },
  {
    title: 'BIBLIOTECA',
    items: [
      { id: 'hooks', label: 'Hooks', icon: Hash, color: '#0A84FF' },
      { id: 'lib_ofertas', label: 'Ofertas', icon: Tag, color: '#FF9500' },
      { id: 'templates', label: 'Templates', icon: Package, color: '#BF5AF2' },
      { id: 'portfolio', label: 'Portfólio Criativo', icon: Briefcase, color: '#32D74B' },
    ]
  },
];

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  const { mode, config } = useMode();

  return (
    <aside style={{
      background: 'rgba(28,28,30,0.4)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
      overflowY: 'auto', padding: '20px 14px', display: 'flex', flexDirection: 'column',
    }}>
      {/* Modo Badge */}
      <div style={{
        background: `${config.color}15`, border: `1px solid ${config.color}30`,
        borderRadius: '10px', padding: '10px 12px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color, boxShadow: `0 0 6px ${config.color}` }} />
        <span style={{ fontSize: '11px', fontWeight: '700', color: config.color }}>{config.label}</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {sidebarSections.map(section => (
          <div key={section.title}>
            <div style={{
              fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              fontWeight: '700', letterSpacing: '1.5px', marginTop: '18px', marginBottom: '4px',
              paddingLeft: '10px',
            }}>
              {section.title}
            </div>
            {section.items.map(item => {
              const modeOnly = (item as any).modeOnly;
              if (modeOnly && modeOnly !== mode) return null;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    background: isActive ? `${item.color}12` : 'transparent',
                  }}
                >
                  <item.icon size={14} color={isActive ? item.color : undefined} />
                  <span style={{ fontSize: '12px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};
