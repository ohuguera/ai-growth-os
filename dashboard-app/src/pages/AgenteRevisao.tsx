import { useState, useEffect, useCallback } from 'react';
import {
  Bot, RefreshCw, CheckCircle, AlertTriangle, XOctagon,
  Lightbulb, ClipboardList, TrendingUp, Clock, Package,
} from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';

// ---- tipos ----------------------------------------------------------------

interface ModuleHealth {
  name: string;
  key: string;
  status: 'ok' | 'warn' | 'error';
  detail: string;
  metric?: string;
}

interface ReviewReport {
  timestamp: string;
  functioning: string[];
  bottlenecks: string[];
  blockers: string[];
  suggestions: string[];
  nextDecision: string;
}

// ---- helpers de leitura do localStorage ------------------------------------

function countItems(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (typeof parsed === 'object') return Object.keys(parsed).length;
    return 0;
  } catch {
    return 0;
  }
}

function loadProductionToday(): { total: number; done: number } {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(`production_${today}`);
    if (!raw) return { total: 0, done: 0 };
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return { total: 0, done: 0 };
    const done = items.filter((i: any) => i.status === 'concluido' || i.status === 'publicado').length;
    return { total: items.length, done };
  } catch {
    return { total: 0, done: 0 };
  }
}

function loadHojeChecklist(): { total: number; checked: number } {
  try {
    const raw = localStorage.getItem('hoje_checklist');
    if (!raw) return { total: 0, checked: 0 };
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return { total: 0, checked: 0 };
    const checked = items.filter((i: any) => i.done).length;
    return { total: items.length, checked };
  } catch {
    return { total: 0, checked: 0 };
  }
}

// ---- modulos ---------------------------------------------------------------

function analyzeModules(): ModuleHealth[] {
  const modules: ModuleHealth[] = [];

  // Producao
  const prod = loadProductionToday();
  if (prod.total === 0) {
    modules.push({ name: 'Producao', key: 'producao', status: 'warn', detail: 'Nenhum item de producao registrado hoje', metric: '0 itens' });
  } else {
    const pct = Math.round((prod.done / prod.total) * 100);
    modules.push({
      name: 'Producao', key: 'producao',
      status: pct >= 80 ? 'ok' : pct >= 50 ? 'warn' : 'error',
      detail: `${prod.done}/${prod.total} itens concluidos (${pct}%)`,
      metric: `${pct}%`,
    });
  }

  // Hoje
  const hoje = loadHojeChecklist();
  if (hoje.total === 0) {
    modules.push({ name: 'Hoje (Checklist)', key: 'hoje', status: 'warn', detail: 'Checklist do dia nao preenchida', metric: '0/0' });
  } else {
    const pct = Math.round((hoje.checked / hoje.total) * 100);
    modules.push({
      name: 'Hoje (Checklist)', key: 'hoje',
      status: pct >= 80 ? 'ok' : pct >= 50 ? 'warn' : 'error',
      detail: `${hoje.checked}/${hoje.total} tarefas feitas (${pct}%)`,
      metric: `${hoje.checked}/${hoje.total}`,
    });
  }

  // Hooks
  const hooksCount = countItems('hooks_library');
  modules.push({
    name: 'Banco de Hooks', key: 'hooks',
    status: hooksCount >= 10 ? 'ok' : hooksCount >= 3 ? 'warn' : 'error',
    detail: `${hooksCount} hooks cadastrados`,
    metric: `${hooksCount}`,
  });

  // Ofertas
  const offersCount = countItems('offers_library');
  modules.push({
    name: 'Biblioteca de Ofertas', key: 'ofertas',
    status: offersCount >= 5 ? 'ok' : offersCount >= 1 ? 'warn' : 'error',
    detail: `${offersCount} ofertas cadastradas`,
    metric: `${offersCount}`,
  });

  // Templates
  const templatesCount = countItems('templates_library');
  modules.push({
    name: 'Templates', key: 'templates',
    status: templatesCount >= 3 ? 'ok' : templatesCount >= 1 ? 'warn' : 'error',
    detail: `${templatesCount} templates disponiveis`,
    metric: `${templatesCount}`,
  });

  // Clipes
  const clipesCount = countItems('clipes_generated');
  modules.push({
    name: 'Clipes Gerados', key: 'clipes',
    status: clipesCount >= 5 ? 'ok' : clipesCount >= 1 ? 'warn' : 'error',
    detail: `${clipesCount} clipes no acervo`,
    metric: `${clipesCount}`,
  });

  return modules;
}

function generateReport(modules: ModuleHealth[]): ReviewReport {
  const functioning = modules.filter(m => m.status === 'ok').map(m => `${m.name}: ${m.detail}`);
  const bottlenecks = modules.filter(m => m.status === 'warn').map(m => `${m.name}: ${m.detail}`);
  const blockers = modules.filter(m => m.status === 'error').map(m => `${m.name}: ${m.detail}`);

  const suggestions: string[] = [];

  // Priorizar sugestoes
  const prodMod = modules.find(m => m.key === 'producao');
  if (prodMod && prodMod.status !== 'ok') {
    suggestions.push('Foque em completar os itens de producao do dia antes de abrir novas tarefas');
  }

  const hojeMod = modules.find(m => m.key === 'hoje');
  if (hojeMod && hojeMod.status !== 'ok') {
    suggestions.push('Revisite a checklist do dia e marque as tarefas ja feitas');
  }

  const hooksMod = modules.find(m => m.key === 'hooks');
  if (hooksMod && hooksMod.status !== 'ok') {
    suggestions.push('Alimente o banco de hooks com exemplos validados para acelerar a criacao de copies');
  }

  const clipesMod = modules.find(m => m.key === 'clipes');
  if (clipesMod && clipesMod.status !== 'ok') {
    suggestions.push('Use o Cortador IA para gerar clipes a partir de lives recentes');
  }

  if (suggestions.length === 0) {
    suggestions.push('Sistema operando bem. Considere publicar conteudo agendado.');
  }

  // Proxima decisao (a mais urgente)
  let nextDecision = 'Manter ritmo atual de producao.';
  if (blockers.length > 0) {
    nextDecision = `Resolver bloqueador: ${blockers[0]}`;
  } else if (bottlenecks.length > 0) {
    nextDecision = `Atacar gargalo: ${bottlenecks[0]}`;
  }

  return {
    timestamp: new Date().toLocaleString('pt-BR'),
    functioning,
    bottlenecks,
    blockers,
    suggestions,
    nextDecision,
  };
}

// ---- sub-componentes -------------------------------------------------------

function StatusIcon({ status }: { status: 'ok' | 'warn' | 'error' }) {
  if (status === 'ok') return <CheckCircle size={16} color={G.colors.success} />;
  if (status === 'warn') return <AlertTriangle size={16} color={G.colors.warning} />;
  return <XOctagon size={16} color={G.colors.danger} />;
}

function statusColor(status: 'ok' | 'warn' | 'error') {
  if (status === 'ok') return G.colors.success;
  if (status === 'warn') return G.colors.warning;
  return G.colors.danger;
}

function ModuleRow({ m }: { m: ModuleHealth }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', borderRadius: '12px',
      background: `${statusColor(m.status)}08`,
      border: `1px solid ${statusColor(m.status)}20`,
    }}>
      <StatusIcon status={m.status} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{m.name}</span>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{m.detail}</p>
      </div>
      {m.metric && (
        <Badge label={m.metric} color={statusColor(m.status)} />
      )}
    </div>
  );
}

function ReportSection({ icon: Icon, title, color, items }: {
  icon: any; title: string; color: string; items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: '13px', fontWeight: '800', color }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '24px' }}>
        {items.map((item, i) => (
          <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

// ---- pagina principal ------------------------------------------------------

export const AgenteRevisao = () => {
  const [modules, setModules] = useState<ModuleHealth[]>([]);
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    const m = analyzeModules();
    setModules(m);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleReview = () => {
    setLoading(true);
    // Simula processamento breve para feedback visual
    setTimeout(() => {
      const fresh = analyzeModules();
      setModules(fresh);
      setReport(generateReport(fresh));
      setLoading(false);
    }, 600);
  };

  const okCount = modules.filter(m => m.status === 'ok').length;
  const warnCount = modules.filter(m => m.status === 'warn').length;
  const errorCount = modules.filter(m => m.status === 'error').length;
  const healthPct = modules.length > 0 ? Math.round((okCount / modules.length) * 100) : 0;

  const overallColor = errorCount > 0 ? G.colors.danger : warnCount > 0 ? G.colors.warning : G.colors.success;
  const overallLabel = errorCount > 0 ? 'Atencao Necessaria' : warnCount > 0 ? 'Alguns Gargalos' : 'Operacional';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header de saude */}
      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: `${overallColor}15`, border: `1px solid ${overallColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={26} color={overallColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
              Saude do Sistema
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge label={overallLabel} color={overallColor} />
              <Badge label={`${healthPct}% operacional`} color={overallColor} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                {okCount} ok / {warnCount} gargalos / {errorCount} criticos
              </span>
            </div>
          </div>
          <Btn
            icon={RefreshCw}
            label={loading ? 'Analisando...' : 'Revisao Agora'}
            variant="action"
            onClick={handleReview}
          />
        </div>
      </GlassCard>

      {/* Barra de saude visual */}
      <div style={{
        height: '6px', borderRadius: '3px', overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: `${healthPct}%`, height: '100%',
          background: overallColor,
          borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Grid de modulos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {modules.map(m => <ModuleRow key={m.key} m={m} />)}
      </div>

      {/* Relatorio gerado */}
      {report && (
        <GlassCard style={{ borderColor: `${G.colors.secondary}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ClipboardList size={18} color={G.colors.secondary} />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>
              Relatorio de Revisao
            </h3>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {report.timestamp}
            </span>
          </div>

          <ReportSection
            icon={CheckCircle}
            title="O que esta funcionando"
            color={G.colors.success}
            items={report.functioning}
          />

          <ReportSection
            icon={AlertTriangle}
            title="Gargalos detectados"
            color={G.colors.warning}
            items={report.bottlenecks}
          />

          <ReportSection
            icon={XOctagon}
            title="Bloqueadores criticos"
            color={G.colors.danger}
            items={report.blockers}
          />

          <ReportSection
            icon={Lightbulb}
            title="Solucoes sugeridas (priorizadas)"
            color={G.colors.secondary}
            items={report.suggestions}
          />

          {/* Proxima decisao */}
          <div style={{
            marginTop: '8px', padding: '14px 18px', borderRadius: '12px',
            background: `${G.colors.primary}10`, border: `1px solid ${G.colors.primary}30`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <TrendingUp size={14} color={G.colors.primary} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: G.colors.primary, letterSpacing: '0.5px' }}>
                PROXIMA DECISAO NECESSARIA
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
              {report.nextDecision}
            </p>
          </div>
        </GlassCard>
      )}

      {/* Dica quando nao gerou relatorio ainda */}
      {!report && (
        <GlassCard style={{ textAlign: 'center', padding: '32px' }}>
          <Package size={32} color="rgba(255,255,255,0.15)" />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
            Clique em <strong style={{ color: G.colors.warning }}>"Revisao Agora"</strong> para gerar um relatorio completo com diagnostico, gargalos e proximas acoes.
          </p>
        </GlassCard>
      )}
    </div>
  );
};
