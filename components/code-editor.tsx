"use client"

import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  placeholder?: string
  readOnly?: boolean
  filename?: string
}

export function CodeEditor({
  value,
  onChange,
  language = "solidity",
  placeholder,
  readOnly = false,
  filename = "contract.sol",
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Simple syntax highlighting for display mode
  const renderHighlighted = (code: string) => {
    if (!code) return null
    const keywords = new Set(["pragma", "contract", "function", "constructor", "public", "private", "pure", "view", "returns", "modifier", "require", "emit", "event", "address", "indexed"])
    const types = new Set(["string", "uint256", "address", "bool", "memory"])

    return code.split("\n").map((line, i) => {
      const parts = line.split(" ")
      return (
        <div key={i}>
          {parts.map((word, j) => {
            let cls = ""
            if (word.startsWith("//") || word.startsWith("/*") || word.startsWith("*")) cls = "text-green-400"
            else if (keywords.has(word)) cls = "text-purple-400"
            else if (types.has(word)) cls = "text-cyan-400"
            return <span key={j} className={cls}>{word}{j < parts.length - 1 ? " " : ""}</span>
          })}
        </div>
      )
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast({ title: "Copied", description: "Code copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" })
    }
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300 font-mono uppercase">
            {language}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-white" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 w-full h-full">
        {readOnly ? (
          <div className="absolute inset-0 p-4 font-mono text-sm overflow-auto text-slate-300 bg-slate-950">
            <pre>{renderHighlighted(value)}</pre>
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "// Enter your code here..."}
            className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-slate-950 text-slate-200 border-none focus-visible:ring-0 resize-none leading-relaxed"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}
