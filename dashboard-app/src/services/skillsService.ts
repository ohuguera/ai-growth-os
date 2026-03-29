import { supabase } from '../lib/supabase'

export interface Skill {
  id: string
  name: string
  slug: string
  description: string | null
  prompt_template: string
  category: 'copy' | 'corte' | 'template' | 'analise'
  nicho: string
  ativo: boolean
  created_at: string
}

const ANTHROPIC_KEY = (import.meta as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY

// ── Supabase ──────────────────────────────────────────────────────────────────

export async function fetchSkill(slug: string): Promise<Skill | null> {
  const { data } = await supabase
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()
  return data
}

export async function fetchSkillsByCategory(category: Skill['category']): Promise<Skill[]> {
  const { data } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .eq('ativo', true)
    .order('created_at')
  return data || []
}

export async function logExecution(skillId: string, input: object, output: string): Promise<void> {
  await supabase.from('skill_executions').insert({
    skill_id: skillId,
    input,
    output,
  })
}

// ── Template interpolation ────────────────────────────────────────────────────

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

// ── Claude API (browser) ──────────────────────────────────────────────────────

async function callClaude(prompt: string): Promise<string> {
  if (!ANTHROPIC_KEY) throw new Error('VITE_ANTHROPIC_API_KEY não configurada')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

// ── Execute skill ─────────────────────────────────────────────────────────────

export async function executeSkill(
  slug: string,
  vars: Record<string, string>
): Promise<{ output: string; skill: Skill }> {
  const skill = await fetchSkill(slug)
  if (!skill) throw new Error(`Skill "${slug}" não encontrada`)

  const prompt = interpolate(skill.prompt_template, vars)
  const output = await callClaude(prompt)

  // Loga em background (não bloqueia)
  logExecution(skill.id, vars, output).catch(console.error)

  return { output, skill }
}

// ── Funções de atalho para cada skill ─────────────────────────────────────────

export async function analisarMomento(transcricao: string) {
  return executeSkill('analisar_momento', { transcricao })
}

export async function gerarHook(contexto: string) {
  return executeSkill('gerar_hook', { contexto })
}

export async function gerarCTA(contexto: string, objetivo = 'cadastro e primeiro depósito') {
  return executeSkill('gerar_cta', { contexto, objetivo })
}

export async function gerarLegenda(contexto: string) {
  return executeSkill('gerar_legenda', { contexto })
}

export async function sugerirTemplate(contexto: string) {
  return executeSkill('sugerir_template', { contexto })
}

export async function gerarTituloViral(contexto: string) {
  return executeSkill('gerar_titulo_viral', { contexto })
}

export interface MomentoViral {
  title: string
  start: string
  end: string
  score: number
  hook: string
  gatilho: 'ganho' | 'emocao' | 'choque' | 'curiosidade'
}

export async function detectarMomentosVirais(transcricao: string): Promise<{ momentos: MomentoViral[]; raw: string }> {
  const { output } = await executeSkill('detectar_momentos_virais', { transcricao })
  try {
    const match = output.match(/\[[\s\S]*\]/)
    const momentos: MomentoViral[] = match ? JSON.parse(match[0]) : []
    return { momentos, raw: output }
  } catch {
    return { momentos: [], raw: output }
  }
}
