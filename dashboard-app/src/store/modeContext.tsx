import { createContext, useContext, useState, type ReactNode } from 'react';

export type Mode = 'igaming' | 'grandes_marcas';

export interface ModeConfig {
  id: Mode;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  sources: string[];
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  igaming: {
    id: 'igaming',
    label: 'Modo iGaming',
    emoji: '🎰',
    color: '#0A84FF',
    gradient: 'linear-gradient(135deg, #0A84FF, #30D158)',
    description: 'Alimentado por concorrentes bet, bibliotecas de anúncios e vídeos virais de iGaming',
    sources: ['Concorrentes Bet', 'Biblioteca de Anúncios iGaming', 'TikTok Betting', 'Instagram Reels Bet', 'YouTube Shorts Casino'],
  },
  grandes_marcas: {
    id: 'grandes_marcas',
    label: 'Modo Grandes Marcas',
    emoji: '🏢',
    color: '#BF5AF2',
    gradient: 'linear-gradient(135deg, #BF5AF2, #FF9500)',
    description: 'Alimentado pelas 30 maiores marcas do Brasil — adaptado para iGaming',
    sources: ['Grandes Marcas BR', 'Biblioteca de Anúncios Premium', 'TikTok Marcas', 'Instagram Reels Marcas', 'YouTube Shorts Brands'],
  },
};

interface ModeContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  config: ModeConfig;
}

const ModeContext = createContext<ModeContextType>({
  mode: 'igaming',
  setMode: () => {},
  config: MODE_CONFIG.igaming,
});

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('igaming');
  return (
    <ModeContext.Provider value={{ mode, setMode, config: MODE_CONFIG[mode] }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
