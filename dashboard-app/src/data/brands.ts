export interface Brand {
  name: string;
  sector: string;
  emoji: string;
  color: string;
  adStyle: string;
  hooks: string[];
  igamingAdaptation: string;
}

export const majorBrands: Brand[] = [
  { name: 'Nubank', sector: 'Fintech', emoji: '💜', color: '#8A05BE', adStyle: 'Educativo, transparente, anti-banco', hooks: ['Sem anuidade', 'Controle na palma da mão'], igamingAdaptation: 'Transparência nas odds, zero taxas escondidas' },
  { name: 'iFood', sector: 'Delivery', emoji: '🍔', color: '#EA1D2C', adStyle: 'Urgência, conveniência, velocidade', hooks: ['Entrega em 30 min', 'Peça agora'], igamingAdaptation: 'Saque rápido, depósito instantâneo' },
  { name: 'Mercado Livre', sector: 'E-commerce', emoji: '🛒', color: '#FFE600', adStyle: 'Variedade, confiança, preço', hooks: ['Frete grátis', 'Melhor preço garantido'], igamingAdaptation: 'Catálogo de jogos, melhor bônus garantido' },
  { name: 'Uber', sector: 'Mobilidade', emoji: '🚗', color: '#000000', adStyle: 'Conveniência, presença, facilidade', hooks: ['Peça seu carro', 'Chegou em 3 min'], igamingAdaptation: 'Jogue onde estiver, acesso imediato' },
  { name: 'Amazon', sector: 'E-commerce / Tech', emoji: '📦', color: '#FF9900', adStyle: 'Velocidade, confiança, Prime', hooks: ['Entrega amanhã', 'Prime grátis por 30 dias'], igamingAdaptation: 'Bônus instantâneo, VIP club exclusivo' },
  { name: 'Cimed', sector: 'Farmácia', emoji: '💊', color: '#E30613', adStyle: 'Emocional, família, cuidado', hooks: ['Sua saúde em primeiro lugar', 'Qualidade comprovada'], igamingAdaptation: 'Jogue com responsabilidade, cuide do seu bankroll' },
  { name: 'Magazine Luiza', sector: 'Varejo', emoji: '🛍️', color: '#0066CC', adStyle: 'Popular, acessível, parcelamento', hooks: ['Parcelou no Magalu', 'Tá na Magalu, tá barato'], igamingAdaptation: 'Depósito mínimo baixo, bônus parcelado' },
  { name: 'Natura', sector: 'Beleza / Cosméticos', emoji: '🌿', color: '#FF6B35', adStyle: 'Sustentabilidade, empoderamento, propósito', hooks: ['Bem estar bem', 'Feito de você'], igamingAdaptation: 'Play responsável, experiência premium' },
  { name: 'O Boticário', sector: 'Beleza / Perfumaria', emoji: '🌸', color: '#C8102E', adStyle: 'Emocional, presenteie, momentos', hooks: ['Presenteie com amor', 'Cheiros que marcam'], igamingAdaptation: 'Recompensas que marcam, bônus que ficam na memória' },
  { name: 'Itaú', sector: 'Banco', emoji: '🏦', color: '#EC7000', adStyle: 'Confiança, família, futuro', hooks: ['Feito pra você', 'Muda pra melhor'], igamingAdaptation: 'Pagamentos seguros, confiança em cada transação' },
  { name: 'Bradesco', sector: 'Banco', emoji: '🏦', color: '#CC092F', adStyle: 'Tradição, segurança, parceria', hooks: ['Presença real', 'Banco dos brasileiros'], igamingAdaptation: 'Segurança máxima, seu dinheiro protegido' },
  { name: 'Vivo', sector: 'Telecom', emoji: '📱', color: '#660099', adStyle: 'Conexão, velocidade, cobertura', hooks: ['Melhor rede 5G', 'Conectado sempre'], igamingAdaptation: 'Streaming de jogos sem travar, conexão garantida' },
  { name: 'Claro', sector: 'Telecom', emoji: '📡', color: '#DA291C', adStyle: 'Velocidade, multi-serviços', hooks: ['Internet mais rápida', 'Tudo numa conta'], igamingAdaptation: 'Apostas ao vivo sem lag, velocidade máxima' },
  { name: 'Ambev', sector: 'Bebidas', emoji: '🍺', color: '#F7941D', adStyle: 'Celebração, amigos, momentos', hooks: ['Beba com moderação', 'Celebre com amigos'], igamingAdaptation: 'Comemore cada win, compartilhe a vitória' },
  { name: 'Renner', sector: 'Moda', emoji: '👗', color: '#FF0000', adStyle: 'Moda, estilo, financiamento', hooks: ['Cartão Renner', 'Moda pra todo bolso'], igamingAdaptation: 'VIP exclusivo, tratamento especial pra quem joga' },
  { name: 'Casas Bahia', sector: 'Varejo', emoji: '🏠', color: '#0066FF', adStyle: 'Popular, crediário, acessível', hooks: ['Dedicação total a você', 'Parcela no crediário'], igamingAdaptation: 'Bônus acessível, deposite do jeito que quiser' },
  { name: 'Porto Seguro', sector: 'Seguros', emoji: '🛡️', color: '#003082', adStyle: 'Segurança, tranquilidade, proteção', hooks: ['Você no controle', 'Protegido sempre'], igamingAdaptation: 'Jogo seguro, plataforma confiável e regulamentada' },
  { name: 'Banco do Brasil', sector: 'Banco', emoji: '🏛️', color: '#FFCC00', adStyle: 'Brasileiro, tradição, agro', hooks: ['Pra quem faz o Brasil', 'Banco de todos'], igamingAdaptation: 'Plataforma do povo brasileiro, apostas de todo tipo' },
  { name: 'Petrobras', sector: 'Energia', emoji: '⛽', color: '#006400', adStyle: 'Orgulho nacional, sustentabilidade', hooks: ['Energia do Brasil', 'Movendo o futuro'], igamingAdaptation: 'Energia pra jogar, combustível pra ganhar' },
  { name: 'JBS', sector: 'Alimentos', emoji: '🥩', color: '#CC0000', adStyle: 'Qualidade, confiança, escala', hooks: ['Alimentando o mundo', 'Da fazenda pra mesa'], igamingAdaptation: 'Alimentando sua estratégia de jogo' },
  { name: 'Vale', sector: 'Mineração', emoji: '⛏️', color: '#007A4C', adStyle: 'Força, escala, sustentabilidade', hooks: ['Transformando o mundo', 'Minerando o futuro'], igamingAdaptation: 'Mine suas vitórias, extraia o máximo de cada aposta' },
  { name: 'Embraer', sector: 'Aeronáutica', emoji: '✈️', color: '#005DAA', adStyle: 'Precisão, inovação, orgulho', hooks: ['Voando alto', 'Feito no Brasil'], igamingAdaptation: 'Precisão nas odds, tecnologia de ponta' },
  { name: 'Localiza', sector: 'Mobilidade', emoji: '🚙', color: '#00A859', adStyle: 'Conveniência, mobilidade, confiança', hooks: ['Chegue aonde quiser', 'Alugue com facilidade'], igamingAdaptation: 'Mobilidade total, jogue de onde quiser' },
  { name: 'Totvs', sector: 'Tech / Software', emoji: '💻', color: '#E30613', adStyle: 'Eficiência, digitalização, Brasil', hooks: ['Tecnologia que conecta', 'Gestão simples'], igamingAdaptation: 'Painel de controle das suas apostas, gestão inteligente' },
  { name: 'Raia Drogasil', sector: 'Farmácia', emoji: '💉', color: '#E52222', adStyle: 'Saúde, cuidado, conveniência', hooks: ['Saúde na sua mão', 'Mais de 2000 lojas'], igamingAdaptation: 'Sempre disponível, suporte 24h para jogadores' },
  { name: 'XP Investimentos', sector: 'Fintech / Investimentos', emoji: '📈', color: '#FF6B00', adStyle: 'Liberdade financeira, rendimento', hooks: ['Invista no seu futuro', 'Rendimento real'], igamingAdaptation: 'Invista no bônus certo, rendimento no bankroll' },
  { name: 'Tim', sector: 'Telecom', emoji: '📲', color: '#00AAFF', adStyle: 'Conexão, preço, jovem', hooks: ['TIM Black é pra você', 'Conecte-se mais'], igamingAdaptation: 'Conectado ao jogo 24/7, sem interrupções' },
  { name: 'Unilever BR', sector: 'Bens de Consumo', emoji: '🧴', color: '#1D3C8C', adStyle: 'Propósito, marcas icônicas', hooks: ['Marcas que fazem a diferença', 'Para todos'], igamingAdaptation: 'Uma plataforma pra todos os gostos de jogo' },
  { name: 'Heinz', sector: 'Alimentos', emoji: '🍅', color: '#C8102E', adStyle: 'Qualidade inconfundível, clássico', hooks: ['Qualidade desde 1869', 'O original'], igamingAdaptation: 'O clássico das apostas, qualidade comprovada' },
  { name: 'Rappi', sector: 'Delivery / Super App', emoji: '🛵', color: '#FF441F', adStyle: 'Tudo em um, velocidade, super app', hooks: ['Qualquer coisa, Rappi', 'Em minutos'], igamingAdaptation: 'Super app de apostas, tudo que você precisa num só lugar' },
];
