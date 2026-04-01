import { useState } from 'react'
import { ArrowLeft, Download, Shuffle } from 'lucide-react'
import { TEMPLATES } from '../data/templates'
import type { EditorPage, CreativeTemplate } from '../types'

interface Props {
  jobId: string
  filename: string
  templateId: string
  navigate: (p: EditorPage) => void
}

interface Variation {
  id: string
  label: string
  primaryColor: string
  hook: string
  cta: string
  captionPos: 'top' | 'middle' | 'bottom'
}

function buildVariations(tmpl: CreativeTemplate | undefined): Variation[] {
  if (!tmpl) return []
  return [
    {
      id: 'v1',
      label: 'Original',
      primaryColor: tmpl.primaryColor,
      hook: tmpl.defaultHook,
      cta: tmpl.defaultCta,
      captionPos: tmpl.captionPosition,
    },
    {
      id: 'v2',
      label: 'Variação A',
      primaryColor: '#10B981',
      hook: 'Você vai se arrepender de não ter visto isso...',
      cta: 'Comenta SIM aqui embaixo!',
      captionPos: 'bottom',
    },
    {
      id: 'v3',
      label: 'Variação B',
      primaryColor: '#F59E0B',
      hook: 'Ninguém te contou isso antes:',
      cta: 'Salva esse vídeo!',
      captionPos: 'middle',
    },
    {
      id: 'v4',
      label: 'Variação C',
      primaryColor: '#EC4899',
      hook: 'Isso aconteceu de verdade...',
      cta: 'Link na bio — entra agora!',
      captionPos: 'top',
    },
  ]
}

export default function Variacoes({ jobId, filename, templateId, navigate }: Props) {
  const tmpl = TEMPLATES.find(t => t.id === templateId)
  const [variations] = useState<Variation[]>(() => buildVariations(tmpl))
  const [selected, setSelected] = useState<Set<string>>(new Set(['v1']))

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate({ name: 'editor', jobId, filename, templateId })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Variações</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filename}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', alignSelf: 'center' }}>
            {selected.size} selecionadas
          </div>
          <button
            onClick={() => navigate({ name: 'export', jobId, filename, templateId })}
            disabled={selected.size === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
              background: selected.size > 0 ? (tmpl?.primaryColor || '#6366F1') : 'var(--bg-surface)',
              color: selected.size > 0 ? '#fff' : 'var(--text-muted)',
              borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none',
              cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <Download size={14} /> Exportar selecionadas
          </button>
        </div>
      </div>

      {/* Variations grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Shuffle size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            4 variações geradas automaticamente — cores, hooks e CTAs diferentes
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {variations.map(v => {
            const isSelected = selected.has(v.id)

            return (
              <div
                key={v.id}
                onClick={() => toggleSelect(v.id)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${v.primaryColor}` : '2px solid var(--border)',
                  borderRadius: 14, overflow: 'hidden',
                  background: 'var(--bg-card)',
                  transition: 'all 0.15s',
                }}
              >
                {/* Preview */}
                <div style={{
                  aspectRatio: '9/16',
                  background: 'linear-gradient(180deg, #0e0e1a 0%, #1a1a2e 45%, #0e0e1a 100%)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Radial glow simulando pessoa */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse at 50% 38%, ${v.primaryColor}22 0%, transparent 65%)`,
                  }} />
                  <div style={{
                    position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
                    width: '55%', height: '45%',
                    background: `radial-gradient(ellipse, ${v.primaryColor}18 0%, transparent 70%)`,
                    borderRadius: '50%',
                  }} />

                  {/* Hook */}
                  <div style={{
                    position: 'absolute', top: 14, left: 8, right: 8,
                    background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '5px 8px',
                    fontSize: 9, fontWeight: 700, textAlign: 'center', color: v.primaryColor,
                  }}>
                    {v.hook.length > 40 ? v.hook.slice(0, 40) + '...' : v.hook}
                  </div>

                  {/* Caption */}
                  <div style={{
                    position: 'absolute',
                    top: v.captionPos === 'top' ? 52 : v.captionPos === 'middle' ? '42%' : undefined,
                    bottom: v.captionPos === 'bottom' ? 52 : undefined,
                    left: 8, right: 8,
                    background: 'rgba(0,0,0,0.6)', borderRadius: 4,
                    padding: '4px 6px', fontSize: 8, textAlign: 'center',
                  }}>
                    <span style={{ color: v.primaryColor }}>LEGENDA</span>{' '}
                    <span style={{ color: '#fff' }}>do vídeo...</span>
                  </div>

                  {/* CTA */}
                  <div style={{
                    position: 'absolute', bottom: 14, left: 8, right: 8,
                    background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '5px 8px',
                    fontSize: 9, fontWeight: 700, textAlign: 'center', color: v.primaryColor,
                  }}>
                    {v.cta}
                  </div>

                  {/* Selected check */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 22, height: 22, borderRadius: '50%',
                      background: v.primaryColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{v.label}</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.primaryColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.hook.slice(0, 30)}...
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
