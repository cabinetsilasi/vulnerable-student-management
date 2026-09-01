"use client"

import { useState } from "react"
import { AssignmentWithRelations } from "@/lib/types"
import { SCHOOL_INFO } from "@/lib/store"
import { Mail, Send, Copy, Check, Key, Link as LinkIcon, Sparkles, AlertCircle } from "lucide-react"

interface EmailDispatchCenterProps {
  assignments: AssignmentWithRelations[]
  onUpdateStatus: (id: string, status: any, invited: boolean) => Promise<void>
}

export function EmailDispatchCenter({ assignments, onUpdateStatus }: EmailDispatchCenterProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [batchSending, setBatchSending] = useState(false)

  // Custom template state
  const [subjectTemplate, setSubjectTemplate] = useState(
    `Fișă de identificare elevi vulnerabili 2026-2027 - {CLASA} (${SCHOOL_INFO.unitate})`
  )
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [sendStatusMessage, setSendStatusMessage] = useState<string | null>(null)

  const getFullLink = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/completare?token=${token}`
    }
    return `/completare?token=${token}`
  }

  const handleCopyLink = (token: string, id: string) => {
    const link = getFullLink(token)
    navigator.clipboard.writeText(link)
    setCopiedId(`link-${id}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin)
    setCopiedId(`pin-${id}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSendSingleEmail = async (assign: AssignmentWithRelations) => {
    if (!assign.teacher.email) {
      alert(`Cadru didactic ${assign.teacher.full_name} nu are configurată o adresă de email!`)
      return
    }

    setSendingId(assign.id)
    setSendStatusMessage(null)

    try {
      const link = getFullLink(assign.token)
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: assign.teacher.email,
          teacherName: assign.teacher.full_name,
          className: assign.class.name,
          pin: assign.pin,
          tokenLink: link,
          customSubject: subjectTemplate.replace("{CLASA}", assign.class.name),
        }),
      })

      console.log("Response status:", res.status)
      const text = await res.text()
      console.log("Response text:", text)

      if (!res.ok) {
        setSendStatusMessage(`❌ Eroare server HTTP ${res.status}: ${text}`)
        return
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (err) {
        setSendStatusMessage(`❌ Răspuns invalid de la server: ${text}`)
        return
      }

      if (data.success) {
        await onUpdateStatus(assign.id, "trimis", true)
        setSendStatusMessage(
          data.simulated
            ? `Simulare trimitere reușită către ${assign.teacher.email} (API neconfigurat)`
            : `Email trimis cu succes către ${assign.teacher.email}!`
        )
      } else {
        setSendStatusMessage(`❌ Eroare la trimitere email: ${data.error || "A apărut o problemă"}`)
      }
    } catch (e: any) {
      setSendStatusMessage(`❌ Eroare rețea: ${e.message}`)
    } finally {
      setSendingId(null)
    }
  }

  const handleBatchSendAll = async () => {
    setBatchSending(true)
    setSendStatusMessage(null)

    let count = 0
    for (const assign of assignments) {
      if (assign.teacher.email && assign.status !== "completat") {
        try {
          const link = getFullLink(assign.token)
          const res = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toEmail: assign.teacher.email,
              teacherName: assign.teacher.full_name,
              className: assign.class.name,
              pin: assign.pin,
              tokenLink: link,
              customSubject: subjectTemplate.replace("{CLASA}", assign.class.name),
            }),
          })
          
          console.log(`[Batch] Response status for ${assign.teacher.email}:`, res.status)
          const text = await res.text()
          console.log(`[Batch] Response text for ${assign.teacher.email}:`, text)

          if (res.ok) {
            try {
              const data = JSON.parse(text)
              if (data.success) {
                await onUpdateStatus(assign.id, "trimis", true)
                count++
              } else {
                 console.error(`Eroare logica la ${assign.teacher.email}:`, data.error)
              }
            } catch (err) {
              console.error(`Răspuns invalid la ${assign.teacher.email}:`, text)
            }
          } else {
            console.error(`Eroare HTTP la ${assign.teacher.email}: ${res.status} ${text}`)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }

    setBatchSending(false)
    setSendStatusMessage(`✅ S-au expediat ${count} invitații prin email!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-teal-600" />
            Centru Trimitere Invitații & Transmitere Email
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Generare PIN acces, copiere link-uri directe și expediere invitații prin Resend / Email
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTemplateEditor(!showTemplateEditor)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            {showTemplateEditor ? "Ascunde Șablon" : "Editează Șablon Subiect"}
          </button>
          <button
            onClick={handleBatchSendAll}
            disabled={batchSending}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {batchSending ? "Se trimit..." : "Trimite Batch Toate Invitațiile"}
          </button>
        </div>
      </div>

      {/* Status Message Banner */}
      {sendStatusMessage && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            {sendStatusMessage}
          </span>
          <button onClick={() => setSendStatusMessage(null)} className="text-xs text-teal-700 underline cursor-pointer">
            Închide
          </button>
        </div>
      )}

      {/* Template Editor Collapsible */}
      {showTemplateEditor && (
        <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-3">
          <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Personalizare Subiect Email
          </h3>
          <div>
            <label className="block text-xs font-semibold text-purple-800 mb-1">Subiect Mesaj</label>
            <input
              type="text"
              value={subjectTemplate}
              onChange={(e) => setSubjectTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="text-xs text-purple-700">
            Variabile disponibile: <code className="bg-white px-1 py-0.5 rounded font-mono">{`{CLASA}`}</code>,{" "}
            <code className="bg-white px-1 py-0.5 rounded font-mono">{`{NUME_DIRIGINTE}`}</code>,{" "}
            <code className="bg-white px-1 py-0.5 rounded font-mono">{`{PIN}`}</code>
          </div>
        </div>
      )}

      {/* Table of Assignments & Direct Links */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Lista Diriginți & Credențiale Acces</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            Total {assignments.length} profesori
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-4">Clasă</th>
                <th className="p-4">Diriginte</th>
                <th className="p-4">Email</th>
                <th className="p-4">Cod PIN (6 cifre)</th>
                <th className="p-4">Link Direct Access</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Acțiune Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((assign) => {
                const isCopiedPin = copiedId === `pin-${assign.id}`
                const isCopiedLink = copiedId === `link-${assign.id}`
                const isSending = sendingId === assign.id

                return (
                  <tr key={assign.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{assign.class.name}</td>
                    <td className="p-4 font-medium text-slate-800">{assign.teacher.full_name}</td>
                    <td className="p-4 text-slate-600 text-xs">
                      {assign.teacher.email || <span className="text-amber-600 italic">Lipsă email</span>}
                    </td>

                    {/* PIN Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 tracking-wider">
                          {assign.pin}
                        </span>
                        <button
                          onClick={() => handleCopyPin(assign.pin, assign.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600 transition-colors cursor-pointer"
                          title="Copiază cod PIN"
                        >
                          {isCopiedPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Magic Link Column */}
                    <td className="p-4">
                      <button
                        onClick={() => handleCopyLink(assign.token, assign.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200 transition-colors cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        {isCopiedLink ? "Copiat în Clipboard!" : "Copiază Link Direct"}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      {assign.status === "completat" ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          Completat
                        </span>
                      ) : assign.status === "trimis" ? (
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                          Invitație Trimisă
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                          În așteptare
                        </span>
                      )}
                    </td>

                    {/* Send Single Email */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSendSingleEmail(assign)}
                        disabled={isSending || !assign.teacher.email}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 shadow-sm cursor-pointer ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        {isSending ? "Se trimite..." : "Trimite Email"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
