export interface Competitor {
  name: string;
  tier: 'alto' | 'médio';
  focus: string[];
  adTypes: string[];
  hooks: string[];
  strengths: string;
  color: string;
}

export const tierAlto: Competitor[] = [
  { name: 'Bet365', tier: 'alto', focus: ['Esportes', 'Casino', 'Live'], adTypes: ['Vídeo UGC', 'Influencer', 'TV'], hooks: ['Odds ao vivo', 'Cash Out instantâneo'], strengths: 'Brand global, fluxo de depósito otimizado', color: '#28A745' },
  { name: 'Betano', tier: 'alto', focus: ['Futebol BR', 'Cassino', 'Slots'], adTypes: ['Reels', 'TikTok', 'YouTube'], hooks: ['Bônus de boas-vindas', 'Giros grátis'], strengths: 'Forte em futebol nacional e patrocínios', color: '#E30613' },
  { name: 'Stake', tier: 'alto', focus: ['Cassino', 'Crypto', 'Esportes'], adTypes: ['Influencer', 'Twitch', 'YouTube'], hooks: ['Transparência de odds', 'Jogos exclusivos'], strengths: 'Comunidade crypto forte, streamer partnerships', color: '#00D4AA' },
  { name: 'Sportingbet', tier: 'alto', focus: ['Esportes', 'Futebol', 'Tênis'], adTypes: ['TV', 'Digital', 'OOH'], hooks: ['Apostas múltiplas', 'Mercados especiais'], strengths: 'Tradição e reconhecimento de marca', color: '#FF6B00' },
  { name: 'Novibet', tier: 'alto', focus: ['Casino', 'Esportes', 'Ao Vivo'], adTypes: ['Reels', 'Influencer'], hooks: ['Cashback semanal', 'Torneios'], strengths: 'Interface mobile superior', color: '#7B2FBE' },
  { name: 'Pixbet', tier: 'alto', focus: ['Esportes', 'PIX rápido', 'Casino'], adTypes: ['TikTok', 'YouTube Shorts'], hooks: ['Depósito via PIX', 'Saque rápido'], strengths: 'Pioneiro no PIX, foco em velocidade', color: '#00B4D8' },
  { name: 'Betnacional', tier: 'alto', focus: ['Futebol BR', 'Casino'], adTypes: ['TV', 'Influencer BR'], hooks: ['Odds do brasileirão', 'Bônus regional'], strengths: 'Foco 100% no mercado brasileiro', color: '#009C3B' },
  { name: 'KTO', tier: 'alto', focus: ['Esportes', 'Casino', 'Poker'], adTypes: ['Reels', 'Google Ads'], hooks: ['Cashback diário', 'Odds competitivas'], strengths: 'Programa de fidelidade diferenciado', color: '#FF4500' },
  { name: 'Betfair', tier: 'alto', focus: ['Exchange', 'Esportes', 'Casino'], adTypes: ['Search', 'Display', 'Email'], hooks: ['Lay betting', 'Câmbio de odds'], strengths: 'Único exchange de apostas relevante no BR', color: '#FF8C00' },
  { name: 'Rivalo', tier: 'alto', focus: ['Casino', 'Esportes', 'Slots'], adTypes: ['Influencer', 'Afiliados'], hooks: ['Slot exclusivo', 'Giros diários'], strengths: 'Forte em afiliados e parcerias', color: '#C0392B' },
  { name: '1xBet', tier: 'alto', focus: ['Esportes', 'Casino', 'eSports'], adTypes: ['Afiliados', 'YouTube', 'TikTok'], hooks: ['eSports betting', 'Odds altas'], strengths: 'Catálogo enorme, cobertura de eSports', color: '#1A73E8' },
  { name: 'Parimatch', tier: 'alto', focus: ['eSports', 'Esportes', 'Casino'], adTypes: ['YouTube', 'Twitch', 'TikTok'], hooks: ['eSports ao vivo', 'Cripto pagamentos'], strengths: 'Referência em eSports betting', color: '#FFD700' },
  { name: 'Superbet', tier: 'alto', focus: ['Esportes', 'Casino', 'Slots'], adTypes: ['TV', 'OOH', 'Digital'], hooks: ['Super odds', 'Apostas combinadas'], strengths: 'Expansão agressiva no mercado BR', color: '#E91E63' },
  { name: 'Betway', tier: 'alto', focus: ['Esportes', 'Casino', 'Poker'], adTypes: ['Patrocínio', 'TV', 'Digital'], hooks: ['Patrocínio de times', 'Cashback'], strengths: 'Patrocínios esportivos de alto impacto', color: '#00897B' },
  { name: 'Bet7K', tier: 'alto', focus: ['Casino', 'Slots', 'Futebol'], adTypes: ['Influencer', 'TikTok'], hooks: ['Bônus diários', 'Slots premium'], strengths: 'Crescimento acelerado via influencers', color: '#6C63FF' },
  { name: 'Esportes da Sorte', tier: 'alto', focus: ['Futebol BR', 'Casino'], adTypes: ['Patrocínio', 'TV Aberta'], hooks: ['Patrocínio Club BR', 'Odds especiais'], strengths: 'Maior patrocínio de camisa no BR', color: '#FF1744' },
  { name: 'EstrelaBet', tier: 'alto', focus: ['Casino', 'Esportes', 'Ao Vivo'], adTypes: ['TV', 'YouTube', 'Influencer'], hooks: ['Estrela do dia', 'Jackpot'], strengths: 'Forte presença em TV aberta', color: '#FFC107' },
  { name: 'Betmotion', tier: 'alto', focus: ['Casino', 'Slots', 'Cassino ao vivo'], adTypes: ['Afiliados', 'Display'], hooks: ['Roleta exclusiva', 'VIP club'], strengths: 'Especialista em casino online', color: '#9C27B0' },
  { name: 'Betsul', tier: 'alto', focus: ['Esportes', 'Casino', 'Futebol'], adTypes: ['Influencer', 'YouTube'], hooks: ['Odds futebol BR', 'Bônus primeiro dep.'], strengths: 'Interface simples, foco em futebol', color: '#F44336' },
  { name: 'Casa de Apostas', tier: 'alto', focus: ['Futebol', 'Casino', 'Esportes'], adTypes: ['Afiliados', 'SEO', 'Display'], hooks: ['Odds ao vivo', 'Mercados locais'], strengths: 'Presença sólida em SEO e afiliados', color: '#4CAF50' },
];

export const tierMedio: Competitor[] = [
  { name: 'Reals Bet', tier: 'médio', focus: ['Casino', 'Slots'], adTypes: ['TikTok', 'Influencer'], hooks: ['Giros reais', 'Bônus PIX'], strengths: 'Crescimento rápido via social', color: '#2196F3' },
  { name: 'Bingo Bet', tier: 'médio', focus: ['Bingo', 'Casino', 'Slots'], adTypes: ['Facebook', 'Display'], hooks: ['Bingo ao vivo', 'Rodadas grátis'], strengths: 'Nicho de bingo online', color: '#FF9800' },
  { name: 'Betão', tier: 'médio', focus: ['Esportes', 'Casino'], adTypes: ['Afiliados', 'Email'], hooks: ['Apostas mínimas baixas', 'Cashback'], strengths: 'Acessível para iniciantes', color: '#795548' },
  { name: 'VBet', tier: 'médio', focus: ['Esportes', 'Casino', 'eSports'], adTypes: ['YouTube', 'TikTok'], hooks: ['Virtual sports', 'eSports betting'], strengths: 'Virtual e eSports diferenciados', color: '#673AB7' },
  { name: 'Onabet', tier: 'médio', focus: ['Casino', 'Esportes'], adTypes: ['Afiliados', 'Display'], hooks: ['Bônus de retenção', 'Cashback'], strengths: 'Programa de afiliados robusto', color: '#009688' },
  { name: 'Betfast', tier: 'médio', focus: ['Esportes', 'PIX', 'Casino'], adTypes: ['TikTok', 'Reels'], hooks: ['Saque rápido', 'Odds ao vivo'], strengths: 'Velocidade de transação', color: '#FF5722' },
  { name: 'Cbet', tier: 'médio', focus: ['Crypto', 'Casino', 'Esportes'], adTypes: ['Comunidades crypto', 'YouTube'], hooks: ['Bitcoin betting', 'NFT recompensas'], strengths: 'Nicho de pagamentos cripto', color: '#F9A825' },
  { name: 'Playbonds', tier: 'médio', focus: ['Bingo', 'Slots', 'Casino'], adTypes: ['Facebook', 'Google'], hooks: ['Bingo gratuito', 'Torneios'], strengths: 'Fidelização de jogadores de bingo', color: '#E91E63' },
  { name: 'F12 Bet', tier: 'médio', focus: ['Futebol', 'Casino', 'eSports'], adTypes: ['YouTube', 'TikTok', 'Twitch'], hooks: ['Odds de eSports', 'Live casino'], strengths: 'Comunidade gamer forte', color: '#76FF03' },
  { name: 'Betwarrior', tier: 'médio', focus: ['Esportes', 'Casino'], adTypes: ['Afiliados', 'SEO'], hooks: ['Warrior bonus', 'Odds especiais'], strengths: 'SEO e conteúdo orgânico', color: '#F44336' },
  { name: 'Pagbet', tier: 'médio', focus: ['Casino', 'Slots', 'PIX'], adTypes: ['TikTok', 'Instagram'], hooks: ['Saque no mesmo dia', 'PIX instantâneo'], strengths: 'Foco em experiência de pagamento', color: '#00BCD4' },
  { name: 'LuvaBet', tier: 'médio', focus: ['Esportes', 'Casino'], adTypes: ['Influencer', 'Reels'], hooks: ['Bônus de boas-vindas', 'Freebet'], strengths: 'Marketing de influência agressivo', color: '#FF4081' },
  { name: 'Sortenabet', tier: 'médio', focus: ['Casino', 'Sorte', 'Slots'], adTypes: ['Facebook', 'Display'], hooks: ['Rodadas da sorte', 'Jackpot'], strengths: 'Tema de sorte e entretenimento', color: '#FFEB3B' },
  { name: 'Upbet', tier: 'médio', focus: ['Esportes', 'Casino'], adTypes: ['Google', 'Display'], hooks: ['Up no depósito', 'Boost de odds'], strengths: 'Boost de odds diferenciado', color: '#8BC34A' },
  { name: 'SpinBet', tier: 'médio', focus: ['Slots', 'Casino', 'Giros'], adTypes: ['Reels', 'TikTok'], hooks: ['Spin grátis diário', 'Mega giro'], strengths: 'Especialista em slots e giros', color: '#9C27B0' },
  { name: 'WinBet', tier: 'médio', focus: ['Esportes', 'Casino'], adTypes: ['Afiliados', 'Email'], hooks: ['Win mais', 'Odds vencedoras'], strengths: 'Foco em conversão de afiliados', color: '#4CAF50' },
  { name: 'FastBet', tier: 'médio', focus: ['PIX', 'Casino', 'Slots'], adTypes: ['TikTok', 'YouTube Shorts'], hooks: ['Depósito 5 segundos', 'Saque express'], strengths: 'Velocidade como diferencial principal', color: '#FF6D00' },
  { name: 'MegaBet', tier: 'médio', focus: ['Casino', 'Jackpot', 'Slots'], adTypes: ['Display', 'YouTube'], hooks: ['Mega jackpot', 'Prêmio acumulado'], strengths: 'Jackpots de alto valor', color: '#D32F2F' },
  { name: 'ApostaGanha', tier: 'médio', focus: ['Futebol', 'Esportes BR'], adTypes: ['Afiliados', 'Facebook'], hooks: ['Aposta certa', 'Ganhos garantidos'], strengths: 'Foco em apostadores de futebol', color: '#1B5E20' },
  { name: 'Betbra', tier: 'médio', focus: ['Esportes BR', 'Casino'], adTypes: ['SEO', 'Afiliados'], hooks: ['100% brasileiro', 'Odds locais'], strengths: 'Posicionamento 100% nacional', color: '#0D47A1' },
];
