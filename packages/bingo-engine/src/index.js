// =============================================================================
// BINGO! FÁBRICA DE CRIATIVOS 2.0 - Motor de Inteligência
// =============================================================================
// Este arquivo é o ponto de entrada do motor. Ele demonstra a conexão
// com os 3 cérebros instalados: Claude (Anthropic), Gemini (Google) e
// o orquestrador LangChain.
// Para funcionarem, você precisa configurar as chaves de API no .env
// =============================================================================

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- 1. CLAUDE (Anthropic) - Responsável por Hooks e Copy Criativa ---
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- 2. GEMINI (Google) - Responsável por Análise e Retenção de Vídeo ---
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 3. Funções de Teste de Conexão ---
async function testClaude() {
  console.log('\n🤖 [CLAUDE] Testando conexão...');
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️  ANTHROPIC_API_KEY não configurada no .env');
    return;
  }
  try {
    const msg = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Diga apenas: Motor Bingo conectado com sucesso!' }],
    });
    console.log('✅ [CLAUDE] Online:', msg.content[0].text);
  } catch (e) {
    console.log('❌ [CLAUDE] Erro:', e.message);
  }
}

async function testGemini() {
  console.log('\n🔵 [GEMINI] Testando conexão...');
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY não configurada no .env');
    return;
  }
  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Diga apenas: Motor Bingo conectado com sucesso!');
    console.log('✅ [GEMINI] Online:', result.response.text());
  } catch (e) {
    console.log('❌ [GEMINI] Erro:', e.message);
  }
}

// --- 4. Inicialização do Motor ---
console.log('='.repeat(60));
console.log('🎬 BINGO! FÁBRICA DE CRIATIVOS 2.0 - Motor de IA');
console.log('='.repeat(60));
console.log('📦 Pacotes instalados:');
console.log('   ✅ @anthropic-ai/sdk (Claude)');
console.log('   ✅ @google/generative-ai (Gemini)');
console.log('   ✅ langchain + @langchain/anthropic + @langchain/google-genai');
console.log('\n⚙️  Para ativar os cérebros, configure o .env com suas chaves de API.');
console.log('   Copie .env.example para .env e adicione: ANTHROPIC_API_KEY e GEMINI_API_KEY\n');

// Executar testes de conexão se as chaves existirem
await testClaude();
await testGemini();

console.log('\n' + '='.repeat(60));
console.log('Motor encerrado. Pronto para integração com os Agentes!');
console.log('='.repeat(60));

