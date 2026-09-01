"use client"

import { useState, useEffect, useRef } from "react"
import { AssignmentWithRelations, FormCategory, StudentWithVulns, StudentVulnerability } from "@/lib/types"
import { SCHOOL_INFO } from "@/lib/store"
import { Plus, Trash2, Save, Send, CheckCircle2, ShieldAlert, ArrowLeft, Info, HelpCircle, Maximize2, Minimize2, Check, FileText, Printer } from "lucide-react"

interface TeacherFormProps {
  assignment: AssignmentWithRelations
  categories: FormCategory[]
  initialStudents: StudentWithVulns[]
  onSaveDraft: (students: StudentWithVulns[]) => Promise<void>
  onSubmitFinal: (students: StudentWithVulns[]) => Promise<void>
  onBackToLogin?: () => void
}

export function TeacherForm({
  assignment,
  categories,
  initialStudents,
  onSaveDraft,
  onSubmitFinal,
  onBackToLogin,
}: TeacherFormProps) {
  const visibleCategories = categories.filter((c) => c.visible).sort((a, b) => a.position - b.position)

  const [students, setStudents] = useState<StudentWithVulns[]>(initialStudents)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const isCompleted = assignment.status === "completat"

  // Keyboard navigation & Horizontal Scroll handlers
  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return
      }

      if (e.key === "ArrowRight") {
        container.scrollBy({ left: 150, behavior: "smooth" })
        e.preventDefault()
      } else if (e.key === "ArrowLeft") {
        container.scrollBy({ left: -150, behavior: "smooth" })
        e.preventDefault()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey && e.deltaY !== 0) {
        e.preventDefault()
        container.scrollBy({ left: e.deltaY, behavior: "auto" })
      }
    }

    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement) {
        const targetRect = e.target.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        // Approximate width of the sticky columns (Nr + Nume = ~230px)
        const stickyWidth = 230
        
        // If element is hidden under the sticky column on the left
        if (targetRect.left < containerRect.left + stickyWidth) {
          container.scrollBy({ left: targetRect.left - (containerRect.left + stickyWidth) - 20, behavior: "smooth" })
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    container.addEventListener("wheel", handleWheel, { passive: false })
    container.addEventListener("focus", handleFocus, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      container.removeEventListener("wheel", handleWheel)
      container.removeEventListener("focus", handleFocus, true)
    }
  }, [isFullscreen])

  // Auto-save draft mechanism (debounced 1.2s)
  useEffect(() => {
    if (isCompleted) return

    setSaveStatus("saving")
    const timer = setTimeout(async () => {
      await onSaveDraft(students)
      setSaveStatus("saved")
    }, 1200)

    return () => clearTimeout(timer)
  }, [students, isCompleted])

  const handleAddStudentRow = () => {
    if (isCompleted) return
    const newStudent: StudentWithVulns = {
      id: "st-new-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      assignment_id: assignment.id,
      position: students.length + 1,
      full_name: "",
      general_notes: "",
      created_at: new Date().toISOString(),
      vulnerabilities: visibleCategories.map((cat) => ({
        id: "v-" + Math.random().toString(36).substr(2, 6),
        student_id: "",
        category_id: cat.id,
        checked: false,
        notes: "",
      })),
    }
    setStudents([...students, newStudent])
  }

  const handleRemoveStudentRow = (id: string) => {
    if (isCompleted) return
    setStudents(students.filter((s) => s.id !== id))
  }

  const handleNameChange = (id: string, newName: string) => {
    if (isCompleted) return
    setStudents(
      students.map((s) => (s.id === id ? { ...s, full_name: newName } : s))
    )
  }

  const handleGeneralNotesChange = (id: string, notes: string) => {
    if (isCompleted) return
    setStudents(
      students.map((s) => (s.id === id ? { ...s, general_notes: notes } : s))
    )
  }

  const handleToggleVuln = (studentId: string, categoryId: string) => {
    if (isCompleted) return
    setStudents(
      students.map((s) => {
        if (s.id !== studentId) return s

        const existingVulns = s.vulnerabilities || []
        const found = existingVulns.find((v) => v.category_id === categoryId)

        let updatedVulns: StudentVulnerability[]
        if (found) {
          updatedVulns = existingVulns.map((v) =>
            v.category_id === categoryId ? { ...v, checked: !v.checked } : v
          )
        } else {
          updatedVulns = [
            ...existingVulns,
            {
              id: "v-" + Math.random().toString(36).substr(2, 6),
              student_id: studentId,
              category_id: categoryId,
              checked: true,
              notes: "",
            },
          ]
        }
        return { ...s, vulnerabilities: updatedVulns }
      })
    )
  }

  const handleNotesChange = (studentId: string, categoryId: string, notes: string) => {
    if (isCompleted) return
    setStudents(
      students.map((s) => {
        if (s.id !== studentId) return s
        const updatedVulns = (s.vulnerabilities || []).map((v) =>
          v.category_id === categoryId ? { ...v, notes } : v
        )
        return { ...s, vulnerabilities: updatedVulns }
      })
    )
  }

  const handleFinalSubmit = async () => {
    // Filter out empty rows without student names
    const validStudents = students.filter((s) => s.full_name.trim().length > 0)
    await onSubmitFinal(validStudents)
    setShowConfirmModal(false)
  }

  return (
    <div className="printable-sheet max-w-7xl mx-auto px-4 py-8 space-y-6 print:p-0 print:m-0 print:max-w-none print:space-y-3">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden print:bg-none print:text-black print:p-0 print:border-b-2 print:border-slate-800 print:rounded-none print:shadow-none">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none no-print"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 print:flex-row print:justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-200 font-bold text-xs uppercase tracking-wider mb-1 print:text-slate-600 print:text-[8pt]">
              <span>{SCHOOL_INFO.unitate}</span>
              <span>•</span>
              <span>Cabinet Psihopedagogic</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-xl print:text-black print:font-black">
              Fișă de Identificare Elevi Vulnerabili
            </h1>
            <p className="text-teal-100/90 text-sm mt-1 print:text-xs print:text-slate-700">
              Model CJRAE BN — An școlar {SCHOOL_INFO.anScolar}
            </p>
          </div>

          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/30 transition-colors backdrop-blur-md cursor-pointer no-print"
            >
              <ArrowLeft className="w-4 h-4" />
              Ieșire Portal
            </button>
          )}
        </div>

        {/* Pre-filled Details Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs print:grid-cols-4 print:gap-2 print:mt-2 print:pt-2 print:border-slate-300">
          <div className="bg-white/15 p-3 rounded-2xl border border-white/20 backdrop-blur-md print:bg-slate-50 print:border-slate-300 print:p-1.5 print:rounded-lg">
            <span className="text-teal-100/90 block font-medium print:text-slate-600 print:text-[7.5pt]">Clasă / Grupă:</span>
            <span className="text-white font-bold text-base mt-0.5 block print:text-black print:text-xs print:mt-0">{assignment.class.name}</span>
          </div>
          <div className="bg-white/15 p-3 rounded-2xl border border-white/20 backdrop-blur-md print:bg-slate-50 print:border-slate-300 print:p-1.5 print:rounded-lg">
            <span className="text-teal-100/90 block font-medium print:text-slate-600 print:text-[7.5pt]">Nr. Total Elevi:</span>
            <span className="text-white font-bold text-base mt-0.5 block print:text-black print:text-xs print:mt-0">{assignment.class.total_students} elevi</span>
          </div>
          <div className="bg-white/15 p-3 rounded-2xl border border-white/20 backdrop-blur-md print:bg-slate-50 print:border-slate-300 print:p-1.5 print:rounded-lg">
            <span className="text-teal-100/90 block font-medium print:text-slate-600 print:text-[7.5pt]">Cadru Didactic / Diriginte:</span>
            <span className="text-white font-bold text-sm mt-0.5 block truncate print:text-black print:text-xs print:mt-0">{assignment.teacher.full_name}</span>
          </div>
          <div className="bg-white/15 p-3 rounded-2xl border border-white/20 backdrop-blur-md print:bg-slate-50 print:border-slate-300 print:p-1.5 print:rounded-lg">
            <span className="text-teal-100/90 block font-medium print:text-slate-600 print:text-[7.5pt]">Profesor Consilier:</span>
            <span className="text-white font-bold text-sm mt-0.5 block truncate print:text-black print:text-xs print:mt-0">{SCHOOL_INFO.consilier}</span>
          </div>
        </div>
      </div>

      {/* Completed State Banner */}
      {isCompleted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-3xl flex items-center gap-4 shadow-sm no-print">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-base">Fișa pentru {assignment.class.name} a fost finalizată și transmisă!</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Datele au fost înregistrate în registrul cabinetului de consiliere. Pentru eventuale modificări, vă rugăm să contactați consilierul școlar ({SCHOOL_INFO.consilier}).
            </p>
          </div>
        </div>
      ) : (
        /* Action & Auto-Save bar */
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
          <div className="flex items-center gap-3 text-xs">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold animate-pulse">
                <Save className="w-4 h-4" /> Se salvează ciorna...
              </span>
            ) : saveStatus === "saved" ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Ciornă salvată automat
              </span>
            ) : (
              <span className="text-slate-500">Completați elevii identificați din clasă</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200/80 shadow-sm transition-all cursor-pointer no-print"
              title="Imprimă fișa pe hârtie A4 Landscape"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Imprimă Fișa (A4)</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-50 to-indigo-50 hover:from-teal-100 hover:to-indigo-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200/80 shadow-sm transition-all cursor-pointer no-print"
              title={isFullscreen ? "Restrânge tabelul" : "Extinde tabelul pe tot ecranul"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-teal-700" />
                  <span>Restrânge Tabelul</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-teal-700" />
                  <span>Extinde Ecran Complet</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddStudentRow}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer no-print"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              Adaugă Elev în Fișă
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer no-print"
            >
              <Send className="w-4 h-4" />
              Finalizează și Trimite Fișa
            </button>
          </div>
        </div>
      )}

      {/* Main Dynamic Table Container */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 print:static print:bg-white print:p-0 print:border-none print:overflow-visible"
            : "bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:rounded-none print:shadow-none print:overflow-visible"
        }
      >
        {isFullscreen && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-800 p-4 rounded-2xl text-white mb-4 shadow-lg shrink-0 no-print">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-200 uppercase tracking-wider">
                <span>Mod Ecran Complet — {assignment.class.name}</span>
                <span>•</span>
                <span>{SCHOOL_INFO.unitate}</span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Completare extinsă pentru vizibilitate maximă pe toate coloanele
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimă Fișa (A4)
              </button>

              <button
                onClick={handleAddStudentRow}
                disabled={isCompleted}
                className="flex items-center gap-2 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-teal-300" />
                Adaugă Elev în Fișă
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isCompleted}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Trimite Fișa
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl border border-rose-500/50 shadow-sm transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                Restrânge Tabelul
              </button>
            </div>
          </div>
        )}

        <div 
          ref={tableContainerRef}
          className="overflow-x-auto flex-1 bg-white rounded-2xl border border-slate-200 print:overflow-visible print:border-none print:rounded-none"
        >
          <table className="w-full text-left text-xs border-collapse print:table-fixed print:w-full print:text-[8pt]">
            <thead>
              <tr className="bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-700 text-white shadow-sm border-b border-teal-800/40 print:bg-slate-100 print:text-black print:border-slate-400">
                <th className="p-2 w-10 text-center text-teal-100 text-xs font-semibold print:w-[3%] print:p-1 print:text-black print:font-bold">Nr.</th>
                <th className="p-2 min-w-[180px] text-white text-xs font-semibold sticky left-0 z-20 bg-teal-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] print:static print:shadow-none print:w-[18%] print:min-w-0 print:p-1 print:text-black print:font-bold">Numele și prenumele elevului</th>
                {visibleCategories.map((cat) => (
                  <th key={cat.id} className="p-2 min-w-[110px] text-center border-l border-white/20 print:p-1 print:min-w-0 print:border-slate-400 print:text-black print:font-bold">
                    <div className="font-semibold text-[10px] leading-snug text-white drop-shadow-sm print:text-[8pt] print:text-black print:drop-shadow-none">{cat.label}</div>
                  </th>
                ))}
                <th className="p-2 min-w-[160px] text-center border-l border-white/20 print:w-[16%] print:min-w-0 print:p-1 print:text-black print:font-bold">
                  <div className="font-semibold text-[10px] leading-snug text-white drop-shadow-sm print:text-[8pt] print:text-black print:drop-shadow-none">Observații / Detalii Situative</div>
                </th>
                {!isCompleted && <th className="p-2 w-10 text-center border-l border-white/20 no-print"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 print:divide-slate-400">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={visibleCategories.length + 4} className="p-8 text-center text-slate-400 print:p-4 print:text-black">
                    <p className="text-sm font-medium print:text-xs">Nu a fost adăugat niciun elev în această clasă.</p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const isEven = idx % 2 === 1
                  return (
                  <tr key={student.id} className={`group transition-colors ${isEven ? "bg-emerald-50/40" : "bg-white"} hover:bg-teal-100/50`}>
                    {/* Index */}
                    <td className="p-2 text-center font-bold text-slate-400 print:p-1 print:text-black print:text-xs">{idx + 1}</td>

                    {/* Student Name Input */}
                    <td className={`p-2 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:static print:shadow-none print:p-1 ${isEven ? "bg-[#f2fdf7]" : "bg-white"} group-hover:bg-[#dff7f2]`}>
                      {isCompleted ? (
                        <span className="font-bold text-slate-900 text-sm print:text-xs print:text-black">{student.full_name || "—"}</span>
                      ) : (
                        <input
                          type="text"
                          placeholder="ex: Popescu Andrei"
                          value={student.full_name}
                          onChange={(e) => handleNameChange(student.id, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900 print:bg-transparent print:border-none print:p-0 print:text-xs print:text-black"
                        />
                      )}
                    </td>

                    {/* Vulnerability Checkboxes & Notes */}
                    {visibleCategories.map((cat) => {
                      const vuln = (student.vulnerabilities || []).find((v) => v.category_id === cat.id)
                      const isChecked = vuln?.checked || false
                      const notes = vuln?.notes || ""

                      return (
                        <td key={cat.id} className="p-2 text-center border-l border-slate-100 bg-transparent print:p-1 print:border-slate-400">
                          <div className="flex flex-col items-center gap-1.5 print:gap-0.5">
                            {/* Colorful Custom Checkbox */}
                            <button
                              type="button"
                              disabled={isCompleted}
                              onClick={() => handleToggleVuln(student.id, cat.id)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer no-print ${
                                isChecked
                                  ? "bg-gradient-to-br from-teal-500 to-emerald-600 border-2 border-teal-500 text-white shadow-md shadow-teal-500/30 scale-105"
                                  : "bg-white border-2 border-slate-300 hover:border-teal-400 hover:bg-teal-50/50"
                              } ${isCompleted ? "opacity-80 cursor-not-allowed" : ""}`}
                              title={isChecked ? "Marcat ca prezent (bifat)" : "Bifează dacă este cazul"}
                            >
                              {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>

                            {/* Print Only Check Indicator */}
                            <span className="print-only font-black text-[9pt] text-black">
                              {isChecked ? "DA" : "—"}
                            </span>

                            {/* Notes Input / Toggle */}
                            {isChecked && (
                              <div className="w-full mt-1 print:mt-0">
                                {isCompleted ? (
                                  notes && <div className="text-[10px] text-teal-800 font-medium bg-teal-50 p-1 rounded border border-teal-200 print:bg-transparent print:border-none print:p-0 print:text-[7.5pt] print:text-black print:font-semibold">{notes}</div>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder="Note/Detalii..."
                                    value={notes}
                                    onChange={(e) => handleNotesChange(student.id, cat.id, e.target.value)}
                                    className="w-full px-2 py-1 text-[11px] bg-white border border-teal-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-center font-medium print:bg-transparent print:border-none print:p-0 print:text-[7.5pt] print:text-black print:font-semibold"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}

                    {/* General Observații / Detalii Column */}
                    <td className="p-2 border-l border-slate-100 bg-transparent print:p-1 print:border-slate-400">
                      {isCompleted ? (
                        <span className="text-xs text-slate-700 font-medium italic print:text-[8pt] print:text-black print:not-italic">{student.general_notes || "—"}</span>
                      ) : (
                        <input
                          type="text"
                          placeholder="Detalii familie..."
                          value={student.general_notes || ""}
                          onChange={(e) => handleGeneralNotesChange(student.id, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-medium text-slate-900 print:bg-transparent print:border-none print:p-0 print:text-[8pt] print:text-black"
                        />
                      )}
                    </td>

                    {/* Delete Row Button */}
                    {!isCompleted && (
                      <td className="p-2 text-center border-l border-slate-100 bg-transparent no-print">
                        <button
                          onClick={() => handleRemoveStudentRow(student.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Șterge rând elev"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures for Paper Printout */}
        <div className="print-signatures p-6 mt-6 border-t border-slate-300 text-xs text-slate-900">
          <div className="flex justify-between items-start pt-4">
            <div>
              <p className="font-bold mb-10">Cadru Didactic / Diriginte Responsabil,</p>
              <p className="border-t border-slate-400 pt-1 font-semibold">{assignment.teacher.full_name}</p>
              <p className="text-[10px] text-slate-500 mt-1">Semnătura: ______________________</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-10">Profesor Consilier Școlar,</p>
              <p className="border-t border-slate-400 pt-1 font-semibold">{SCHOOL_INFO.consilier}</p>
              <p className="text-[10px] text-slate-500 mt-1">Semnătura: ______________________</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-8">
            Document oficial generat conform machetei CJRAE Bistrița-Năsăud | {SCHOOL_INFO.unitate}
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900">Confirmare Trimitere Fișă</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sunteți sigur că doriți să finalizați și să trimiteți fișa pentru <strong>{assignment.class.name}</strong>?
                <br />
                Au fost înregistrați <strong>{students.filter((s) => s.full_name.trim()).length} elevi</strong>.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Revino la Formular
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-500 shadow-md"
              >
                Da, Finalizează și Trimite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
