'use client'

import { useState, useRef, useCallback } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { Upload, FileText, X, ChevronDown, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

// CSV parser — handles quoted fields
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  for (const line of lines) {
    if (!line.trim()) continue
    const row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    row.push(current.trim())
    rows.push(row)
  }
  return rows
}

const FIELD_OPTIONS = [
  { value: '', label: '— Ignorar coluna —' },
  { value: 'name', label: 'Nome' },
  { value: 'email', label: 'Email *' },
  { value: 'phone', label: 'Telefone / WhatsApp' },
  { value: 'origin', label: 'Origem' },
  { value: 'hotmart_id', label: 'ID Hotmart' },
  { value: 'tmb_id', label: 'ID TMB' },
  { value: 'circle_member_id', label: 'ID Circle' },
]

type ImportState = 'idle' | 'mapped' | 'importing' | 'done' | 'error'

interface ImportResult {
  updated: number
  created: number
  skipped: number
  errors: number
  message: string
}

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<number, string>>({})
  const [state, setState] = useState<ImportState>('idle')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Por favor, use um arquivo CSV. Para Excel: Arquivo → Salvar como → CSV (separado por vírgula).')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length < 2) {
        alert('Arquivo vazio ou sem dados.')
        return
      }
      const [headerRow, ...dataRows] = parsed
      setHeaders(headerRow)
      setRows(dataRows.slice(0, 500)) // limit preview

      // Auto-detect column mapping
      const autoMap: Record<number, string> = {}
      headerRow.forEach((h, i) => {
        const lower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (lower.includes('nome') || lower.includes('name')) autoMap[i] = 'name'
        else if (lower.includes('email') || lower.includes('e-mail')) autoMap[i] = 'email'
        else if (lower.includes('tel') || lower.includes('whats') || lower.includes('fone') || lower.includes('celular')) autoMap[i] = 'phone'
        else if (lower.includes('origem') || lower.includes('source') || lower.includes('plataforma')) autoMap[i] = 'origin'
      })
      setMapping(autoMap)
      setState('mapped')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  function reset() {
    setFileName(null)
    setHeaders([])
    setRows([])
    setMapping({})
    setState('idle')
    setResult(null)
    setImportError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleImport() {
    const emailCol = Object.entries(mapping).find(([, v]) => v === 'email')
    if (!emailCol) {
      alert('Mapeie a coluna de Email antes de importar.')
      return
    }

    setState('importing')
    setImportError(null)

    // Build rows as objects
    const mappedRows = rows.map(row => {
      const obj: Record<string, string> = {}
      Object.entries(mapping).forEach(([colIdx, field]) => {
        if (field && row[parseInt(colIdx)]) {
          obj[field] = row[parseInt(colIdx)]
        }
      })
      return obj
    }).filter(r => r.email)

    try {
      const res = await fetch('/api/import/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setState('done')
      } else {
        setImportError(data.error ?? 'Erro desconhecido')
        setState('error')
      }
    } catch {
      setImportError('Erro de conexão')
      setState('error')
    }
  }

  const previewRows = rows.slice(0, 5)
  const emailMapped = Object.values(mapping).includes('email')

  return (
    <div>
      <PageHeader
        title="Importar CRM"
        description="Importe sua base de contatos e integre com os membros existentes"
      />

      {/* Instructions */}
      <div className="mb-6 border border-[#1a1a1a] bg-[#0a0a0a] p-5">
        <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Como funciona</p>
        <ol className="space-y-1.5 text-sm text-white/50">
          <li><span className="text-white/30 mr-2">1.</span>Exporte seu CRM como <strong className="text-white/70">CSV</strong> (Excel: Arquivo → Salvar como → CSV separado por vírgula)</li>
          <li><span className="text-white/30 mr-2">2.</span>Faça upload do arquivo abaixo</li>
          <li><span className="text-white/30 mr-2">3.</span>Mapeie as colunas do seu arquivo para os campos do sistema</li>
          <li><span className="text-white/30 mr-2">4.</span>Clique em Importar — membros existentes (por email) serão <strong className="text-white/70">atualizados</strong>, novos serão <strong className="text-white/70">criados</strong></li>
        </ol>
      </div>

      {state === 'done' && result && (
        <div className="mb-6 border border-green-800/40 bg-green-950/10 px-5 py-4 flex items-start gap-3">
          <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-400 font-medium">Importação concluída</p>
            <p className="text-xs text-green-400/70 mt-1">{result.message}</p>
            <button onClick={reset} className="text-xs text-white/30 hover:text-white mt-2 transition-colors">
              Importar outro arquivo →
            </button>
          </div>
        </div>
      )}

      {state === 'error' && importError && (
        <div className="mb-6 border border-red-800/40 bg-red-950/10 px-5 py-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{importError}</p>
        </div>
      )}

      {/* Upload zone */}
      {state === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-none cursor-pointer transition-colors p-12 flex flex-col items-center gap-4 ${
            dragging ? 'border-white/40 bg-white/5' : 'border-[#222] hover:border-[#333] hover:bg-white/[0.02]'
          }`}
        >
          <Upload size={32} className="text-white/20" />
          <div className="text-center">
            <p className="text-sm text-white/50">Arraste seu arquivo CSV aqui</p>
            <p className="text-xs text-white/30 mt-1">ou clique para selecionar</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}

      {/* Mapped state: column mapping + preview */}
      {(state === 'mapped' || state === 'importing') && (
        <div className="space-y-6">
          {/* File info bar */}
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] px-5 py-3">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-white/40" />
              <span className="text-sm text-white">{fileName}</span>
              <span className="text-xs text-white/30">{rows.length} linhas</span>
            </div>
            <button onClick={reset} className="text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Column mapping */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <p className="text-sm font-medium text-white">Mapeamento de Colunas</p>
              <p className="text-xs text-white/30 mt-0.5">Associe as colunas do seu arquivo aos campos do sistema. Email é obrigatório.</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {headers.map((header, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/50 truncate" title={header}>{header}</p>
                      <p className="text-[10px] text-white/20 mt-0.5">
                        Ex: {rows[0]?.[i] ?? '—'}
                      </p>
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={mapping[i] ?? ''}
                        onChange={e => setMapping(prev => ({ ...prev, [i]: e.target.value }))}
                        className="w-full bg-[#111] border border-[#222] text-white text-xs py-2 pl-2 pr-6 focus:outline-none focus:border-white/30 appearance-none"
                      >
                        {FIELD_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {!emailMapped && (
                <p className="text-xs text-yellow-500/80 mt-4 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Mapeie a coluna de Email para continuar
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <p className="text-sm font-medium text-white">Prévia dos Dados</p>
              <p className="text-xs text-white/30 mt-0.5">Primeiras {previewRows.length} linhas de {rows.length}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {headers.map((h, i) => (
                      <th key={i} className="text-left text-white/30 px-4 py-2 font-medium whitespace-nowrap">
                        {h}
                        {mapping[i] && <span className="ml-1 text-white/20">→ {FIELD_OPTIONS.find(o => o.value === mapping[i])?.label?.replace(' *', '')}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0f0f0f]">
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-[#111]">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-white/60 whitespace-nowrap max-w-[180px] truncate">
                          {cell || <span className="text-white/20">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">
              {rows.length} linhas serão processadas
            </p>
            <button
              onClick={handleImport}
              disabled={!emailMapped || state === 'importing'}
              className="flex items-center gap-2 bg-white text-black text-sm font-medium px-6 py-2.5 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state === 'importing' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Importar {rows.length} registros
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
