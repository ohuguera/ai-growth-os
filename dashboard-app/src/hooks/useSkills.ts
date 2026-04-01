import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Skill {
  id: string
  name: string
  slug: string
  description: string
  prompt_template: string
  category: 'copy' | 'corte' | 'template' | 'analise'
  nicho: string
  ativo: boolean
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('skills')
      .select('*')
      .eq('ativo', true)
      .order('category')
      .then(({ data }) => {
        if (data) setSkills(data as Skill[])
        setLoading(false)
      })
  }, [])

  async function executeSkill(skill: Skill, variables: Record<string, string>): Promise<string> {
    let prompt = skill.prompt_template
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replaceAll(`{{${key}}}`, value)
    }

    const apiKey = (import.meta as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json() as { content: { type: string; text: string }[] }
    const output = data.content.find(c => c.type === 'text')?.text ?? ''

    // salva histórico
    await supabase.from('skill_executions').insert({
      skill_id: skill.id,
      input: variables,
      output,
    })

    return output
  }

  return { skills, loading, executeSkill }
}
