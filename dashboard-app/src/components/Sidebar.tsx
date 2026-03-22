import { useState } from 'react';
import {
  LayoutDashboard, Map, GitBranch, Sliders,
  Video, Library, Wifi, Layers,
  Eye, Star, TrendingUp, Zap, Tag,
  FileText, Megaphone, Lightbulb, Type,
  Scissors, Film, Tv,
  Hash, Gift, Package, Briefcase,
  CalendarCheck, ListChecks, PenLine,
  Bot, ChevronDown,
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
      { id: 'cortador_ia', label: 'Cortador IA', icon: Zap, color: '#BF5AF2' },
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
  {
    title: 'SISTEMA',
    items: [
      { id: 'agente_revisao', label: 'Agente de Revisao', icon: Bot, color: '#BF5AF2' },
    ]
  },
];

// Seções abertas por padrão ao carregar
const DEFAULT_OPEN = new Set(['MEU DIA']);

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  const { mode, config } = useMode();

  // Abre automaticamente a seção que contém a aba ativa
  const activeSection = sidebarSections.find(s => s.items.some(i => i.id === activeTab))?.title;
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set(DEFAULT_OPEN);
    if (activeSection) initial.add(activeSection);
    return initial;
  });

  function toggleSection(title: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  // Quando a aba ativa muda, garante que a seção dela está aberta
  const handleNavClick = (id: string, sectionTitle: string) => {
    setOpenSections(prev => {
      if (prev.has(sectionTitle)) return prev;
      return new Set([...prev, sectionTitle]);
    });
    setActiveTab(id);
  };

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
        {sidebarSections.map(section => {
          const isOpen = openSections.has(section.title);
          // Conta quantos itens visíveis (respeitando modeOnly)
          const visibleItems = section.items.filter(i => {
            const modeOnly = (i as any).modeOnly;
            return !modeOnly || modeOnly === mode;
          });
          // Verifica se algum item desta seção está ativo
          const hasActive = visibleItems.some(i => i.id === activeTab);

          return (
            <div key={section.title} style={{ marginTop: '6px' }}>
              {/* Cabeçalho clicável da seção */}
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: hasActive
                    ? 'rgba(255,255,255,0.06)'
                    : isOpen ? 'rgba(255,255,255,0.03)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontSize: '9px', textTransform: 'uppercase',
                  color: hasActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                  fontWeight: '700', letterSpacing: '1.5px',
                }}>
                  {section.title}
                </span>
                <ChevronDown
                  size={12}
                  color={hasActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                />
              </button>

              {/* Itens da seção (colapsáveis) */}
              {isOpen && (
                <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {visibleItems.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNavClick(item.id, section.title)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
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
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
