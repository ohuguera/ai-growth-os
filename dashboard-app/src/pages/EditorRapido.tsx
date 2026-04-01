import { useState } from 'react'
import { ArrowLeft, Layers, Wand2 } from 'lucide-react'
import { TEMPLATES } from '../data/templates'
import { EXPERTS } from '../data/experts'
import { processClips, getJob } from '../services/api'
import type { EditorPage, ExpertId } from '../types'

interface Props {
  jobId: string
  filename: string
  templateId: string
  navigate: (p: EditorPage) => void
}

type Section = 'visual' | 'legenda' | 'watermark' | 'estrutura' | 'movimento'
type WmZone = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'
type WmSize = 'small' | 'medium' | 'large'

const WM_ZONES: WmZone[] = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br']

function wmStyle(zone: WmZone, size: WmSize): React.CSSProperties {
  const fontSize = { small: 8, medium: 11, large: 15 }[size]
  const v = zone[0] === 't' ? { top: 10 } : zone[0] === 'b' ? { bottom: 10 } : { top: '50%' }
  const h = zone[1] === 'l' ? { left: 10 } : zone[1] === 'r' ? { right: 10 } : { left: '50%' }
  const transform = zone === 'tc' ? 'translateX(-50%)' : zone === 'bc' ? 'translateX(-50%)' : zone === 'ml' ? 'translateY(-50%)' : zone === 'mr' ? 'translateY(-50%)' : zone === 'mc' ? 'translate(-50%,-50%)' : undefined
  return { position: 'absolute', fontSize, ...v, ...h, transform }
}

export default function EditorRapido({ jobId, filename, templateId, navigate }: Props) {
  const tmpl = TEMPLATES.find(t => t.id === templateId)!

  const [section, setSection] = useState<Section>('visual')
  const [processing, setProcessing] = useState(false)

  const [expertId, setExpertId] = useState<ExpertId | null>(null)
  const [primaryColor, setPrimaryColor] = useState(tmpl.primaryColor)
  const [captionPos, setCaptionPos] = useState(tmpl.captionPosition)
  const [captionBold, setCaptionBold] = useState(tmpl.captionBold)
  const [highlightColor, setHighlightColor] = useState(tmpl.highlightColor)
  const [watermark, setWatermark] = useState(true)
  const [wmZone, setWmZone] = useState<WmZone>('tr')
  const [wmSize, setWmSize] = useState<WmSize>('medium')
  const [wmOpacity, setWmOpacity] = useState(75)
  const [hook, setHook] = useState(tmpl.defaultHook)
  const [cta, setCta] = useState(tmpl.defaultCta)
  const [zoom, setZoom] = useState(tmpl.zoomIntensity)

  const expert = expertId ? EXPERTS[expertId] : null
  const accentColor = expert?.color || primaryColor
  const wmText = expert?.watermarkText || '+18'
  const showWmOverlay = section === 'watermark' && watermark

  async function handleExport() {
    setProcessing(true)
    try {
      const job = await getJob(jobId)
      const duration = job.segments.length > 0 ? job.segments[job.segments.length - 1].end : 60
      await processClips({
        job_id: jobId,
        approved_moments: [{ start: 0, end: duration, score: 10, use_natural_hook: false, natural_hook: '' }],
        hook, cta, caption_position: captionPos, watermark,
      })
      navigate({ name: 'export', jobId, filename, templateId })
    } catch (e) { console.error(e); setProcessing(false) }
  }

  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'block',
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 7,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  }

  function SectionBtn({ id, icon, lbl }: { id: Section; icon: string; lbl: string }) {
    const active = section === id
    return (
      <button onClick={() => setSection(id)} style={{
        width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13,
        fontWeight: active ? 600 : 400,
        background: active ? accentColor + '18' : 'transparent',
        border: active ? `1px solid ${accentColor}35` : '1px solid transparent',
        color: active ? accentColor : 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
      }}>
        <span>{icon}</span> {lbl}
      </button>
    )
  }

  // Mini 9:16 frame for caption position picker
  function CaptionCard({ pos, active }: { pos: 'top' | 'middle' | 'bottom'; active: boolean }) {
    const label = pos === 'top' ? 'Topo' : pos === 'middle' ? 'Centro' : 'Baixo'
    return (
      <div onClick={() => setCaptionPos(pos)} style={{
        flex: 1, cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
        border: active ? `2px solid ${accentColor}` : '2px solid var(--border)',
        background: active ? accentColor + '10' : 'var(--bg-surface)',
        transition: 'all 0.15s',
      }}>
        {/* mini 9:16 */}
        <div style={{
          aspectRatio: '9/16', background: 'var(--bg-card)',
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* caption bar */}
          <div style={{
            position: 'absolute',
            top: pos === 'top' ? 6 : pos === 'middle' ? '40%' : undefined,
            bottom: pos === 'bottom' ? 6 : undefined,
            left: 4, right: 4, height: 6, borderRadius: 2,
            background: active ? accentColor : 'var(--border-light)',
            transition: 'background 0.15s',
          }} />
          {/* video icon */}
          <div style={{ fontSize: 10, opacity: 0.3 }}>▶</div>
        </div>
        <div style={{
          padding: '4px 0', textAlign: 'center', fontSize: 11, fontWeight: active ? 600 : 400,
          color: active ? accentColor : 'var(--text-secondary)',
        }}>
          {label}
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Preview panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate({ name: 'templates', jobId, filename })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}
          >
            <ArrowLeft size={14} /> Trocar template
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{tmpl.emoji}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{tmpl.name}</span>
          </div>
          {showWmOverlay && (
            <div style={{
              marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: accentColor + '20', color: accentColor,
            }}>
              Clique no preview para posicionar
            </div>
          )}
        </div>

        {/* 9:16 preview */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            height: '100%', maxHeight: 520, aspectRatio: '9/16',
            borderRadius: 20, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, #0e0e1a 0%, #1a1a2e 45%, #0e0e1a 100%)',
            border: `2px solid ${accentColor}40`,
            transition: 'border-color 0.3s',
          }}>
            {/* Simulação de pessoa — radial glow no centro */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 50% 38%, ${accentColor}22 0%, transparent 65%)`,
            }} />
            <div style={{
              position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
              width: '55%', height: '45%',
              background: `radial-gradient(ellipse, ${accentColor}18 0%, transparent 70%)`,
              borderRadius: '50%',
            }} />

            {/* Hook */}
            {hook && (
              <div style={{
                position: 'absolute', top: 20, left: 12, right: 12,
                background: 'rgba(0,0,0,0.82)', borderRadius: 8, padding: '8px 12px',
                fontSize: 12, fontWeight: 700, textAlign: 'center', color: accentColor,
              }}>
                {hook}
              </div>
            )}

            {/* Caption */}
            <div style={{
              position: 'absolute',
              top: captionPos === 'bottom' ? undefined : captionPos === 'middle' ? '44%' : 64,
              bottom: captionPos === 'bottom' ? 64 : undefined,
              left: 12, right: 12,
              background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '8px 12px',
              fontSize: captionBold ? 13 : 11, fontWeight: captionBold ? 700 : 400,
              textAlign: 'center',
              outline: section === 'legenda' ? `2px solid ${accentColor}80` : 'none',
              outlineOffset: 2, transition: 'outline 0.2s',
            }}>
              <span style={{ color: highlightColor }}>LEGENDA</span>{' '}
              <span style={{ color: '#fff' }}>do vídeo aqui...</span>
            </div>

            {/* CTA */}
            {cta && (
              <div style={{
                position: 'absolute', bottom: 20, left: 12, right: 12,
                background: 'rgba(0,0,0,0.82)', borderRadius: 8, padding: '8px 12px',
                fontSize: 12, fontWeight: 700, textAlign: 'center', color: accentColor,
              }}>
                {cta}
              </div>
            )}

            {/* Watermark */}
            {watermark && !showWmOverlay && (
              <div style={{
                ...wmStyle(wmZone, wmSize),
                color: `rgba(255,255,255,${wmOpacity / 100})`,
                fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {wmText}
              </div>
            )}

            {/* ── Watermark zone overlay ── */}
            {showWmOverlay && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                background: 'rgba(0,0,0,0.35)',
              }}>
                {WM_ZONES.map(zone => {
                  const isActive = wmZone === zone
                  // which corner of the zone to show the text
                  const zoneAlign: React.CSSProperties = {
                    display: 'flex',
                    alignItems: zone[0] === 't' ? 'flex-start' : zone[0] === 'b' ? 'flex-end' : 'center',
                    justifyContent: zone[1] === 'l' ? 'flex-start' : zone[1] === 'r' ? 'flex-end' : 'center',
                    padding: 6, cursor: 'pointer',
                    background: isActive ? accentColor + '40' : 'transparent',
                    border: isActive ? `1px solid ${accentColor}` : '1px dashed rgba(255,255,255,0.15)',
                    transition: 'background 0.15s',
                  }
                  return (
                    <div
                      key={zone}
                      style={zoneAlign}
                      onClick={() => setWmZone(zone)}
                    >
                      {isActive && (
                        <span style={{
                          fontSize: { small: 7, medium: 10, large: 13 }[wmSize],
                          color: `rgba(255,255,255,${wmOpacity / 100})`,
                          fontWeight: 700, whiteSpace: 'nowrap',
                          background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: 3,
                        }}>
                          {wmText}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate({ name: 'variations', jobId, filename, templateId })}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Layers size={14} /> Variações
          </button>
          <button
            onClick={handleExport} disabled={processing}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: processing ? 'var(--bg-surface)' : accentColor,
              color: processing ? 'var(--text-secondary)' : '#fff',
              border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {processing
              ? <><div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #fff4', borderTopColor: 'var(--text-secondary)', borderRadius: '50%' }} /> Processando...</>
              : <><Wand2 size={14} /> Exportar Criativo</>
            }
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SectionBtn id="visual" icon="🎨" lbl="Visual" />
          <SectionBtn id="legenda" icon="💬" lbl="Legenda" />
          <SectionBtn id="watermark" icon="💧" lbl="Marca d'água" />
          <SectionBtn id="estrutura" icon="🎯" lbl="Estrutura" />
          <SectionBtn id="movimento" icon="⚡" lbl="Movimento" />
        </div>

        {/* Controls */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>

          {/* ── Visual ── */}
          {section === 'visual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={label}>Expert</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <button
                    onClick={() => setExpertId(null)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, fontSize: 12, textAlign: 'left',
                      border: expertId === null ? '1px solid var(--border-light)' : '1px solid transparent',
                      background: expertId === null ? 'var(--bg-surface)' : 'transparent',
                      color: expertId === null ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    Sem expert — cores do template
                  </button>
                  {Object.values(EXPERTS).map(e => (
                    <button
                      key={e.id}
                      onClick={() => { setExpertId(e.id as ExpertId); setPrimaryColor(e.color); setHighlightColor(e.color) }}
                      style={{
                        padding: '8px 12px', borderRadius: 8, fontSize: 12, textAlign: 'left',
                        border: expertId === e.id ? `1px solid ${e.color}40` : '1px solid transparent',
                        background: expertId === e.id ? e.colorMuted : 'transparent',
                        color: expertId === e.id ? e.color : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, background: e.colorMuted,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: e.color, flexShrink: 0,
                      }}>{e.initials}</div>
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span style={label}>Cor principal</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', padding: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Cor do criativo</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{primaryColor}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Legenda ── */}
          {section === 'legenda' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <span style={label}>Posição da Legenda</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <CaptionCard pos="top" active={captionPos === 'top'} />
                  <CaptionCard pos="middle" active={captionPos === 'middle'} />
                  <CaptionCard pos="bottom" active={captionPos === 'bottom'} />
                </div>
              </div>

              <div>
                <span style={label}>Estilo</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { val: false, label: 'Normal', preview: 'Aa' },
                    { val: true, label: 'Negrito', preview: 'Aa' },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => setCaptionBold(opt.val)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8,
                        border: captionBold === opt.val ? `2px solid ${accentColor}` : '2px solid var(--border)',
                        background: captionBold === opt.val ? accentColor + '10' : 'var(--bg-surface)',
                        color: captionBold === opt.val ? accentColor : 'var(--text-secondary)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: opt.val ? 16 : 13, fontWeight: opt.val ? 800 : 400, marginBottom: 2 }}>{opt.preview}</div>
                      <div style={{ fontSize: 10 }}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={label}>Cor de destaque</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={highlightColor} onChange={e => setHighlightColor(e.target.value)}
                    style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', padding: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Palavras em destaque</div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{highlightColor}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Watermark ── */}
          {section === 'watermark' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Marca d'água</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{wmText}</div>
                </div>
                <button onClick={() => setWatermark(!watermark)} style={{
                  width: 40, height: 22, borderRadius: 11, position: 'relative',
                  background: watermark ? accentColor : 'var(--border)', border: 'none', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: watermark ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                  }} />
                </button>
              </div>

              {watermark && (
                <>
                  <div style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: accentColor + '12', border: `1px solid ${accentColor}30`,
                    fontSize: 12, color: accentColor,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>👆</span>
                    Clique em qualquer zona do preview para posicionar
                  </div>

                  <div>
                    <span style={label}>Tamanho</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {([['small', 'P'], ['medium', 'M'], ['large', 'G']] as const).map(([sz, lbl]) => (
                        <button
                          key={sz}
                          onClick={() => setWmSize(sz)}
                          style={{
                            flex: 1, padding: '8px 0', borderRadius: 8,
                            border: wmSize === sz ? `2px solid ${accentColor}` : '2px solid var(--border)',
                            background: wmSize === sz ? accentColor + '15' : 'var(--bg-surface)',
                            color: wmSize === sz ? accentColor : 'var(--text-secondary)',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: sz === 'small' ? 10 : sz === 'medium' ? 14 : 18, fontWeight: 700, marginBottom: 2 }}>{lbl}</div>
                          <div style={{ fontSize: 10 }}>{sz === 'small' ? 'Pequeno' : sz === 'medium' ? 'Médio' : 'Grande'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={label}>Opacidade — {wmOpacity}%</span>
                    <input
                      type="range" min={20} max={100} value={wmOpacity}
                      onChange={e => setWmOpacity(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span>Suave</span><span>Visível</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Estrutura ── */}
          {section === 'estrutura' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={label}>Texto do Hook</span>
                <textarea value={hook} onChange={e => setHook(e.target.value)}
                  rows={2} style={{ ...input, resize: 'vertical' }}
                  placeholder="Hook nos primeiros segundos..." />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Aparece nos primeiros {tmpl.hookDuration}s
                </div>
              </div>
              <div>
                <span style={label}>Texto do CTA</span>
                <textarea value={cta} onChange={e => setCta(e.target.value)}
                  rows={2} style={{ ...input, resize: 'vertical' }}
                  placeholder="CTA nos últimos segundos..." />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Aparece nos últimos {tmpl.ctaDuration}s
                </div>
              </div>
            </div>
          )}

          {/* ── Movimento ── */}
          {section === 'movimento' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={label}>Intensidade de Zoom</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(['none', 'low', 'medium', 'high'] as const).map(z => (
                    <button key={z} onClick={() => setZoom(z)} style={{
                      padding: '9px 12px', borderRadius: 8, fontSize: 12, textAlign: 'left',
                      background: zoom === z ? accentColor + '18' : 'var(--bg-surface)',
                      border: zoom === z ? `1px solid ${accentColor}40` : '1px solid var(--border)',
                      color: zoom === z ? accentColor : 'var(--text-secondary)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{{ none: 'Nenhum', low: 'Suave', medium: 'Médio', high: 'Intenso' }[z]}</span>
                      <span style={{ fontSize: 11, opacity: 0.6 }}>{{ none: '—', low: '×1.05', medium: '×1.1', high: '×1.2' }[z]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
