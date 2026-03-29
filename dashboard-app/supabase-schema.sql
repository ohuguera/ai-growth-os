-- HFIVE IA — Schema inicial
-- Cole isso no SQL Editor do Supabase e execute

create table if not exists skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  prompt_template text not null,
  category text not null check (category in ('copy', 'corte', 'template', 'analise')),
  nicho text default 'igaming',
  ativo boolean default true,
  created_at timestamptz default now()
);

create table if not exists skill_executions (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade,
  input jsonb,
  output text,
  created_at timestamptz default now()
);

-- Skills iniciais para iGaming/BINGOBET
insert into skills (name, slug, description, prompt_template, category, nicho) values
(
  'Gerar Hook',
  'gerar_hook',
  'Gera 3 opções de hook para o clipe',
  'Você é um especialista em marketing para iGaming. Crie 3 opções de hook (frase de abertura) para um vídeo curto sobre: {{contexto}}. O nicho é iGaming/apostas. Seja direto, impactante e use gatilhos de urgência ou curiosidade. Responda apenas com as 3 opções numeradas, sem explicações.',
  'copy',
  'igaming'
),
(
  'Gerar CTA',
  'gerar_cta',
  'Sugere CTA baseado no nicho iGaming',
  'Você é um especialista em marketing para iGaming. Crie 3 CTAs (chamadas para ação) para um vídeo sobre: {{contexto}}. O objetivo é: {{objetivo}}. Seja direto e urgente. Responda apenas com as 3 opções numeradas.',
  'copy',
  'igaming'
),
(
  'Sugerir Template',
  'sugerir_template',
  'Recomenda o melhor template pelo tipo de conteúdo',
  'Analise este conteúdo de vídeo: {{contexto}}. Dos tipos disponíveis (depoimento, prova_social, educativo, storytelling, ganho, hook_agressivo), qual combina melhor? Responda com: 1) O tipo recomendado, 2) Por que em uma frase, 3) Hook sugerido para esse template.',
  'template',
  'igaming'
),
(
  'Analisar Momento',
  'analisar_momento',
  'Avalia se um trecho é bom para corte',
  'Analise este trecho de transcrição de live de iGaming: "{{transcricao}}". Este momento é bom para virar um corte de vídeo curto? Avalie: 1) Potencial viral (0-10), 2) Motivo em uma frase, 3) Hook sugerido se for bom.',
  'corte',
  'igaming'
),
(
  'Gerar Legenda',
  'gerar_legenda',
  'Gera legenda formatada para o clipe',
  'Crie uma legenda para Instagram/TikTok para um vídeo de iGaming sobre: {{contexto}}. Inclua: emoji relevante, texto impactante (máx 2 linhas), hashtags (máx 5). Formato: legenda pronta para copiar.',
  'copy',
  'igaming'
);

-- Skill extra: geração de título viral (opus-clip style)
insert into skills (name, slug, description, prompt_template, category, nicho)
values (
  'Gerar Título Viral',
  'gerar_titulo_viral',
  'Gera título viral para o clipe no estilo Opus Clip',
  'Você é especialista em títulos virais para iGaming no Brasil. Crie 3 opções de título para um clipe de vídeo sobre: {{contexto}}. Regras: 40-70 caracteres, começa com palavra de impacto ou número, usa gatilho emocional ou curiosity gap, title case, contexto de apostas/iGaming. Responda APENAS com as 3 opções numeradas, sem explicações.',
  'copy',
  'igaming'
) on conflict (slug) do nothing;

-- Política de acesso público (anon pode ler skills ativas)
alter table skills enable row level security;
alter table skill_executions enable row level security;

create policy "skills_public_read" on skills
  for select using (ativo = true);

create policy "executions_insert" on skill_executions
  for insert with check (true);

create policy "executions_read" on skill_executions
  for select using (true);
