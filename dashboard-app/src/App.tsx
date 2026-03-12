import { useState } from 'react';
import {
  Eye, Library, Tag, Star, FileText,
  Megaphone, Scissors, Video, Hash, Gift, Package,
  Layers, Lightbulb, Type, Film, Wifi, Briefcase,
} from 'lucide-react';
import { G, Btn } from './design-system';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ModeProvider } from './store/modeContext';
import { CentralControle } from './pages/CentralControle';
import { MapaAgentes } from './pages/MapaAgentes';
import { FluxoSistema } from './pages/FluxoSistema';
import { SeletorModo } from './pages/SeletorModo';
import { ConcorrentesIGaming } from './pages/ConcorrentesIGaming';
import { GrandesMarcas } from './pages/GrandesMarcas';
import { RadarTendencias } from './pages/RadarTendencias';
import { CalendarioCampanhas } from './pages/CalendarioCampanhas';
import { PlaceholderPage } from './pages/PlaceholderPage';
import './index.css';

// --- CONFIGURAÇÃO DE PÁGINAS ---

const pageConfig: Record<string, { title: string; description: string }> = {
  central:           { title: 'Central de Controle',      description: 'Visão geral em tempo real da operação.' },
  agentes:           { title: 'Mapa de Agentes',           description: 'Monitore todos os agentes e o organograma.' },
  fluxo:             { title: 'Fluxo do Sistema',          description: 'Visualize como os dados fluem desde a fonte até o output.' },
  seletor:           { title: 'Seletor de Modo',           description: 'Escolha a fonte de inteligência do sistema.' },
  modo_igaming:      { title: 'Modo iGaming',              description: 'Configurações e fontes ativas no Modo iGaming.' },
  modo_marcas:       { title: 'Modo Grandes Marcas',       description: 'Configurações e fontes ativas no Modo Grandes Marcas.' },
  radar_videos:      { title: 'Radar de Vídeos Virais',    description: 'Vídeos virais detectados no modo ativo.' },
  biblioteca_anuncios: { title: 'Biblioteca de Anúncios', description: 'Anúncios analisados por concorrentes e marcas.' },
  fontes:            { title: 'Fontes Monitoradas',        description: 'Todas as fontes ativas de mineração de dados.' },
  sugestoes_formatos: { title: 'Sugestões de Formatos',   description: 'Formatos virais identificados pelos agentes.' },
  concorrentes:      { title: 'Concorrentes iGaming',      description: 'Análise completa por Tier Alto e Tier Médio.' },
  grandes_marcas:    { title: 'Grandes Marcas',            description: 'Referências das maiores marcas do Brasil adaptadas para iGaming.' },
  ofertas_alta:      { title: 'Ofertas em Alta',           description: 'Ofertas com maior performance detectadas.' },
  hooks_alta:        { title: 'Hooks em Alta',             description: 'Hooks com maior engajamento no período.' },
  formatos_alta:     { title: 'Formatos em Alta',          description: 'Formatos de conteúdo com maior viralidade.' },
  roteiros:          { title: 'Gerador de Roteiros',       description: 'Scripts gerados pelo Cérebro Criativo.' },
  campanha:          { title: 'Ideias de Campanha',        description: 'Campanhas completas sugeridas para iGaming.' },
  formato:           { title: 'Ideias de Formato',         description: 'Formatos adaptados para cada plataforma.' },
  copy:              { title: 'Sugestões de Copy',         description: 'Textos e legendas gerados pela IA.' },
  cortes:            { title: 'Cortes de Live',            description: 'Cortes automáticos dos melhores momentos.' },
  editor:            { title: 'Editor de Vídeo',           description: 'Edite e monte criativos em vídeo.' },
  clipes:            { title: 'Clipes Gerados',            description: 'Biblioteca de clipes prontos para publicar.' },
  hooks:             { title: 'Hooks',                     description: 'Banco de hooks validados por funil.' },
  lib_ofertas:       { title: 'Ofertas',                   description: 'Catálogo de ofertas prontas.' },
  templates:         { title: 'Templates',                  description: 'Templates de criativos e roteiros.' },
  portfolio:         { title: 'Portfólio Criativo',        description: 'Todo o material produzido organizado.' },
};

const iconMap: Record<string, any> = {
  modo_igaming: Tag, modo_marcas: Star,
  radar_videos: Video, biblioteca_anuncios: Library,
  fontes: Wifi, sugestoes_formatos: Layers,
  ofertas_alta: Gift, hooks_alta: TrendingUpIcon, formatos_alta: Layers,
  roteiros: FileText, campanha: Megaphone, formato: Lightbulb, copy: Type,
  cortes: Scissors, editor: Film, clipes: Video,
  hooks: Hash, lib_ofertas: Tag, templates: Package, portfolio: Briefcase,
};

function TrendingUpIcon(props: any) {
  return <Eye {...props} />;
}

const colorMap: Record<string, string> = {
  modo_igaming: G.colors.primary, modo_marcas: G.colors.secondary,
  radar_videos: '#FF0050', biblioteca_anuncios: G.colors.warning,
  fontes: G.colors.success, sugestoes_formatos: G.colors.primary,
  ofertas_alta: G.colors.success, hooks_alta: G.colors.warning, formatos_alta: G.colors.primary,
  roteiros: G.colors.secondary, campanha: G.colors.warning, formato: G.colors.primary, copy: G.colors.copy,
  cortes: G.colors.copy, editor: G.colors.primary, clipes: G.colors.success,
  hooks: G.colors.primary, lib_ofertas: G.colors.warning, templates: G.colors.secondary, portfolio: G.colors.success,
};

const specialPages = ['central', 'agentes', 'fluxo', 'seletor', 'concorrentes', 'grandes_marcas', 'radar_videos'];

// --- APP INTERNO (dentro do ModeProvider) ---

function AppInner() {
  const [activeTab, setActiveTab] = useState('central');
  const currentPage = pageConfig[activeTab];
  const isSpecialPage = specialPages.includes(activeTab);

  return (
    <>
      <style>{`
        .shake-anim { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }
        .btn-hover { transition: all 0.2s !important; }
        .btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="app-layout">
        <TopBar />
        <div className="dashboard-grid">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', animationDelay: '0.1s', overflowY: 'auto', paddingRight: '4px' }}>
            {/* Header */}
            <header className="glass-panel responsive-header">
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{currentPage?.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '600px', lineHeight: '1.5' }}>
                  {currentPage?.description}
                </p>
              </div>
              <div className="responsive-header-actions">
                {!isSpecialPage && iconMap[activeTab] && (
                  <Btn icon={iconMap[activeTab]} label="Ativar" variant="primary" />
                )}
              </div>
            </header>

            {/* Páginas construídas */}
            {activeTab === 'central'      && <CentralControle />}
            {activeTab === 'agentes'      && <MapaAgentes />}
            {activeTab === 'fluxo'        && <FluxoSistema />}
            {activeTab === 'seletor'      && <SeletorModo />}
            {activeTab === 'concorrentes' && <ConcorrentesIGaming />}
            {activeTab === 'grandes_marcas' && <GrandesMarcas />}
            {activeTab === 'radar_videos' && <RadarTendencias />}
            {activeTab === 'calendario'   && <CalendarioCampanhas />}

            {/* Placeholders */}
            {!isSpecialPage && activeTab !== 'calendario' && iconMap[activeTab] && (
              <PlaceholderPage
                title={currentPage?.title}
                icon={iconMap[activeTab]}
                color={colorMap[activeTab]}
                description={currentPage?.description}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

// --- APP ROOT ---

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  return (
    <ModeProvider>
      <AppInner />
    </ModeProvider>
  );
}

export default App;
