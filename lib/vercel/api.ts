const VERCEL_API = 'https://api.vercel.com'

interface VercelEnvVar {
  id: string
  key: string
  value: string
  target: string[]
  type: string
}

function projectUrl(projectId: string, teamId?: string) {
  const base = `${VERCEL_API}/v10/projects/${projectId}/env`
  return teamId ? `${base}?teamId=${teamId}` : base
}

export async function listVercelEnvVars(
  token: string,
  projectId: string,
  teamId?: string
): Promise<VercelEnvVar[]> {
  const url = projectUrl(projectId, teamId)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel API error (list): ${res.status} — ${body}`)
  }
  const data = await res.json()
  return (data.envs ?? []) as VercelEnvVar[]
}

export async function upsertVercelEnvVar(
  token: string,
  projectId: string,
  key: string,
  value: string,
  teamId?: string
): Promise<void> {
  const existing = await listVercelEnvVars(token, projectId, teamId)
  const found = existing.find(e => e.key === key)

  if (found) {
    // PATCH para atualizar existente
    const patchUrl = `${VERCEL_API}/v10/projects/${projectId}/env/${found.id}${teamId ? `?teamId=${teamId}` : ''}`
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, target: ['production'] }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Vercel API error (patch ${key}): ${res.status} — ${body}`)
    }
  } else {
    // POST para criar nova
    const postUrl = projectUrl(projectId, teamId)
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value, type: 'plain', target: ['production'] }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Vercel API error (post ${key}): ${res.status} — ${body}`)
    }
  }
}

export async function triggerVercelRedeploy(
  token: string,
  projectId: string,
  teamId?: string
): Promise<void> {
  // Buscar deployment de produção mais recente
  const listUrl = `${VERCEL_API}/v6/deployments?projectId=${projectId}&limit=1&target=production${teamId ? `&teamId=${teamId}` : ''}`
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!listRes.ok) {
    const body = await listRes.text()
    throw new Error(`Vercel API error (list deployments): ${listRes.status} — ${body}`)
  }
  const listData = await listRes.json()
  const deployments: Array<{ uid: string; name: string }> = listData.deployments ?? []
  if (!deployments.length) {
    throw new Error('Nenhum deployment de produção encontrado para redeploy.')
  }

  const { uid: deploymentId, name } = deployments[0]

  // Disparar redeploy
  const redeployUrl = `${VERCEL_API}/v13/deployments${teamId ? `?teamId=${teamId}` : ''}`
  const redeployRes = await fetch(redeployUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deploymentId, name, target: 'production' }),
  })
  if (!redeployRes.ok) {
    const body = await redeployRes.text()
    throw new Error(`Vercel API error (redeploy): ${redeployRes.status} — ${body}`)
  }
}
