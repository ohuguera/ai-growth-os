import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Zap, CheckCircle, XCircle, Download,
  AlertCircle, Loader, Scissors, Settings, ChevronDown, ChevronUp,
  Wifi, WifiOff,
} from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { cortadorApi, type Moment, type Job, type Clip } from '../services/cortadorApi';

// ─── tipos locais ────────────────────────────────────────────────────────────

type CaptionPos = 'top' | 'middle' | 'bottom';
type Stage = 'idle' | 'uploading' | 'transcribing' | 'validating' | 'processing' | 'done';

// ─── simulação ────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function gerarMomentosSim(filename: string): Moment[] {
  const base = filename.toLowerCase().includes('fortune') ? 'Fortune Mouse' : 'live';
  return [
    {
      start: 42.5, end: 87.3, duration: 44.8, score: 82,
      reason: `Grande reação após win expressivo em ${base}. Pico de engajamento detectado.`,
      text: '"Não acredito! Olha isso gente, 8x no bônus! Isso é incrível, que jogo!"',
      natural_hook: 'Não acredito! Olha isso gente',
      hook_score: 35, value_score: 25, trend_score: 15, flow_score: 7,
    },
    {
      start: 142.0, end: 178.5, duration: 36.5, score: 71,
      reason: 'Tensão na rodada bônus com comentário viral em potencial.',
      text: '"Vem bônus, vem! A galera sabe que esse jogo paga demais quando você menos espera."',
      natural_hook: null,
      hook_score: 28, value_score: 22, trend_score: 14, flow_score: 7,
    },
    {
      start: 312.0, end: 345.0, duration: 33.0, score: 65,
      reason: 'Explicação clara de estratégia com CTA orgânico e boa retenção.',
      text: '"Eu sempre começo com esse valor aqui, olha o que acontece. O segredo é a consistência."',
      natural_hook: 'O segredo é a consistência',
      hook_score: 24, value_score: 21, trend_score: 13, flow_score: 7,
    },
    {
      start: 520.0, end: 548.0, duration: 28.0, score: 57,
      reason: 'Momento de celebração coletiva com interação no chat.',
      text: '"O chat foi abaixo! Todo mundo viu! Isso é exatamente por que eu amo esse jogo."',
      natural_hook: null,
      hook_score: 20, value_score: 18, trend_score: 12, flow_score: 7,
    },
  ];
}

interface ApprovedMoment extends Moment {
  useNaturalHook: boolean;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

function scoreColor(score: number) {
  if (score >= 75) return G.colors.success;
  if (score >= 50) return G.colors.warning;
  return G.colors.danger;
}

function scoreLabel(score: number) {
  if (score >= 75) return 'ALTO';
  if (score >= 50) return 'MÉDIO';
  return 'BAIXO';
}

// ─── sub-componentes ─────────────────────────────────────────────────────────

function BackendStatus({ online }: { online: boolean | null }) {
  if (online === null) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
      background: online ? `${G.colors.success}15` : `${G.colors.warning}15`,
      border: `1px solid ${online ? G.colors.success : G.colors.warning}30`,
      color: online ? G.colors.success : G.colors.warning,
    }}>
      {online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {online ? 'Backend online' : 'Modo Simulação — backend offline'}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: '800', color, minWidth: '28px' }}>{score}</span>
      <Badge label={scoreLabel(score)} color={color} />
    </div>
  );
}

function ScoreBreakdown({ m }: { m: Moment }) {
  const items = [
    { label: 'Hook', val: m.hook_score, max: 40 },
    { label: 'Value', val: m.value_score, max: 30 },
    { label: 'Trend', val: m.trend_score, max: 20 },
    { label: 'Flow', val: m.flow_score, max: 10 },
  ];
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {items.map(({ label, val, max }) => (
        <div key={label} style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
        }}>
          {label} <span style={{ color: val > 0 ? '#fff' : undefined }}>{val}/{max}</span>
        </div>
      ))}
    </div>
  );
}

function MomentCard({
  moment, index, approved, rejected,
  onApprove, onReject,
}: {
  moment: Moment;
  index: number;
  approved: boolean;
  rejected: boolean;
  onApprove: (m: Moment, useNatural: boolean) => void;
  onReject: (m: Moment) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [useNatural, setUseNatural] = useState(false);

  const border = approved
    ? `1px solid ${G.colors.success}50`
    : rejected
    ? `1px solid rgba(255,255,255,0.04)`
    : '1px solid rgba(255,255,255,0.08)';

  const bg = approved
    ? `${G.colors.success}08`
    : rejected
    ? 'rgba(255,255,255,0.01)'
    : 'rgba(28,28,30,0.4)';

  return (
    <div style={{
      background: bg, border, borderRadius: '16px', padding: '18px',
      opacity: rejected ? 0.4 : 1, transition: 'all 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Número */}
        <div style={{
          minWidth: '32px', height: '32px', borderRadius: '50%',
          background: scoreColor(moment.score) + '20',
          border: `1px solid ${scoreColor(moment.score)}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '800', color: scoreColor(moment.score),
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1 }}>
          {/* Timestamps + duração */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: G.colors.primary, fontWeight: '700' }}>
              {fmtTime(moment.start)} → {fmtTime(moment.end)}
            </span>
            <Badge label={`${Math.round(moment.duration)}s`} color={G.colors.primary} />
            {approved && <Badge label="APROVADO" color={G.colors.success} />}
          </div>

          {/* Score */}
          <ScoreBar score={moment.score} />

          {/* Razão */}
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            {moment.reason}
          </p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Breakdown */}
          <ScoreBreakdown m={moment} />

          {/* Transcrição */}
          <p style={{
            fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)',
            marginTop: '12px', padding: '12px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
          }}>
            "{moment.text}"
          </p>

          {/* Hook natural */}
          {moment.natural_hook && (
            <div style={{
              marginTop: '10px', padding: '10px 12px', borderRadius: '8px',
              background: `${G.colors.warning}10`, border: `1px solid ${G.colors.warning}30`,
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: G.colors.warning, marginBottom: '4px' }}>
                HOOK NATURAL DETECTADO
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>"{moment.natural_hook}"</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useNatural}
                  onChange={e => setUseNatural(e.target.checked)}
                  style={{ accentColor: G.colors.warning }}
                />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Usar este como hook do clipe</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      {!rejected && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {!approved ? (
            <>
              <Btn
                icon={CheckCircle}
                label="Aprovar"
                variant="success"
                small
                onClick={() => onApprove(moment, useNatural)}
              />
              <Btn
                icon={XCircle}
                label="Rejeitar"
                variant="secondary"
                small
                onClick={() => onReject(moment)}
              />
            </>
          ) : (
            <Btn
              icon={XCircle}
              label="Remover aprovação"
              variant="secondary"
              small
              onClick={() => onReject(moment)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────

export const CortadorIA = () => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  // Config — carrega do localStorage
  const [hook, setHook] = useState(() => localStorage.getItem('cortador_hook_padrao') || '');
  const [cta, setCta] = useState(() => localStorage.getItem('cortador_cta_padrao') || '');
  const [captionPos, setCaptionPos] = useState<CaptionPos>('middle');
  const [watermark, setWatermark] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);

  // Debounce save hook/CTA no localStorage
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem('cortador_hook_padrao', hook), 1000);
    return () => clearTimeout(t);
  }, [hook]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem('cortador_cta_padrao', cta), 1000);
    return () => clearTimeout(t);
  }, [cta]);

  // Validação
  const [approved, setApproved] = useState<ApprovedMoment[]>([]);
  const [rejected, setRejected] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── check backend ──────────────────────────────────────────────────────────
  useEffect(() => {
    cortadorApi.checkHealth().then(setBackendOnline);
    const t = setInterval(() => cortadorApi.checkHealth().then(setBackendOnline), 10000);
    return () => clearInterval(t);
  }, []);

  // ── polling ────────────────────────────────────────────────────────────────
  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPoll = useCallback((jobId: string, until: Job['status'][]) => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      try {
        const j = await cortadorApi.getStatus(jobId);
        setJob(j);
        if (until.includes(j.status) || j.status === 'error') {
          stopPoll();
          if (j.status === 'ready') setStage('validating');
          if (j.status === 'done') setStage('done');
          if (j.status === 'error') setError(j.error || 'Erro no processamento');
        }
      } catch { /* ignora erros de poll */ }
    }, 2000);
  }, [stopPoll]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  // ── upload ─────────────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setError('');
    setApproved([]);
    setRejected(new Set());
    setStage('uploading');

    if (!backendOnline) {
      // Modo simulação: sem backend, gera momentos fake
      await delay(1800);
      setStage('transcribing');
      const mockJob: Job = {
        id: `sim-${Date.now()}`,
        status: 'ready',
        filename: file.name,
        segments: [],
        moments: gerarMomentosSim(file.name),
        clips: [],
      };
      setJob(mockJob);
      await delay(2800);
      setStage('validating');
      return;
    }

    try {
      const { job_id } = await cortadorApi.upload(file);
      setStage('transcribing');
      await cortadorApi.transcribe(job_id);
      startPoll(job_id, ['ready']);
    } catch (e: any) {
      setError(e.message);
      setStage('idle');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ── validação ──────────────────────────────────────────────────────────────
  const handleApprove = (m: Moment, useNatural: boolean) => {
    setApproved(prev => {
      if (prev.find(a => a.start === m.start)) return prev;
      return [...prev, { ...m, useNaturalHook: useNatural }];
    });
    setRejected(prev => { const s = new Set(prev); s.delete(m.start); return s; });
  };

  const handleReject = (m: Moment) => {
    setApproved(prev => prev.filter(a => a.start !== m.start));
    setRejected(prev => new Set(prev).add(m.start));
  };

  // ── processamento ──────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (!job || approved.length === 0) return;
    setStage('processing');
    setError('');

    if (!backendOnline) {
      // Modo simulação: simula processamento e gera clipes fake
      await delay(2200);
      const simClips: Clip[] = approved.map((a, i) => ({
        id: `clip-sim-${i}`,
        start: a.start,
        end: a.end,
        score: a.score,
        status: 'done' as const,
      }));
      setJob(prev => prev ? { ...prev, clips: simClips, status: 'done' } : prev);
      setStage('done');
      return;
    }

    try {
      await cortadorApi.process({
        job_id: job.id,
        approved_moments: approved.map(a => ({
          start: a.start,
          end: a.end,
          score: a.score,
          use_natural_hook: a.useNaturalHook,
          natural_hook: a.natural_hook || '',
        })),
        hook,
        cta,
        caption_position: captionPos,
        watermark,
      });
      startPoll(job.id, ['done']);
    } catch (e: any) {
      setError(e.message);
      setStage('validating');
    }
  };

  const handleReset = () => {
    stopPoll();
    setJob(null);
    setStage('idle');
    setError('');
    setApproved([]);
    setRejected(new Set());
  };

  // ─── render ────────────────────────────────────────────────────────────────

  const moments = job?.moments ?? [];
  const clips = job?.clips ?? [];
  const doneClips = clips.filter(c => c.status === 'done');
  const errorClips = clips.filter(c => c.status === 'error');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Status backend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <BackendStatus online={backendOnline} />
      </div>

      {/* ── CONFIGURAÇÃO ────────────────────────────────────────────────────── */}
      <GlassCard>
        <button
          onClick={() => setConfigOpen(o => !o)}
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', padding: '0',
          }}
        >
          <Settings size={16} color={G.colors.primary} />
          <span style={{ fontSize: '14px', fontWeight: '700', flex: 1, textAlign: 'left' }}>
            Configuração do Corte
          </span>
          {configOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
        </button>

        {configOpen && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hook */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: G.colors.warning, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                HOOK PADRÃO (aparece nos primeiros 3s)
              </label>
              <input
                value={hook}
                onChange={e => setHook(e.target.value)}
                placeholder="Ex: Você não vai acreditar no que aconteceu..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* CTA */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: G.colors.success, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                CTA PADRÃO (aparece nos últimos 4s)
              </label>
              <input
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder="Ex: Acessa BINGOBET e aproveita o bônus!"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Posição legenda + marca d'água */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  POSIÇÃO DA LEGENDA
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['top', 'middle', 'bottom'] as CaptionPos[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setCaptionPos(p)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600',
                        background: captionPos === p ? G.colors.primary : 'rgba(255,255,255,0.06)',
                        color: captionPos === p ? '#fff' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {p === 'top' ? 'Topo' : p === 'middle' ? 'Meio' : 'Baixo'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={watermark}
                    onChange={e => setWatermark(e.target.checked)}
                    style={{ accentColor: G.colors.primary, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                    Marca d'água BINGOBET +18
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── UPLOAD ──────────────────────────────────────────────────────────── */}
      {(stage === 'idle' || stage === 'uploading') && (
        <GlassCard>
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${stage === 'uploading' ? G.colors.primary : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '16px', padding: '48px 24px', textAlign: 'center',
              cursor: stage === 'uploading' ? 'default' : 'pointer',
              transition: 'all 0.2s',
              background: stage === 'uploading' ? `${G.colors.primary}08` : 'transparent',
            }}
          >
            {stage === 'uploading' ? (
              <>
                <Loader size={36} color={G.colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '12px', fontSize: '14px', color: G.colors.primary, fontWeight: '700' }}>
                  Enviando arquivo...
                </p>
              </>
            ) : (
              <>
                <Upload size={36} color="rgba(255,255,255,0.3)" />
                <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                  Arraste a live aqui ou clique para selecionar
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                  MP4, MOV, AVI, MKV — qualquer duração
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{
                    marginTop: '14px', padding: '10px 24px', borderRadius: '10px',
                    background: G.colors.primary, color: '#fff', border: 'none',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <Upload size={14} />
                  Selecionar Arquivo
                </button>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </GlassCard>
      )}

      {/* ── TRANSCREVENDO ───────────────────────────────────────────────────── */}
      {stage === 'transcribing' && (
        <GlassCard style={{ textAlign: 'center', padding: '40px' }}>
          <Loader size={40} color={G.colors.secondary} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
            Transcrevendo e analisando a live...
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            Isso pode levar alguns minutos dependendo da duração do vídeo.
          </p>
          {job && (
            <p style={{ fontSize: '11px', color: G.colors.secondary, marginTop: '10px', fontWeight: '600' }}>
              {job.filename}
            </p>
          )}
        </GlassCard>
      )}

      {/* ── ERRO ────────────────────────────────────────────────────────────── */}
      {error && (
        <GlassCard style={{ borderColor: `${G.colors.danger}40`, background: `${G.colors.danger}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color={G.colors.danger} />
            <span style={{ fontSize: '13px', color: G.colors.danger, fontWeight: '600' }}>{error}</span>
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <XCircle size={16} />
            </button>
          </div>
        </GlassCard>
      )}

      {/* ── NENHUM MOMENTO DETECTADO ────────────────────────────────────────── */}
      {stage === 'validating' && moments.length === 0 && (
        <GlassCard style={{ textAlign: 'center', padding: '40px' }}>
          <AlertCircle size={40} color={G.colors.warning} />
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
            Nenhum momento de destaque detectado
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
            A IA nao encontrou trechos com score suficiente (minimo 50). Tente com outra live ou ajuste o conteudo para incluir hooks e momentos emocionais.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Btn label="Tentar outro arquivo" variant="secondary" onClick={handleReset} />
          </div>
        </GlassCard>
      )}

      {/* ── VALIDAÇÃO ───────────────────────────────────────────────────────── */}
      {stage === 'validating' && moments.length > 0 && (
        <>
          {/* Header de validação */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Zap size={20} color={G.colors.warning} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '2px' }}>
                  {moments.length} momentos detectados
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Aprovados: <strong style={{ color: G.colors.success }}>{approved.length}</strong> — Revise e aprove os clipes que deseja gerar.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn
                  label={`Aprovar todos (${moments.length})`}
                  variant="secondary"
                  small
                  onClick={() => setApproved(moments.map(m => ({ ...m, useNaturalHook: false })))}
                />
                <div style={{ opacity: approved.length === 0 ? 0.4 : 1, pointerEvents: approved.length === 0 ? 'none' : 'auto' }}>
                  <Btn
                    icon={Scissors}
                    label={approved.length > 0 ? `Gerar ${approved.length} clipes` : 'Selecione momentos'}
                    variant="action"
                    onClick={handleProcess}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Lista de momentos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {moments.map((m, i) => (
              <MomentCard
                key={m.start}
                moment={m}
                index={i}
                approved={approved.some(a => a.start === m.start)}
                rejected={rejected.has(m.start)}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>

          {/* Botão flutuante */}
          {approved.length > 0 && (
            <div style={{ position: 'sticky', bottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleProcess}
                style={{
                  background: 'linear-gradient(135deg,#FF9500,#FF2D55)',
                  color: '#fff', border: 'none', borderRadius: '50px',
                  padding: '14px 32px', fontWeight: '800', fontSize: '15px',
                  cursor: 'pointer', boxShadow: '0 8px 32px rgba(255,45,85,0.4)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <Scissors size={18} />
                Gerar {approved.length} clipe{approved.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── PROCESSANDO ─────────────────────────────────────────────────────── */}
      {stage === 'processing' && (
        <GlassCard style={{ textAlign: 'center', padding: '40px' }}>
          <Loader size={40} color={G.colors.copy} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
            Gerando clipes...
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            Aplicando legenda, hook, CTA e marca d'água em cada clipe aprovado.
          </p>
          <p style={{ fontSize: '11px', color: G.colors.warning, marginTop: '10px', fontWeight: '600' }}>
            {approved.length} clipe{approved.length > 1 ? 's' : ''} na fila
          </p>
        </GlassCard>
      )}

      {/* ── PRONTO ──────────────────────────────────────────────────────────── */}
      {stage === 'done' && (
        <>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <CheckCircle size={22} color={G.colors.success} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '2px' }}>
                  {doneClips.length} clipe{doneClips.length > 1 ? 's' : ''} prontos!
                </h3>
                {errorClips.length > 0 && (
                  <p style={{ fontSize: '12px', color: G.colors.danger }}>
                    {errorClips.length} clipe(s) com erro.
                  </p>
                )}
              </div>
              <Btn label="Novo corte" variant="secondary" small onClick={handleReset} />
            </div>
          </GlassCard>

          {/* Lista de clipes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {clips.map((clip, i) => (
              <GlassCard key={clip.id} style={{
                borderColor: clip.status === 'done' ? `${G.colors.success}30` : `${G.colors.danger}30`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: clip.status === 'done' ? `${G.colors.success}20` : `${G.colors.danger}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {clip.status === 'done'
                      ? <CheckCircle size={18} color={G.colors.success} />
                      : <AlertCircle size={18} color={G.colors.danger} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>
                      Clipe {i + 1}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        {fmtTime(clip.start)} → {fmtTime(clip.end)}
                      </span>
                      <Badge label={`Score ${clip.score}`} color={scoreColor(clip.score)} />
                    </div>
                    {clip.error && (
                      <p style={{ fontSize: '11px', color: G.colors.danger, marginTop: '4px' }}>{clip.error}</p>
                    )}
                  </div>

                  {clip.status === 'done' && (
                    backendOnline ? (
                      <a
                        href={cortadorApi.downloadUrl(clip.id)}
                        download={`bingobet_clip_${i + 1}.mp4`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                          background: G.colors.success, color: '#000', fontSize: '12px', fontWeight: '700',
                        }}
                      >
                        <Download size={14} />
                        Download
                      </a>
                    ) : (
                      <Badge label="SIMULADO" color={G.colors.warning} />
                    )
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* CSS spin */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
