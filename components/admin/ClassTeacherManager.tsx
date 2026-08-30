"use client"

import { useState } from "react"
import { AssignmentWithRelations, ClassRow, TeacherRow, FormCategory, StudentWithVulns } from "@/lib/types"
import { TeacherForm } from "@/components/teacher/TeacherForm"
import { Plus, Edit2, Trash2, Upload, UserPlus, School, RefreshCw, CheckCircle2, Clock, Mail, Eye, X, Printer, Link2, AlertTriangle } from "lucide-react"
import * as XLSX from "xlsx"

interface ClassTeacherManagerProps {
  assignments: AssignmentWithRelations[]
  classes: ClassRow[]
  teachers: TeacherRow[]
  categories?: FormCategory[]
  submissions?: Record<string, StudentWithVulns[]>
  onSaveSubmission?: (assignmentId: string, students: StudentWithVulns[], isFinal: boolean) => Promise<void>
  onAddClass: (name: string, grade: string, total: number, teacherId?: string) => Promise<void>
  onEditClass?: (id: string, name: string, grade: string, total: number, teacherId?: string) => Promise<void>
  onAddTeacher: (name: string, email: string, phone: string) => Promise<void>
  onEditTeacher?: (id: string, name: string, email: string, phone: string) => Promise<void>
  onAssign: (classId: string, teacherId: string) => Promise<void>
  onBulkImport: (rows: Array<{ diriginte: string; email?: string; phone?: string; clasa: string; totalElevi?: number }>) => Promise<void>
  onDeleteClass: (id: string) => Promise<void>
  onDeleteTeacher: (id: string) => Promise<void>
}

export function ClassTeacherManager({
  assignments,
  classes,
  teachers,
  categories = [],
  submissions = {},
  onSaveSubmission,
  onAddClass,
  onEditClass,
  onAddTeacher,
  onEditTeacher,
  onAssign,
  onBulkImport,
  onDeleteClass,
  onDeleteTeacher,
}: ClassTeacherManagerProps) {
  // Modal states
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showEditClassModal, setShowEditClassModal] = useState(false)
  const [showViewSheetModal, setShowViewSheetModal] = useState(false)
  const [viewingAssignment, setViewingAssignment] = useState<AssignmentWithRelations | null>(null)

  // Edit Class states
  const [editingClassId, setEditingClassId] = useState("")
  const [editClassName, setEditClassName] = useState("")
  const [editGrade, setEditGrade] = useState("V")
  const [editTotalElevi, setEditTotalElevi] = useState(25)
  const [editTeacherId, setEditTeacherId] = useState("")

  // Form states
  const [classNameInput, setClassNameInput] = useState("")
  const [gradeInput, setGradeInput] = useState("V")
  const [totalEleviInput, setTotalEleviInput] = useState(25)
  const [addClassTeacherId, setAddClassTeacherId] = useState("")

  // Unassigned classes from full classes table
  const unassignedClasses = classes.filter(
    (c) => !assignments.some((a) => a.class_id === c.id || a.class?.id === c.id)
  )

  const [teacherNameInput, setTeacherNameInput] = useState("")
  const [teacherEmailInput, setTeacherEmailInput] = useState("")
  const [teacherPhoneInput, setTeacherPhoneInput] = useState("")

  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedTeacherId, setSelectedTeacherId] = useState("")

  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleOpenEditClass = (cls: ClassRow, currentTeacherId?: string) => {
    setEditingClassId(cls.id)
    setEditClassName(cls.name)
    setEditGrade(cls.grade_level || "V")
    setEditTotalElevi(cls.total_students || 25)
    setEditTeacherId(currentTeacherId || "")
    setShowEditClassModal(true)
  }

  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClassId || !editClassName.trim()) return
    try {
      if (onEditClass) {
        await onEditClass(editingClassId, editClassName.trim(), editGrade, Number(editTotalElevi) || 25, editTeacherId || undefined)
      }
      setShowEditClassModal(false)
    } catch (err: any) {
      alert("❌ Eroare la salvarea clasei/asocierii: " + (err?.message || "Operațiunea a eșuat."))
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classNameInput.trim()) return
    try {
      await onAddClass(classNameInput.trim(), gradeInput, Number(totalEleviInput) || 25, addClassTeacherId || undefined)
      setClassNameInput("")
      setAddClassTeacherId("")
      setShowAddClass(false)
    } catch (err: any) {
      alert("❌ Eroare la crearea clasei: " + (err?.message || "Operațiunea a eșuat."))
    }
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherNameInput.trim()) return
    try {
      await onAddTeacher(teacherNameInput.trim(), teacherEmailInput.trim(), teacherPhoneInput.trim())
      setTeacherNameInput("")
      setTeacherEmailInput("")
      setTeacherPhoneInput("")
      setShowAddTeacher(false)
    } catch (err: any) {
      alert("❌ Eroare la adăugarea cadrului didactic: " + (err?.message || "Operațiunea a eșuat."))
    }
  }

  const handleAssignPair = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !selectedTeacherId) return
    try {
      await onAssign(selectedClassId, selectedTeacherId)
      setShowAssignModal(false)
    } catch (err: any) {
      alert("❌ Eroare la crearea asocierii în baza de date: " + (err?.message || "Operațiunea a eșuat."))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus("Se procesează fișierul...")

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

      const parsedRows: Array<{ diriginte: string; email?: string; phone?: string; clasa: string; totalElevi?: number }> = []

      jsonData.forEach((row) => {
        // Find key names regardless of exact capitalization or diacritics
        const diriginte = row["Nume Diriginte"] || row["Diriginte"] || row["Nume"] || row["Profesor"] || ""
        const email = row["Email"] || row["E-mail"] || ""
        const phone = row["Telefon"] || row["Phone"] || ""
        const clasa = row["Clasa"] || row["Clasă"] || row["Nume Clasa"] || ""
        const totalElevi = row["Nr Total Elevi"] || row["Nr. Elevi"] || row["Total Elevi"] || 25

        if (diriginte && clasa) {
          parsedRows.push({ diriginte: String(diriginte), email: String(email), phone: String(phone), clasa: String(clasa), totalElevi: Number(totalElevi) })
        }
      })

      if (parsedRows.length === 0) {
        setImportStatus("⚠️ Nu s-au putut găsi coloanele specifice (Nume Diriginte, Email, Clasa, Nr Total Elevi).")
        return
      }

      await onBulkImport(parsedRows)
      setImportStatus(`✅ Import realizat cu succes! S-au procesat ${parsedRows.length} asocieri de clase.`)
      setTimeout(() => setShowImportModal(false), 2000)
    } catch (err: any) {
      console.error(err)
      setImportStatus("❌ Eroare la citirea fișierului Excel/CSV. Verificați formatul.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Background Admin UI - Hidden when printing */}
      <div className="space-y-6 no-print">
        {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <School className="w-6 h-6 text-teal-600" />
            Gestionare Clase & Diriginți Alocați
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Definiți structura claselor, cadrele didactice și generați codurile de acces pentru completare
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Excel/CSV Bulk
          </button>
          <button
            onClick={() => setShowAddTeacher(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Adaugă Diriginte
          </button>
          <button
            onClick={() => setShowAddClass(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adaugă Clasă
          </button>
          <button
            onClick={() => {
              if (unassignedClasses.length > 0) {
                setSelectedClassId(unassignedClasses[0].id)
              } else if (classes.length > 0) {
                setSelectedClassId(classes[0].id)
              }
              if (teachers.length > 0) setSelectedTeacherId(teachers[0].id)
              setShowAssignModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Link2 className="w-4 h-4" />
            + Asociază Clasă cu Diriginte
          </button>
        </div>
      </div>

      {/* Banner for unassigned classes */}
      {unassignedClasses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Atenție: {unassignedClasses.length} {unassignedClasses.length === 1 ? "clasă neasociată" : "clase neasociate"} (fără diriginte)!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Clase existente în baza de date fără diriginte alocat: <strong className="font-semibold">{unassignedClasses.map((c) => c.name).join(", ")}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedClassId(unassignedClasses[0].id)
              if (teachers.length > 0) setSelectedTeacherId(teachers[0].id)
              setShowAssignModal(true)
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            + Asociază Diriginte Acum
          </button>
        </div>
      )}

      {/* Main Table of Assignments & Classes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Gestionare Clase & Asocieri Diriginți</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            Total {classes.length} clase ({assignments.length} cu diriginte alocat)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-4">Clasă</th>
                <th className="p-4">Nr. Elevi</th>
                <th className="p-4">Diriginte Alocat</th>
                <th className="p-4">Email / Contact</th>
                <th className="p-4">Cod PIN Acces</th>
                <th className="p-4 text-center">Status Completare</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    Nu există nicio clasă înregistrată. Apăsați pe "+ Adaugă Clasă" pentru a începe.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => {
                  const assign = assignments.find((a) => a.class_id === cls.id || a.class?.id === cls.id)
                  const isRealAssignment = assign && !assign.id.startsWith("unassigned-") && assign.teacher_id
                  if (isRealAssignment) {
                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{assign.class.name}</td>
                        <td className="p-4 text-slate-600">{assign.class.total_students} elevi</td>
                        <td className="p-4 font-medium text-slate-800">{assign.teacher.full_name}</td>
                        <td className="p-4 text-slate-500 text-xs">
                          {assign.teacher.email || <span className="text-amber-600 italic">Fără email</span>}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                            {assign.pin}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {assign.status === "completat" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completat
                            </span>
                          ) : assign.status === "trimis" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-full">
                              <Mail className="w-3.5 h-3.5" /> Invitație trimisă
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
                              <Clock className="w-3.5 h-3.5" /> În așteptare
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => {
                                setViewingAssignment(assign)
                                setShowViewSheetModal(true)
                              }}
                              className="p-2 hover:bg-teal-50 rounded-lg text-slate-600 hover:text-teal-700 transition-colors"
                              title="Vizualizează fișa clasei completată de diriginte"
                            >
                              <Eye className="w-4 h-4 text-teal-600" />
                            </button>
                            <button
                              onClick={() => handleOpenEditClass(assign.class, assign.teacher.id)}
                              className="p-2 hover:bg-teal-50 rounded-lg text-slate-600 hover:text-teal-700 transition-colors"
                              title="Editează clasă, efectiv elevi (transferuri) sau diriginte"
                            >
                              <Edit2 className="w-4 h-4 text-teal-600" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClassId(assign.class.id)
                                setSelectedTeacherId(assign.teacher.id)
                                setShowAssignModal(true)
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-teal-600 transition-colors"
                              title="Reasignează diriginte"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteClass(assign.class.id)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              title="Șterge clasă"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  } else {
                    return (
                      <tr key={cls.id} className="hover:bg-amber-50/40 bg-amber-50/20 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{cls.name}</td>
                        <td className="p-4 text-slate-600">{cls.total_students} elevi</td>
                        <td className="p-4">
                          <span className="text-amber-700 font-semibold text-xs inline-flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Fără diriginte alocat
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">—</td>
                        <td className="p-4 text-slate-400 font-mono text-xs">—</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium rounded-full">
                            Neasociat
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedClassId(cls.id)
                                if (teachers.length > 0) setSelectedTeacherId(teachers[0].id)
                                setShowAssignModal(true)
                              }}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              title="Asociază diriginte la această clasă"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              Asociază Diriginte
                            </button>
                            <button
                              onClick={() => handleOpenEditClass(cls)}
                              className="p-2 hover:bg-teal-50 rounded-lg text-slate-600 hover:text-teal-700 transition-colors"
                              title="Editează clasă sau efectiv elevi"
                            >
                              <Edit2 className="w-4 h-4 text-teal-600" />
                            </button>
                            <button
                              onClick={() => onDeleteClass(cls.id)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              title="Șterge clasă"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adaugă Clasă */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Adaugă Clasă Nouă</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nume Clasă (ex: Clasa a V-a A)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Clasa a V-a A"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nivel / An</label>
                  <select
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  >
                    <option value="V">Clasa V</option>
                    <option value="VI">Clasa VI</option>
                    <option value="VII">Clasa VII</option>
                    <option value="VIII">Clasa VIII</option>
                    <option value="I-IV">Primar (I-IV)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nr. Total Elevi</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={totalEleviInput}
                    onChange={(e) => setTotalEleviInput(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Diriginte Alocat (opțional)</label>
                <select
                  value={addClassTeacherId}
                  onChange={(e) => setAddClassTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900"
                >
                  <option value="">-- Fără diriginte (se poate aloca ulterior) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} {t.email ? `(${t.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Anulează
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-500">
                  Salvează Clasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adaugă Diriginte */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Adaugă Cadru Didactic / Diriginte</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nume și Prenume Complet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: prof. Popescu Ion"
                  value={teacherNameInput}
                  onChange={(e) => setTeacherNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Adresă Email</label>
                <input
                  type="email"
                  placeholder="nume@silasibeclean.ro"
                  value={teacherEmailInput}
                  onChange={(e) => setTeacherEmailInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefon Contact (opțional)</label>
                <input
                  type="text"
                  placeholder="0740..."
                  value={teacherPhoneInput}
                  onChange={(e) => setTeacherPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Anulează
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-500">
                  Salvează Diriginte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asociază Clasă cu Diriginte */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Link2 className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">Asociază Clasă cu Diriginte</h3>
            </div>
            <p className="text-xs text-slate-500">
              Selectați o clasă și un diriginte existent din baza de date pentru a le conecta și a genera codul PIN (4 cifre) și Token-ul unic.
            </p>
            <form onSubmit={handleAssignPair} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">1. Selectează Clasa (Toate clasele din Supabase)</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900"
                  required
                >
                  <option value="">-- Selectează o clasă existentă --</option>
                  {classes.map((c) => {
                    const isAssigned = assignments.some((a) => a.class_id === c.id || a.class?.id === c.id)
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.total_students} elevi) {isAssigned ? "— [Alocată deja]" : "— ⚠️ FĂRĂ DIRIGINTE"}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">2. Selectează Dirigintele Responsabil</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900"
                  required
                >
                  <option value="">-- Selectează dirigintele din Supabase --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} {t.email ? `(${t.email})` : "(Fără email)"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Anulează
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-colors shadow-sm">
                  Salvează Asocierea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel / CSV Bulk */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Import Unificat Excel / CSV</h3>
            <p className="text-xs text-slate-500">
              Încărcați un fișier Excel (<code>.xlsx</code>, <code>.csv</code>) care conține coloanele:
              <br />
              <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-mono font-semibold">Nume Diriginte</code>,{" "}
              <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-mono font-semibold">Email</code>,{" "}
              <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-mono font-semibold">Clasa</code>,{" "}
              <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-mono font-semibold">Nr Total Elevi</code>.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50">
              <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Selectați fișierul Excel de pe calculator</p>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="mt-4 text-xs mx-auto" />
            </div>

            {importStatus && (
              <div className="p-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">{importStatus}</div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false)
                  setImportStatus(null)
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Editează Clasă & Efectiv Elevi (Transferuri / Nou Veniți) */}
      {showEditClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-teal-700 font-bold border-b border-slate-100 pb-3">
              <Edit2 className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">Editează Clasă & Efectiv Elevi</h3>
            </div>

            <form onSubmit={handleSaveEditClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nume Clasă</label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nivel / An</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900"
                  >
                    <option value="V">Clasa V</option>
                    <option value="VI">Clasa VI</option>
                    <option value="VII">Clasa VII</option>
                    <option value="VIII">Clasa VIII</option>
                    <option value="I-IV">Primar (I-IV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nr. Total Elevi (Efectiv)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={editTotalElevi}
                    onChange={(e) => setEditTotalElevi(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-bold text-teal-700 bg-teal-50/50"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200/60 text-xs text-teal-900">
                💡 <strong>Notă Transferuri / Nou Veniți:</strong> Modificați numărul total de elevi dacă s-au înregistrat intrări sau ieșiri din clasă pe parcursul anului școlar.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Diriginte Alocat Responsabil</label>
                <select
                  value={editTeacherId}
                  onChange={(e) => setEditTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-semibold text-slate-900"
                >
                  <option value="">Alege diriginte...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.email || "Fără email"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-500 shadow-sm cursor-pointer"
                >
                  Salvează Modificările
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Modal: Vizualizare Fișă Clasă pentru Consilier */}
      {showViewSheetModal && viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 overflow-auto flex flex-col justify-between animate-in fade-in duration-200 print:static print:bg-white print:p-0 print:m-0 print:border-none print:overflow-visible print:block print:top-0 print:left-0">
          <div className="max-w-7xl mx-auto w-full space-y-4 my-auto print:max-w-none print:space-y-0 print:m-0 print:p-0 print:block print:top-0 print:left-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-800 p-4 sm:p-6 rounded-3xl text-white shadow-xl no-print">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
                  <span>Vizualizare Consilier Școlar</span>
                  <span>•</span>
                  <span>{viewingAssignment.class.name}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Fișa de Identificare Elevi Vulnerabili — {viewingAssignment.class.name}
                </h2>
                <p className="text-xs text-teal-100/90 mt-1">
                  Diriginte responsabil: <strong>{viewingAssignment.teacher.full_name}</strong> | Status:{" "}
                  <span className="font-bold text-teal-200">
                    {viewingAssignment.status === "completat" ? "Completat" : viewingAssignment.status === "trimis" ? "Invitație trimisă" : "În așteptare"}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md"
                  title="Imprimă fișa pe hârtie (A4 Landscape)"
                >
                  <Printer className="w-4 h-4" />
                  Imprimă Fișa Clasă
                </button>

                <button
                  onClick={() => {
                    setShowViewSheetModal(false)
                    setViewingAssignment(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer shadow-sm"
                >
                  <X className="w-4 h-4" />
                  Închide Vizualizarea
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-2 sm:p-4 shadow-2xl border border-slate-200 max-h-[80vh] overflow-y-auto print:border-none print:rounded-none print:shadow-none print:max-h-none print:overflow-visible print:p-0">
              <TeacherForm
                assignment={viewingAssignment}
                categories={categories}
                initialStudents={submissions ? (submissions[viewingAssignment.id] || []) : []}
                onSaveDraft={async (updatedStudents) => {
                  if (onSaveSubmission) {
                    await onSaveSubmission(viewingAssignment.id, updatedStudents, false)
                  }
                }}
                onSubmitFinal={async (updatedStudents) => {
                  if (onSaveSubmission) {
                    await onSaveSubmission(viewingAssignment.id, updatedStudents, true)
                  }
                }}
                onBackToLogin={() => {
                  setShowViewSheetModal(false)
                  setViewingAssignment(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
