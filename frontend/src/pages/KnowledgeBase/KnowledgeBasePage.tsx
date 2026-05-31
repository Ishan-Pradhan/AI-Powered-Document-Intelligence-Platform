import React, { useState } from "react"
import {  FileText, Globe, Plus, Search, Trash2 } from "lucide-react"

interface VectorSource {
  id: string
  name: string
  type: "file" | "url"
  status: "ready" | "processing" | "failed"
  chunks: number
  size?: string
  updatedAt: string
}

const MOCK_SOURCES: VectorSource[] = [
  { id: "1", name: "Q4_Financial_Report.pdf", type: "file", status: "ready", chunks: 142, size: "2.4 MB", updatedAt: "2 hours ago" },
  { id: "2", name: "https://docs.example.com/api-reference", type: "url", status: "ready", chunks: 580, updatedAt: "Yesterday" },
  { id: "3", name: "HR_Onboarding_Policy.docx", type: "file", status: "processing", chunks: 0, size: "840 KB", updatedAt: "Just now" },
]

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState<VectorSource[]>(MOCK_SOURCES)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: VectorSource["status"]) => {
    switch (status) {
      case "ready":
        return <span className="inline-flex items-center gap-1 rounded bg-tropical-teal-500/10 px-2 py-0.5 text-xs font-semibold text-tropical-teal-600">Ready</span>
      case "processing":
        return <span className="inline-flex items-center gap-1 rounded bg-royal-gold-500/10 px-2 py-0.5 text-xs font-semibold text-royal-gold-600 animate-pulse">Processing</span>
      case "failed":
        return <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">Failed</span>
    }
  }

  const handleDelete = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 text-foreground">
      <div className="max-w-4xl mx-auto">
        
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingest documents and sync data sources into the system vector index.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 h-10 rounded-md bg-primary-500 text-white font-medium text-sm transition-opacity hover:opacity-90">
            <Plus className="size-4" />
            Add Document
          </button>
        </div>

        {/* sync summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="border border-border bg-card rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Sources</p>
            <p className="text-3xl font-bold mt-2">{sources.length}</p>
          </div>
          <div className="border border-border bg-card rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vector Chunks</p>
            <p className="text-3xl font-bold mt-2">722</p>
          </div>
          <div className="border border-border bg-card rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Ingested</p>
            <p className="text-3xl font-bold mt-2">2 hours ago</p>
          </div>
        </div>


        {/* list header */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-bold text-lg self-start sm:self-center">Data Sources</h3>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* sources table */}
        <div className="mt-4 border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-muted-foreground">
              <thead className="bg-muted/40 text-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3 border-b border-border">Name</th>
                  <th className="px-6 py-3 border-b border-border">Status</th>
                  <th className="px-6 py-3 border-b border-border">Chunks</th>
                  <th className="px-6 py-3 border-b border-border">Updated</th>
                  <th className="px-6 py-3 border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filteredSources.map((source) => (
                  <tr key={source.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 border-b border-border font-medium flex items-center gap-3">
                      {source.type === "file" ? (
                        <FileText className="size-4 text-primary-500 shrink-0" />
                      ) : (
                        <Globe className="size-4 text-tropical-teal-500 shrink-0" />
                      )}
                      <span className="truncate max-w-50 sm:max-w-xs" title={source.name}>
                        {source.name}
                      </span>
                      {source.size && <span className="text-[10px] text-muted-foreground">({source.size})</span>}
                    </td>
                    <td className="px-6 py-4 border-b border-border">{getStatusBadge(source.status)}</td>
                    <td className="px-6 py-4 border-b border-border text-sm font-mono">{source.chunks}</td>
                    <td className="px-6 py-4 border-b border-border text-xs text-muted-foreground">{source.updatedAt}</td>
                    <td className="px-6 py-4 border-b border-border text-right">
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Source"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSources.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No data sources found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
