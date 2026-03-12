# GUARDIAN AIOX — Lei do Sistema

> **Leia este arquivo antes de criar qualquer coisa nova.**
> Toda IA, todo desenvolvedor, toda ferramenta deve seguir estas regras.

---

## O que é o GuardianAIOS

O GuardianAIOS é o guardião da consistência do sistema.
Garante que tudo que for criado — página, componente, dado, agente — siga os mesmos padrões.

**Sem Guardian:** cada coisa nova quebra o visual, a IA inventa regras, o sistema vira caos.
**Com Guardian:** todo output encaixa no próximo, tudo parece feito pela mesma mão.

---

## Regras de Design

| Regra | O que fazer |
|-------|-------------|
| Cores | Apenas `G.colors` de `design-system/index.tsx` |
| Espaçamento | Apenas `tokens.space` de `design-system/tokens.ts` |
| Fonte | Apenas `Inter` — nunca adicione outra |
| Componentes | Apenas `Btn`, `GlassCard`, `Badge` do design-system |
| Ícones | Apenas `lucide-react` — nunca outro pacote de ícone |
| Source Trail | **Todo card deve mostrar:** Modo + Agente + Fonte |

---

## Regras de Dados

| Dado | Onde fica |
|------|-----------|
| Tendências | `src/data/trends.ts` |
| Eventos/Calendário | `src/data/events.ts` |
| Concorrentes bet | `src/data/competitors.ts` |
| Grandes marcas | `src/data/brands.ts` |
| Definição de agentes | `src/data/agents.ts` |
| Contratos I/O | `src/data/schema.ts` |

**NUNCA** coloque dados hardcoded dentro de componentes ou páginas.

---

## Regras de Agentes

| Regra | Detalhe |
|-------|---------|
| Todo output | Segue `AgentOutput` de `schema.ts` |
| Todo card | Exibe `trail.mode` + `trail.agentName` + `trail.sourceName` |
| Conexões | `connectsTo` define quem consome o output |
| Metadados | Impact + Complexity sempre declarados |

---

## Regras de Páginas

Antes de criar uma página nova:

1. Registre o `PageContract` em `src/data/schema.ts → PAGE_CONTRACTS`
2. Declare: `agent`, `inputFrom`, `outputTo`, `impact`, `complexity`, `modeAware`
3. Se `modeAware: true`, use `useMode()` do `modeContext`
4. Importe dados apenas de `src/data/`
5. Importe componentes apenas de `src/design-system/`

---

## Regras de Modo

| Modo | Fonte de dados | Cor |
|------|---------------|-----|
| Modo iGaming | `competitors.ts` + social iGaming | `#0A84FF` |
| Modo Grandes Marcas | `brands.ts` + social marcas BR | `#BF5AF2` |

- Todo output mode-aware mostra qual modo gerou
- Mudar de modo = trocar a fonte, não a estrutura

---

## Regra de Output → Input

```
AgentOutput {
  agentId: quem gerou
  outputType: tipo de dado
  impact: alto | médio | baixo
  complexity: alta | média | baixa
  trail: { mode, modeLabel, agentId, agentName, sourceName }
  connectsTo: [agentes que consomem]
}
```

**Regra de ouro:** O output de um agente DEVE ser um input válido do próximo.
Sem isso, o sistema não flui.

---

## Checklist antes de criar algo novo

- [ ] Existe dado correspondente em `src/data/`?
- [ ] Existe contrato em `PAGE_CONTRACTS` ou `GUARDIAN_RULES`?
- [ ] Usa apenas cores de `G.colors`?
- [ ] Usa apenas componentes de `design-system`?
- [ ] Mostra Source Trail (modo + agente + fonte)?
- [ ] Declarou `impact` e `complexity`?
- [ ] Definiu `connectsTo` e `receiveFrom`?

Se qualquer resposta for NÃO → pare e corrija antes de continuar.

---

*GuardianAIOS v1.0 — Synkra AIOX*
