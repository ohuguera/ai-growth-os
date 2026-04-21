import { useState } from 'react'
import { Scissors, Wand2, Map, Bot } from 'lucide-react'

// Módulo 1 — Cortes
import Inbox from './pages/Inbox'
import NovoCortee from './pages/NovoCortee'
import Processamento from './pages/Processamento'
import Resultados from './pages/Resultados'
import AjusteRapido from './pages/AjusteRapido'

// Módulo 2 — Criativos
import EditorHome from './pages/EditorHome'
import EditorProcessing from './pages/EditorProcessing'
import TemplateGallery from './pages/TemplateGallery'
import EditorRapido from './pages/EditorRapido'
import Variacoes from './pages/Variacoes'
import Exportacao from './pages/Exportacao'

// Fluxo
import FluxoEditor from './pages/FluxoEditor'

// Agentes
import AgentesControl from './pages/AgentesControl'

import type { Page, EditorPage } from './types'
import AiAssistant from './components/AiAssistant'
import LoginPage from './pages/LoginPage'

type Module = 'cortes' | 'criativos' | 'fluxo' | 'agentes'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hfive_auth') === '1')
  const [module, setModule] = useState<Module>('cortes')
  const [page, setPage] = useState<Page>({ name: 'inbox' })
  const [editorPage, setEditorPage] = useState<EditorPage>({ name: 'home' })

  function switchModule(m: Module) {
    setModule(m)
    if (m === 'cortes') setPage({ name: 'inbox' })
    if (m === 'criativos') setEditorPage({ name: 'home' })
  }

  const moduleLabel: Record<Module, string> = {
    cortes: 'Sistema de Corte',
    criativos: 'Editor de Criativos',
    fluxo: 'Fluxo Operacional',
    agentes: 'Central de Agentes',
  }

  // Breadcrumb for módulo 1
  function corteBreadCrumb() {
    const items: { label: string; page?: Page }[] = [{ label: 'Inbox', page: { name: 'inbox' } }]
    if (page.name === 'novo') items.push({ label: 'Novo Corte' })
    if (page.name === 'processando') items.push({ label: 'Processando...' })
    if (page.name === 'resultados') items.push({ label: 'Resultados' })
    if (page.name === 'ajuste') {
      items.push({ label: 'Resultados', page: { name: 'resultados', jobId: page.jobId, expertId: page.expertId, liveTitle: '' } })
      items.push({ label: 'Ajuste Rápido' })
    }
    return items
  }

  // Breadcrumb for módulo 2
  function editorBreadCrumb() {
    const items: { label: string; page?: EditorPage }[] = [{ label: 'Início', page: { name: 'home' } }]
    if (editorPage.name === 'processing') items.push({ label: 'Processando...' })
    if (editorPage.name === 'templates') items.push({ label: 'Templates' })
    if (editorPage.name === 'editor') {
      items.push({ label: 'Templates', page: { name: 'templates', jobId: editorPage.jobId, filename: editorPage.filename } })
      items.push({ label: 'Editor' })
    }
    if (editorPage.name === 'variations') {
      items.push({ label: 'Editor', page: { name: 'editor', jobId: editorPage.jobId, filename: editorPage.filename, templateId: editorPage.templateId } })
      items.push({ label: 'Variações' })
    }
    if (editorPage.name === 'export') {
      items.push({ label: 'Editor', page: { name: 'editor', jobId: editorPage.jobId, filename: editorPage.filename, templateId: editorPage.templateId } })
      items.push({ label: 'Exportar' })
    }
    return items
  }

  const breadcrumbs = module === 'cortes' ? corteBreadCrumb() : editorBreadCrumb()

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div style={{
        height: 48, borderBottom: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 0,
        background: 'var(--bg-card)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #38BDF8, #F472B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>✂️</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>HFIVE IA</span>
        </div>

        {/* Module tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '4px', background: 'var(--bg-surface)', borderRadius: 8, marginRight: 16 }}>
          {([
            { id: 'cortes' as Module, label: 'Cortes', icon: <Scissors size={12} /> },
            { id: 'criativos' as Module, label: 'Criativos', icon: <Wand2 size={12} /> },
            { id: 'fluxo' as Module, label: 'Fluxo', icon: <Map size={12} /> },
            { id: 'agentes' as Module, label: 'Agentes', icon: <Bot size={12} /> },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => switchModule(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: module === tab.id ? 'var(--bg-card)' : 'transparent',
                border: module === tab.id ? '1px solid var(--border-light)' : '1px solid transparent',
                color: module === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {breadcrumbs.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/</span>}
              <span
                onClick={item.page && i < breadcrumbs.length - 1 ? () => {
                  if (module === 'cortes') setPage(item.page as Page)
                  else setEditorPage(item.page as EditorPage)
                } : undefined}
                style={{
                  fontSize: 13,
                  color: i === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                  cursor: item.page && i < breadcrumbs.length - 1 ? 'pointer' : 'default',
                }}
              >
                {item.label}
              </span>
            </span>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          Módulo {module === 'cortes' ? '1' : '2'} — {moduleLabel[module]}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* Módulo 1 */}
        {module === 'cortes' && <>
          {page.name === 'inbox' && <Inbox navigate={setPage} />}
          {page.name === 'novo' && <NovoCortee navigate={setPage} />}
          {page.name === 'processando' && (
            <Processamento jobId={page.jobId} expertId={page.expertId} liveTitle={page.liveTitle} presetId={page.presetId} hook={page.hook} cta={page.cta} captionStyle={page.captionStyle} navigate={setPage} />
          )}
          {page.name === 'resultados' && (
            <Resultados jobId={page.jobId} expertId={page.expertId} liveTitle={page.liveTitle} navigate={setPage} />
          )}
          {page.name === 'ajuste' && (
            <AjusteRapido jobId={page.jobId} clipId={page.clipId} expertId={page.expertId} navigate={setPage} />
          )}
        </>}

        {/* Módulo 2 */}
        {module === 'criativos' && <>
          {editorPage.name === 'home' && <EditorHome navigate={setEditorPage} />}
          {editorPage.name === 'processing' && (
            <EditorProcessing jobId={editorPage.jobId} filename={editorPage.filename} navigate={setEditorPage} />
          )}
          {editorPage.name === 'templates' && (
            <TemplateGallery jobId={editorPage.jobId} filename={editorPage.filename} navigate={setEditorPage} />
          )}
          {editorPage.name === 'editor' && (
            <EditorRapido jobId={editorPage.jobId} filename={editorPage.filename} templateId={editorPage.templateId} navigate={setEditorPage} />
          )}
          {editorPage.name === 'variations' && (
            <Variacoes jobId={editorPage.jobId} filename={editorPage.filename} templateId={editorPage.templateId} navigate={setEditorPage} />
          )}
          {editorPage.name === 'export' && (
            <Exportacao jobId={editorPage.jobId} filename={editorPage.filename} templateId={editorPage.templateId} navigate={setEditorPage} />
          )}
        </>}

        {/* Fluxo Operacional */}
        {module === 'fluxo' && <FluxoEditor />}

        {/* Central de Agentes */}
        {module === 'agentes' && <AgentesControl />}
      </div>

      {/* Assistente IA — flutuante em todas as páginas */}
      <AiAssistant
        context={{
          module,
          page: module === 'cortes' ? page.name
            : module === 'criativos' ? editorPage.name
            : module,
        }}
      />
    </div>
  )
}
