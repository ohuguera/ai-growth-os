import { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Handle,
  Position,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Upload, Mic, Wand2, Scissors, Film, Download,
  Palette, Sliders, Layers, Share2, Bot, Zap, Plus, Trash2, RotateCcw, Save,
} from 'lucide-react'

const FLOW_STORAGE_KEY = 'hfive_flow_v1'

function loadFlow(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const raw = localStorage.getItem(FLOW_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveFlow(nodes: Node[], edges: Edge[]) {
  try {
    // Nós do React Flow têm ReactElement em data.icon — não serializável.
    // Salvamos apenas os dados sem o ícone; ao carregar, o ícone é restaurado pelo label.
    const serializableNodes = nodes.map(n => ({
      ...n,
      data: { ...(n.data as object), icon: null },
    }))
    localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ nodes: serializableNodes, edges }))
  } catch { /* quota exceeded — ignore */ }
}

// ── Tipos de nó ───────────────────────────────────────────────────────────────
type NodeKind =
  | 'trigger' | 'process' | 'ai' | 'output' | 'decision' | 'agent'

interface FlowNodeData {
  label: string
  description: string
  kind: NodeKind
  icon: React.ReactNode
  color: string
  status?: 'idle' | 'running' | 'done' | 'error'
  module?: 'cortes' | 'criativos' | 'agentes'
}

// ── Paleta de cores por tipo ──────────────────────────────────────────────────
const KIND_COLORS: Record<NodeKind, string> = {
  trigger:  '#38BDF8',
  process:  '#818CF8',
  ai:       '#F472B6',
  output:   '#10B981',
  decision: '#F59E0B',
  agent:    '#A78BFA',
}

const STATUS_GLOW: Record<string, string> = {
  running: '0 0 16px rgba(56,189,248,0.5)',
  done:    '0 0 12px rgba(16,185,129,0.4)',
  error:   '0 0 12px rgba(239,68,68,0.4)',
  idle:    'none',
}

// ── Componente de nó custom ───────────────────────────────────────────────────
function FlowNode({ data, selected }: { data: FlowNodeData; selected: boolean }) {
  const c = data.color
  const glow = data.status ? STATUS_GLOW[data.status] : 'none'

  return (
    <div style={{
      background: '#0d0d1a',
      border: `1px solid ${selected ? c : c + '50'}`,
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 180,
      maxWidth: 220,
      boxShadow: selected
        ? `0 0 0 2px ${c}40, ${glow}`
        : glow || '0 4px 20px rgba(0,0,0,0.5)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Corner accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 3, height: '100%',
        background: `linear-gradient(180deg, ${c}, transparent)`,
        borderRadius: '12px 0 0 12px',
      }} />

      {/* Status dot */}
      {data.status && data.status !== 'idle' && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 7, height: 7, borderRadius: '50%',
          background: data.status === 'done' ? '#10B981'
            : data.status === 'running' ? '#38BDF8'
            : '#EF4444',
          boxShadow: `0 0 6px ${data.status === 'done' ? '#10B981' : data.status === 'running' ? '#38BDF8' : '#EF4444'}`,
        }} />
      )}

      {/* Handle top (entrada) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: c, border: 'none',
          width: 8, height: 8,
          top: -4,
        }}
      />

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${c}18`,
          border: `1px solid ${c}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c,
        }}>
          {data.icon}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0', lineHeight: 1.3 }}>
          {data.label}
        </div>
      </div>

      <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.4, paddingLeft: 36 }}>
        {data.description}
      </div>

      {/* Module badge */}
      {data.module && (
        <div style={{
          marginTop: 8, paddingLeft: 36,
          display: 'flex', gap: 4,
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            padding: '2px 6px', borderRadius: 4,
            background: `${c}15`, color: c,
            textTransform: 'uppercase',
          }}>
            {data.module}
          </span>
        </div>
      )}

      {/* Handle bottom (saída) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: c, border: 'none',
          width: 8, height: 8,
          bottom: -4,
        }}
      />
    </div>
  )
}

// ── Catálogo de nós disponíveis para adicionar ────────────────────────────────
const NODE_CATALOG = [
  { kind: 'trigger'  as NodeKind, label: 'Upload de vídeo',      icon: <Upload size={12} />,   color: '#38BDF8', description: 'Recebe arquivo de vídeo', module: 'cortes'   as const },
  { kind: 'ai'       as NodeKind, label: 'Recorte de IA',        icon: <Wand2 size={12} />,    color: '#F472B6', description: 'Prompt ClipAnything',     module: 'cortes'   as const },
  { kind: 'process'  as NodeKind, label: 'Transcrição Whisper',  icon: <Mic size={12} />,      color: '#818CF8', description: 'Análise de áudio com IA', module: 'cortes'   as const },
  { kind: 'process'  as NodeKind, label: 'Detectar momentos',    icon: <Scissors size={12} />, color: '#818CF8', description: 'Picos de engajamento',    module: 'cortes'   as const },
  { kind: 'process'  as NodeKind, label: 'Gerar cortes',         icon: <Film size={12} />,     color: '#818CF8', description: 'FFmpeg + legendas',       module: 'cortes'   as const },
  { kind: 'output'   as NodeKind, label: 'Exportar clipes',      icon: <Download size={12} />, color: '#10B981', description: 'Download / distribuição', module: 'cortes'   as const },
  { kind: 'trigger'  as NodeKind, label: 'Selecionar template',  icon: <Palette size={12} />,  color: '#38BDF8', description: 'Template de criativo',    module: 'criativos' as const },
  { kind: 'process'  as NodeKind, label: 'Editor rápido',        icon: <Sliders size={12} />,  color: '#818CF8', description: 'Hook + legenda + CTA',    module: 'criativos' as const },
  { kind: 'process'  as NodeKind, label: 'Gerar variações',      icon: <Layers size={12} />,   color: '#818CF8', description: 'Múltiplas versões',       module: 'criativos' as const },
  { kind: 'output'   as NodeKind, label: 'Distribuição',         icon: <Share2 size={12} />,   color: '#10B981', description: 'Publicar nas redes',       module: 'criativos' as const },
  { kind: 'agent'    as NodeKind, label: 'Agente IA',            icon: <Bot size={12} />,      color: '#A78BFA', description: 'Worker autônomo',         module: 'agentes'  as const },
  { kind: 'decision' as NodeKind, label: 'Validação',            icon: <Zap size={12} />,      color: '#F59E0B', description: 'Aprovação humana',        module: undefined },
]

// ── Nós e arestas iniciais ────────────────────────────────────────────────────
const INITIAL_NODES: Node[] = [
  // === MÓDULO CORTES ===
  {
    id: 'c1', type: 'flowNode', position: { x: 80, y: 40 },
    data: { label: 'Upload de vídeo', description: 'Arquivo .mp4 / .mov / URL', kind: 'trigger', icon: <Upload size={14} />, color: '#38BDF8', status: 'done', module: 'cortes' },
  },
  {
    id: 'c2', type: 'flowNode', position: { x: 80, y: 180 },
    data: { label: 'Recorte de IA', description: 'Prompt ClipAnything opcional', kind: 'ai', icon: <Wand2 size={14} />, color: '#F472B6', status: 'done', module: 'cortes' },
  },
  {
    id: 'c3', type: 'flowNode', position: { x: 80, y: 320 },
    data: { label: 'Transcrição Whisper', description: 'Análise de áudio com IA', kind: 'process', icon: <Mic size={14} />, color: '#818CF8', status: 'done', module: 'cortes' },
  },
  {
    id: 'c4', type: 'flowNode', position: { x: 80, y: 460 },
    data: { label: 'Detectar momentos', description: 'Score de engajamento por trecho', kind: 'process', icon: <Scissors size={14} />, color: '#818CF8', status: 'done', module: 'cortes' },
  },
  {
    id: 'c5', type: 'flowNode', position: { x: 80, y: 600 },
    data: { label: 'Validação humana', description: 'Aprovação dos momentos selecionados', kind: 'decision', icon: <Zap size={14} />, color: '#F59E0B', status: 'idle', module: 'cortes' },
  },
  {
    id: 'c6', type: 'flowNode', position: { x: 80, y: 740 },
    data: { label: 'Gerar cortes', description: 'FFmpeg + legendas + identidade', kind: 'process', icon: <Film size={14} />, color: '#818CF8', status: 'idle', module: 'cortes' },
  },
  {
    id: 'c7', type: 'flowNode', position: { x: 80, y: 880 },
    data: { label: 'Exportar clipes', description: 'Download · Drive · Redes sociais', kind: 'output', icon: <Download size={14} />, color: '#10B981', status: 'idle', module: 'cortes' },
  },

  // === MÓDULO CRIATIVOS ===
  {
    id: 'cr1', type: 'flowNode', position: { x: 420, y: 40 },
    data: { label: 'Selecionar template', description: 'Depoimento · Ganho · Viral', kind: 'trigger', icon: <Palette size={14} />, color: '#38BDF8', status: 'idle', module: 'criativos' },
  },
  {
    id: 'cr2', type: 'flowNode', position: { x: 420, y: 180 },
    data: { label: 'Editor rápido', description: 'Hook + legenda + CTA + watermark', kind: 'process', icon: <Sliders size={14} />, color: '#818CF8', status: 'idle', module: 'criativos' },
  },
  {
    id: 'cr3', type: 'flowNode', position: { x: 420, y: 320 },
    data: { label: 'Gerar variações', description: 'Múltiplas versões do criativo', kind: 'process', icon: <Layers size={14} />, color: '#818CF8', status: 'idle', module: 'criativos' },
  },
  {
    id: 'cr4', type: 'flowNode', position: { x: 420, y: 460 },
    data: { label: 'Validação criativo', description: 'Aprovação antes de publicar', kind: 'decision', icon: <Zap size={14} />, color: '#F59E0B', status: 'idle', module: 'criativos' },
  },
  {
    id: 'cr5', type: 'flowNode', position: { x: 420, y: 600 },
    data: { label: 'Distribuição', description: 'Instagram · TikTok · YouTube', kind: 'output', icon: <Share2 size={14} />, color: '#10B981', status: 'idle', module: 'criativos' },
  },

  // === AGENTES ===
  {
    id: 'ag1', type: 'flowNode', position: { x: 740, y: 180 },
    data: { label: 'Agente de revisão', description: 'Analisa qualidade dos cortes', kind: 'agent', icon: <Bot size={14} />, color: '#A78BFA', status: 'idle', module: 'agentes' },
  },
  {
    id: 'ag2', type: 'flowNode', position: { x: 740, y: 380 },
    data: { label: 'Agente de copy', description: 'Sugere hooks e CTAs otimizados', kind: 'agent', icon: <Bot size={14} />, color: '#A78BFA', status: 'idle', module: 'agentes' },
  },
]

const INITIAL_EDGES: Edge[] = [
  // Cortes flow
  { id: 'e-c1-c2', source: 'c1', target: 'c2', animated: true, style: { stroke: '#38BDF8', strokeWidth: 1.5 } },
  { id: 'e-c2-c3', source: 'c2', target: 'c3', animated: true, style: { stroke: '#F472B680', strokeWidth: 1.5 } },
  { id: 'e-c3-c4', source: 'c3', target: 'c4', animated: false, style: { stroke: '#818CF860', strokeWidth: 1.5 } },
  { id: 'e-c4-c5', source: 'c4', target: 'c5', animated: false, style: { stroke: '#818CF860', strokeWidth: 1.5 } },
  { id: 'e-c5-c6', source: 'c5', target: 'c6', animated: false, style: { stroke: '#F59E0B60', strokeWidth: 1.5 } },
  { id: 'e-c6-c7', source: 'c6', target: 'c7', animated: false, style: { stroke: '#818CF860', strokeWidth: 1.5 } },
  // Criativos flow
  { id: 'e-cr1-cr2', source: 'cr1', target: 'cr2', animated: false, style: { stroke: '#38BDF860', strokeWidth: 1.5 } },
  { id: 'e-cr2-cr3', source: 'cr2', target: 'cr3', animated: false, style: { stroke: '#818CF860', strokeWidth: 1.5 } },
  { id: 'e-cr3-cr4', source: 'cr3', target: 'cr4', animated: false, style: { stroke: '#818CF860', strokeWidth: 1.5 } },
  { id: 'e-cr4-cr5', source: 'cr4', target: 'cr5', animated: false, style: { stroke: '#F59E0B60', strokeWidth: 1.5 } },
  // Cross-module: corte → criativo
  { id: 'e-c7-cr1', source: 'c7', target: 'cr1', animated: false, style: { stroke: '#10B98140', strokeWidth: 1, strokeDasharray: '6 3' } },
  // Agents
  { id: 'e-c4-ag1', source: 'c4', target: 'ag1', animated: false, style: { stroke: '#A78BFA60', strokeWidth: 1.5 } },
  { id: 'e-cr2-ag2', source: 'cr2', target: 'ag2', animated: false, style: { stroke: '#A78BFA60', strokeWidth: 1.5 } },
]

const NODE_TYPES: NodeTypes = { flowNode: FlowNode }

// ── Legenda ───────────────────────────────────────────────────────────────────
const LEGEND = [
  { kind: 'trigger'  as NodeKind, label: 'Gatilho' },
  { kind: 'ai'       as NodeKind, label: 'IA / Prompt' },
  { kind: 'process'  as NodeKind, label: 'Processo' },
  { kind: 'decision' as NodeKind, label: 'Validação' },
  { kind: 'agent'    as NodeKind, label: 'Agente' },
  { kind: 'output'   as NodeKind, label: 'Saída' },
]

let nodeIdCounter = 100

function resolveIcon(label: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    'Upload de vídeo': <Upload size={14} />, 'Recorte de IA': <Wand2 size={14} />,
    'Transcrição Whisper': <Mic size={14} />, 'Detectar momentos': <Scissors size={14} />,
    'Gerar cortes': <Film size={14} />, 'Exportar clipes': <Download size={14} />,
    'Selecionar template': <Palette size={14} />, 'Editor rápido': <Sliders size={14} />,
    'Gerar variações': <Layers size={14} />, 'Distribuição': <Share2 size={14} />,
    'Agente de revisão': <Bot size={14} />, 'Agente de copy': <Bot size={14} />,
    'Validação humana': <Zap size={14} />, 'Validação criativo': <Zap size={14} />,
    'Agente IA': <Bot size={14} />, 'Validação': <Zap size={14} />,
  }
  return map[label] ?? <Bot size={14} />
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function FluxoEditor() {
  const saved = loadFlow()
  const initNodes = saved
    ? saved.nodes.map(n => ({ ...n, data: { ...(n.data as object), icon: resolveIcon((n.data as unknown as FlowNodeData).label) } }))
    : INITIAL_NODES
  const initEdges = saved ? saved.edges : INITIAL_EDGES

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)
  const [showCatalog, setShowCatalog] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // Auto-save a cada mudança (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      saveFlow(nodes, edges)
      setSavedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 800)
    return () => clearTimeout(t)
  }, [nodes, edges])

  function resetFlow() {
    if (!confirm('Resetar para o fluxo padrão? Todas as alterações serão perdidas.')) return
    localStorage.removeItem(FLOW_STORAGE_KEY)
    setNodes(INITIAL_NODES)
    setEdges(INITIAL_EDGES)
    setSavedAt(null)
  }

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges(eds =>
        addEdge({
          ...connection,
          animated: false,
          style: { stroke: '#38BDF880', strokeWidth: 1.5 },
        }, eds)
      ),
    [setEdges]
  )

  function addNode(template: typeof NODE_CATALOG[0]) {
    const id = `custom_${++nodeIdCounter}`
    const newNode: Node = {
      id,
      type: 'flowNode',
      position: { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 },
      data: {
        label: template.label,
        description: template.description,
        kind: template.kind,
        icon: template.icon,
        color: template.color,
        status: 'idle',
        module: template.module,
      },
    }
    setNodes(ns => [...ns, newNode])
    setShowCatalog(false)
  }

  function deleteSelected() {
    if (!selectedNode) return
    setNodes(ns => ns.filter(n => n.id !== selectedNode))
    setEdges(es => es.filter(e => e.source !== selectedNode && e.target !== selectedNode))
    setSelectedNode(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#06060e' }}>
      {/* Toolbar */}
      <div style={{
        height: 48, borderBottom: '1px solid #1a1a2e', flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10,
        background: '#08080E',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginRight: 8 }}>
          Fluxo Operacional
        </span>

        <button
          onClick={() => setShowCatalog(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: showCatalog ? 'rgba(56,189,248,0.15)' : '#141420',
            border: `1px solid ${showCatalog ? 'rgba(56,189,248,0.4)' : '#1e1e32'}`,
            color: showCatalog ? '#38BDF8' : '#64748B',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Plus size={13} /> Adicionar nó
        </button>

        {selectedNode && (
          <button
            onClick={deleteSelected}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#EF444415', border: '1px solid #EF444430',
              color: '#EF4444', cursor: 'pointer',
            }}
          >
            <Trash2 size={12} /> Remover nó
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedAt && (
            <span style={{ fontSize: 10, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={10} /> Salvo {savedAt}
            </span>
          )}
          <button
            onClick={resetFlow}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
              background: 'transparent', border: '1px solid #1e1e32',
              color: '#334155', cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#334155' }}>
          {LEGEND.map(l => (
            <span key={l.kind} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 2,
                background: KIND_COLORS[l.kind],
                display: 'inline-block',
              }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Catalog drawer */}
      {showCatalog && (
        <div style={{
          position: 'absolute', top: 97, left: 20, zIndex: 100,
          background: '#0d0d1a', border: '1px solid #1e1e32', borderRadius: 12,
          padding: 16, width: 280,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Catálogo de nós
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NODE_CATALOG.map((item, i) => (
              <button
                key={i}
                onClick={() => addNode(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, textAlign: 'left',
                  background: '#0a0a14', border: '1px solid #1a1a2e',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.borderColor = item.color + '40'
                  el.style.background = item.color + '08'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.borderColor = '#1a1a2e'
                  el.style.background = '#0a0a14'
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: item.color + '18', border: `1px solid ${item.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* React Flow canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          onNodeClick={(_, node) => setSelectedNode(node.id)}
          onPaneClick={() => { setSelectedNode(null); setShowCatalog(false) }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
          style={{ background: '#06060e' }}
          defaultEdgeOptions={{
            style: { strokeWidth: 1.5 },
          }}
        >
          <Background
            color="#1a1a2e"
            gap={28}
            size={1}
          />
          <Controls
            style={{
              background: '#0d0d1a',
              border: '1px solid #1e1e32',
              borderRadius: 10,
            }}
          />
          <MiniMap
            style={{
              background: '#08080E',
              border: '1px solid #1e1e32',
              borderRadius: 10,
            }}
            nodeColor={(n) => {
              const d = n.data as unknown as FlowNodeData
              return (d.color ?? '#38BDF8') + '80'
            }}
            maskColor="rgba(6,6,14,0.7)"
          />

          {/* Hint */}
          <Panel position="bottom-center">
            <div style={{
              fontSize: 10, color: '#1e1e32', fontWeight: 600,
              letterSpacing: '0.08em', marginBottom: 8,
            }}>
              ARRASTE NÓS · CONECTE HANDLES · SCROLL PARA ZOOM
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}
