import { useState } from 'react'
import { ArrowLeft, Star } from 'lucide-react'
import { TEMPLATES, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/templates'
import type { EditorPage, TemplateCategory, CreativeTemplate } from '../types'

interface Props {
  jobId: string
  filename: string
  navigate: (p: EditorPage) => void
}

// ── Componente de preview real do template ─────────────────────────────────
function VideoPreview({
  tmpl,
  scale = 1,
  sampleText = 'exemplo de legenda do vídeo aqui...',
}: {
  tmpl: CreativeTemplate
  scale?: number
  sampleText?: string
}) {
  const fs = (n: number) => n * scale

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0e0e1a 0%, #1a1a2e 45%, #0e0e1a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Simulação de pessoa no vídeo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 38%, ${tmpl.primaryColor}22 0%, transparent 65%)`,
      }} />
      <div style={{
        position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
        width: '55%', height: '45%',
        background: `radial-gradient(ellipse, ${tmpl.primaryColor}18 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />

      {/* Hook */}
      <div style={{
        position: 'absolute', top: fs(14), left: fs(8), right: fs(8),
        background: 'rgba(0,0,0,0.82)', borderRadius: fs(5),
        padding: `${fs(5)}px ${fs(8)}px`,
        fontSize: fs(9), fontWeight: 800, textAlign: 'center',
        color: tmpl.primaryColor, letterSpacing: '0.02em',
        lineHeight: 1.3,
      }}>
        {tmpl.defaultHook.length > 40 ? tmpl.defaultHook.slice(0, 40) + '…' : tmpl.defaultHook}
      </div>

      {/* Legenda */}
      <div style={{
        position: 'absolute',
        top: tmpl.captionPosition === 'bottom' ? undefined
          : tmpl.captionPosition === 'middle' ? '42%'
          : fs(52),
        bottom: tmpl.captionPosition === 'bottom' ? fs(52) : undefined,
        left: fs(8), right: fs(8),
        background: 'rgba(0,0,0,0.78)', borderRadius: fs(4),
        padding: `${fs(5)}px ${fs(8)}px`,
        textAlign: 'center', lineHeight: 1.4,
      }}>
        <span style={{
          fontSize: tmpl.captionBold ? fs(9) : fs(8),
          fontWeight: tmpl.captionBold ? 800 : 400,
          color: tmpl.highlightColor,
        }}>
          {sampleText.split(' ').slice(0, 2).join(' ')}
        </span>
        {' '}
        <span style={{
          fontSize: tmpl.captionBold ? fs(9) : fs(8),
          fontWeight: tmpl.captionBold ? 700 : 400,
          color: '#ffffff',
        }}>
          {sampleText.split(' ').slice(2).join(' ')}
        </span>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: fs(14), left: fs(8), right: fs(8),
        background: 'rgba(0,0,0,0.82)', borderRadius: fs(5),
        padding: `${fs(5)}px ${fs(8)}px`,
        fontSize: fs(8), fontWeight: 700, textAlign: 'center',
        color: tmpl.primaryColor,
      }}>
        {tmpl.defaultCta.length > 35 ? tmpl.defaultCta.slice(0, 35) + '…' : tmpl.defaultCta}
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute', top: fs(8), right: fs(8),
        fontSize: fs(6), color: 'rgba(255,255,255,0.45)', fontWeight: 600,
      }}>+18</div>
    </div>
  )
}

export default function TemplateGallery({ jobId, filename, navigate }: Props) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)

  const categories = Object.keys(CATEGORY_LABELS) as TemplateCategory[]
  const filtered = activeCategory === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory)
  const selectedTemplate = TEMPLATES.find(t => t.id === selected)

  function toggleFav(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Esquerda: preview grande ── */}
      <div style={{
        width: 300, borderRight: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 16,
      }}>
        <button
          onClick={() => navigate({ name: 'home' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Preview
        </div>

        {/* 9:16 grande */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            width: '100%', aspectRatio: '9/16', borderRadius: 16, overflow: 'hidden',
            border: selectedTemplate ? `2px solid ${selectedTemplate.primaryColor}50` : '2px solid var(--border)',
            transition: 'border-color 0.3s',
            flexShrink: 0,
          }}>
            {selectedTemplate ? (
              <VideoPreview tmpl={selectedTemplate} scale={1.6} sampleText="resultado incrível que ninguém te contou" />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(180deg, #0e0e1a, #1a1a2e)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <div style={{ fontSize: 32, opacity: 0.3 }}>🎬</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '0 16px' }}>
                  Selecione um template para visualizar
                </div>
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{selectedTemplate.name}</div>
              <div style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: CATEGORY_COLORS[selectedTemplate.category] + '20',
                color: CATEGORY_COLORS[selectedTemplate.category],
              }}>
                {CATEGORY_LABELS[selectedTemplate.category]}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => selected && navigate({ name: 'editor', jobId, filename, templateId: selected })}
          disabled={!selected}
          style={{
            width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: selected ? (selectedTemplate?.primaryColor || '#6366F1') : 'var(--bg-surface)',
            color: selected ? '#fff' : 'var(--text-muted)',
            border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          Usar este template →
        </button>
      </div>

      {/* ── Direita: biblioteca ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Biblioteca de Templates</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            {filename} · {TEMPLATES.length} templates
          </div>

          {/* Category tabs */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14,
            borderBottom: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, flexShrink: 0,
                background: activeCategory === 'all' ? 'var(--bg-surface)' : 'transparent',
                border: activeCategory === 'all' ? '1px solid var(--border-light)' : '1px solid transparent',
                color: activeCategory === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              Todos ({TEMPLATES.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, flexShrink: 0,
                  background: activeCategory === cat ? CATEGORY_COLORS[cat] + '20' : 'transparent',
                  border: activeCategory === cat ? `1px solid ${CATEGORY_COLORS[cat]}40` : '1px solid transparent',
                  color: activeCategory === cat ? CATEGORY_COLORS[cat] : 'var(--text-secondary)',
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
          }}>
            {filtered.map(tmpl => {
              const isSelected = selected === tmpl.id
              const isFav = favorites.has(tmpl.id)

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelected(tmpl.id)}
                  style={{
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    border: isSelected ? `2px solid ${tmpl.primaryColor}` : '2px solid var(--border)',
                    transition: 'border-color 0.15s, transform 0.15s',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Mini 9:16 preview */}
                  <div style={{ aspectRatio: '9/16', position: 'relative' }}>
                    <VideoPreview tmpl={tmpl} scale={1} sampleText="resultado que mudou tudo pra mim" />

                    {/* Favorito */}
                    <button
                      onClick={e => toggleFav(tmpl.id, e)}
                      style={{
                        position: 'absolute', top: 6, right: 6, zIndex: 2,
                        width: 22, height: 22, borderRadius: '50%', border: 'none',
                        background: isFav ? '#F59E0B30' : 'rgba(0,0,0,0.5)',
                        color: isFav ? '#F59E0B' : 'rgba(255,255,255,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Star size={11} fill={isFav ? '#F59E0B' : 'none'} />
                    </button>

                    {/* Selecionado */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 6, left: 6, zIndex: 2,
                        width: 20, height: 20, borderRadius: '50%',
                        background: tmpl.primaryColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff', fontWeight: 700,
                      }}>✓</div>
                    )}
                  </div>

                  {/* Nome e categoria */}
                  <div style={{
                    padding: '8px 10px',
                    background: isSelected ? tmpl.primaryColor + '12' : 'var(--bg-card)',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {tmpl.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 600,
                        color: CATEGORY_COLORS[tmpl.category],
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {tmpl.emoji} {CATEGORY_LABELS[tmpl.category]}
                      </div>
                      {tmpl.performanceIndicator && (
                        <div style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 5px',
                          borderRadius: 4, flexShrink: 0,
                          background: tmpl.primaryColor + '25',
                          color: tmpl.primaryColor,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {tmpl.performanceIndicator}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
