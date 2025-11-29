"use client"

import { Editor } from '@monaco-editor/react'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'plutus' | 'aiken' | 'solidity'
  readOnly?: boolean
  height?: string
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '500px'
}: CodeEditorProps) {

  const languageMap = {
    plutus: 'haskell',
    aiken: 'rust', // Aiken syntax is similar to Rust
    solidity: 'solidity'
  }

  return (
    <Card className="overflow-hidden bg-slate-950 border-slate-800 relative">
      <Editor
        height={height}
        language={languageMap[language]}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        loading={<Loader2 className="w-8 h-8 animate-spin text-purple-500" />}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          padding: { top: 16, bottom: 16 },
          renderWhitespace: 'selection',
        }}
      />
    </Card>
  )
}
