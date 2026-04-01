#!/usr/bin/env node
// ============================================================
// BINGO! AIOS — Chat Mode Terminal
// Comandos em linguagem natural → código → execução imediata
// Uso: node src/chat.js
// ============================================================

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Encontra o .env na raiz do projeto independente de onde o comando é rodado
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });
import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ── Cores ANSI ─────────────────────────────────────────────
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    white: '\x1b[97m',
    bg: '\x1b[48;5;17m',
};

const p = (...a) => process.stdout.write(a.join(' '));
const nl = () => process.stdout.write('\n');

// ── API Setup ───────────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
    console.error(`\n${c.red}✕ ANTHROPIC_API_KEY não encontrada no .env${c.reset}`);
    console.error(`${c.dim}  Adicione: ANTHROPIC_API_KEY=sk-ant-... no seu arquivo .env${c.reset}\n`);
    process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── System Prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é o AIOS Terminal Agent — o motor de execução inteligente do projeto "Bingo! Fábrica de Criativos 2.0".

CONTEXTO DO PROJETO:
- Sistema de automação de vídeos iGaming (Reals Bet, Bingo Bet, Experts de Aviator/Roleta)
- Stack: Node.js, React, TypeScript, FFmpeg, BullMQ, @anthropic-ai/sdk, @google/generative-ai
- Pasta raiz do projeto: packages/bingo-engine/

REGRAS DE RESPOSTA:
1. Sempre responda em PT-BR, de forma direta e técnica
2. Para qualquer pedido de código ou comando: gere SOMENTE o código relevante, sem explicações longas
3. Marque blocos executáveis com \`\`\`bash ou \`\`\`js conforme o tipo
4. Após o código, adicione uma linha no formato EXATO: EXEC: <comando para executar>
   Exemplo: EXEC: node src/meuArquivo.js
   Ou: EXEC: npm install pacote
5. Se for apenas consulta/explicação (sem código), NÃO coloque linha EXEC
6. Seja cirúrgico. Máximo de 30 linhas de código por resposta. Se for maior, quebre em etapas.`;

// ── Histórico da conversa ────────────────────────────────────
const history = [];

// ── Extrai blocos de código e comando de execução ────────────
function parseResponse(text) {
    const codeBlocks = [];
    const regex = /```(?:bash|js|javascript|sh|powershell)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        codeBlocks.push(match[1].trim());
    }

    const execMatch = text.match(/^EXEC:\s*(.+)$/m);
    const execCmd = execMatch ? execMatch[1].trim() : null;

    // Texto limpo (sem blocos de código e sem linha EXEC)
    const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/^EXEC:\s*.+$/m, '')
        .trim();

    return { cleanText, codeBlocks, execCmd };
}

// ── Renderiza código com destaque ────────────────────────────
function renderCode(code) {
    const lines = code.split('\n');
    nl();
    p(`  ${c.dim}╔${'═'.repeat(58)}╗${c.reset}`); nl();
    for (const line of lines) {
        p(`  ${c.dim}║${c.reset} ${c.cyan}${line.padEnd(57)}${c.reset}${c.dim}║${c.reset}`); nl();
    }
    p(`  ${c.dim}╚${'═'.repeat(58)}╝${c.reset}`); nl();
}

// ── Pergunta se quer executar ────────────────────────────────
async function askToExecute(cmd, rl) {
    return new Promise((resolve) => {
        nl();
        p(`  ${c.yellow}⚡ Comando pronto:${c.reset} ${c.white}${c.bold}${cmd}${c.reset}`); nl();
        p(`  ${c.dim}Executar agora? [s/N] → ${c.reset}`);
        rl.once('line', async (ans) => {
            if (ans.toLowerCase() === 's' || ans.toLowerCase() === 'sim') {
                nl();
                p(`  ${c.green}▶ Executando...${c.reset}`); nl();
                try {
                    const { stdout, stderr } = await execAsync(cmd, {
                        cwd: 'c:\\Users\\Huguera\\.gemini\\antigravity\\scratch\\aiox-core-main\\packages\\bingo-engine'
                    });
                    if (stdout) {
                        const out = stdout.trim().split('\n');
                        for (const line of out) {
                            p(`  ${c.dim}│${c.reset} ${line}`); nl();
                        }
                    }
                    if (stderr) {
                        const err = stderr.trim().split('\n');
                        for (const line of err.slice(0, 8)) {
                            p(`  ${c.yellow}│${c.reset} ${c.dim}${line}${c.reset}`); nl();
                        }
                    }
                    p(`  ${c.green}✓ Concluído${c.reset}`); nl();
                } catch (e) {
                    p(`  ${c.red}✕ Erro: ${e.message.slice(0, 120)}${c.reset}`); nl();
                }
            } else {
                p(`  ${c.dim}Pulando execução.${c.reset}`); nl();
            }
            resolve();
        });
    });
}

// ── Streaming da resposta do Claude ─────────────────────────
async function chat(userMessage, rl) {
    history.push({ role: 'user', content: userMessage });

    nl();
    p(`  ${c.purple}${c.bold}AIOS${c.reset} ${c.dim}▸${c.reset} `);

    let fullText = '';

    try {
        const stream = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: history,
            stream: true,
        });

        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                const chunk = event.delta.text;
                fullText += chunk;
                // Não imprimir código inline ainda — aguardar o fim para formatar
                if (!fullText.includes('```')) {
                    p(chunk);
                }
            }
        }
    } catch (e) {
        nl();
        p(`  ${c.red}✕ Erro na API: ${e.message}${c.reset}`); nl();
        return;
    }

    const { cleanText, codeBlocks, execCmd } = parseResponse(fullText);

    // Se havia código sendo acumulado, reescreve a linha limpa
    if (codeBlocks.length > 0) {
        // Apaga a linha do "AIOS ▸ " e re-imprime o texto limpo
        process.stdout.write('\r\x1b[K');
        p(`  ${c.purple}${c.bold}AIOS${c.reset} ${c.dim}▸${c.reset} `);
        p(cleanText || '');
        nl();
        for (const block of codeBlocks) {
            renderCode(block);
        }
    } else {
        nl();
    }

    history.push({ role: 'assistant', content: fullText });

    if (execCmd) {
        await askToExecute(execCmd, rl);
    }
}

// ── Header do terminal ───────────────────────────────────────
function printHeader() {
    console.clear();
    nl();
    p(`  ${c.purple}${c.bold}╔══════════════════════════════════════════════╗${c.reset}`); nl();
    p(`  ${c.purple}${c.bold}║   🎬  BINGO! AIOS — Chat Mode Terminal       ║${c.reset}`); nl();
    p(`  ${c.purple}${c.bold}║   ${c.dim}${c.reset}${c.purple}${c.bold}Linguagem natural → Código → Execução        ║${c.reset}`); nl();
    p(`  ${c.purple}${c.bold}╚══════════════════════════════════════════════╝${c.reset}`); nl();
    p(`  ${c.dim}Comandos especiais: ${c.reset}${c.cyan}cls${c.reset} ${c.dim}(limpar)  ${c.cyan}sair${c.reset} ${c.dim}(fechar)${c.reset}`); nl();
    p(`  ${c.dim}─────────────────────────────────────────────────${c.reset}`); nl();
    nl();
}

// ── Loop principal ───────────────────────────────────────────
async function main() {
    printHeader();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    const prompt = () => {
        p(`  ${c.cyan}você${c.reset} ${c.dim}▸${c.reset} `);
    };

    prompt();

    rl.on('line', async (line) => {
        const input = line.trim();

        if (!input) { prompt(); return; }
        if (input.toLowerCase() === 'sair' || input.toLowerCase() === 'exit') {
            nl();
            p(`  ${c.dim}Até mais! Motor desligado.${c.reset}`); nl(); nl();
            rl.close();
            process.exit(0);
        }
        if (input.toLowerCase() === 'cls' || input.toLowerCase() === 'clear') {
            printHeader();
            prompt();
            return;
        }

        await chat(input, rl);
        nl();
        prompt();
    });

    rl.on('close', () => process.exit(0));
}

main().catch(console.error);
