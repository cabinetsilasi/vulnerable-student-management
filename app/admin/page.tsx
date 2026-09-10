"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getStoreData,
  getAllCategories,
  getAssignmentsWithRelations,
  addClass,
  updateClass,
  addTeacher,
  updateTeacher,
  assignTeacherToClass,
  saveCategory,
  toggleCategoryVisibility,
  deleteCategory,
  updateAssignmentStatus,
  deleteClass,
  deleteTeacher,
  importBulkData,
  saveAssignmentSubmission,
  resetToDefaultSeed,
  getStudentsForAssignment,
  addStudentsToAssignment,
  getSchoolById,
  schoolToInfo,
  SCHOOL_INFO,
} from "@/lib/store"
import { AssignmentWithRelations, ClassRow, FormCategory, TeacherRow, StudentWithVulns, SchoolRow } from "@/lib/types"
import { OverviewDashboard } from "@/components/admin/OverviewDashboard"
import { ClassTeacherManager } from "@/components/admin/ClassTeacherManager"
import { FormBuilder } from "@/components/admin/FormBuilder"
import { EmailDispatchCenter } from "@/components/admin/EmailDispatchCenter"
import { exportToExcel } from "@/lib/export/excel"
import { generateDocxForAssignment } from "@/lib/export/docx"
import {
  BarChart3,
  School,
  Settings2,
  Mail,
  FileSpreadsheet,
  FileText,
  LogOut,
  RefreshCw,
  Download,
  GraduationCap,
  Sparkles,
} from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "form" | "email" | "export">("overview")
  const [loading, setLoading] = useState(true)

  const [currentSchool, setCurrentSchool] = useState<SchoolRow | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([])
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [categories, setCategories] = useState<FormCategory[]>([])
  const [submissions, setSubmissions] = useState<Record<string, StudentWithVulns[]>>({})

  // Load store data (scoped to school)
  const refreshData = async (sid?: string) => {
    const effectiveSchoolId = sid || schoolId
    setLoading(true)
    const store = await getStoreData(effectiveSchoolId || undefined)
    const assigns = await getAssignmentsWithRelations(effectiveSchoolId || undefined)
    const cats = await getAllCategories()

    if (effectiveSchoolId) {
      const school = await getSchoolById(effectiveSchoolId)
      setCurrentSchool(school)
    }

    setClasses(store.classes)
    setTeachers(store.teachers)
    setAssignments(assigns)
    setCategories(cats)
    setSubmissions(store.submissions)
    setLoading(false)
  }

  useEffect(() => {
    // Auth check + school context
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin_auth")
      if (!auth) {
        // router.push("/")
      }
      const sid = sessionStorage.getItem("admin_school_id")
      if (sid) {
        setSchoolId(sid)
        refreshData(sid)
      } else {
        refreshData()
      }
    } else {
      refreshData()
    }
  }, [])

  const schoolInfo = currentSchool ? schoolToInfo(currentSchool) : SCHOOL_INFO

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth")
      sessionStorage.removeItem("admin_school_id")
    }
    router.push("/")
  }

  const handleExportExcel = () => {
    exportToExcel(assignments, categories, submissions, currentSchool || undefined)
  }

  const handleExportDocxSingle = async (assign: AssignmentWithRelations) => {
    const students = submissions[assign.id] || []
    const blob = await generateDocxForAssignment(assign, categories, students, currentSchool || undefined)

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Fisa_Vulnerabilitati_${assign.class.name.replace(/[^a-zA-Z0-9]/g, "_")}_2026-2027.docx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportDocxAll = async () => {
    for (const assign of assignments) {
      await handleExportDocxSingle(assign)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold animate-pulse text-teal-300 bg-slate-900/80 px-6 py-4 rounded-2xl border border-teal-800/50 shadow-xl">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
          <span>Se încarcă datele consilierului școlar...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 print:bg-white print:p-0 print:m-0 print:min-h-0">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-800 text-white sticky top-0 z-40 shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center font-bold shadow-inner">
              <GraduationCap className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">{schoolInfo.unitate}</h1>
                <span className="px-2.5 py-0.5 bg-teal-400/20 text-teal-200 text-[10px] font-extrabold rounded-full border border-teal-300/30">
                  CJRAE BN
                </span>
              </div>
              <p className="text-xs text-teal-100/90">
                Cabinet Școlar Psihopedagogic | Consilier: <strong className="text-white font-bold">{schoolInfo.consilier}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (confirm("Resetăm datele la configurația implicită de test?")) {
                  await resetToDefaultSeed()
                  await refreshData()
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/60 hover:bg-teal-900 text-teal-100 text-xs font-semibold rounded-xl border border-teal-600/50 transition-colors cursor-pointer"
              title="Resetează datele la cele de bază"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-300" />
              Reset Date Test
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-semibold rounded-xl border border-rose-700/80 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Deconectare
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto border-t border-teal-700/40">
          <nav className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-teal-900 shadow-md font-black"
                  : "text-teal-100 hover:text-white hover:bg-white/15 font-semibold"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistici & Centralizator
            </button>

            <button
              onClick={() => setActiveTab("classes")}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "classes"
                  ? "bg-white text-teal-900 shadow-md font-black"
                  : "text-teal-100 hover:text-white hover:bg-white/15 font-semibold"
              }`}
            >
              <School className="w-4 h-4" />
              Gestionare Clase & Diriginți
            </button>

            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "form"
                  ? "bg-white text-teal-900 shadow-md font-black"
                  : "text-teal-100 hover:text-white hover:bg-white/15 font-semibold"
              }`}
            >
              <Settings2 className="w-4 h-4" />
              Form Builder Categorii
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "email"
                  ? "bg-white text-teal-900 shadow-md font-black"
                  : "text-teal-100 hover:text-white hover:bg-white/15 font-semibold"
              }`}
            >
              <Mail className="w-4 h-4" />
              Trimitere Invitații & PIN-uri
            </button>

            <button
              onClick={() => setActiveTab("export")}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "export"
                  ? "bg-white text-teal-900 shadow-md font-black"
                  : "text-teal-100 hover:text-white hover:bg-white/15 font-semibold"
              }`}
            >
              <FileText className="w-4 h-4" />
              Export Rapoarte (.docx / .xlsx)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 print:p-0 print:m-0 print:max-w-none">
        {activeTab === "overview" && (
          <OverviewDashboard
            assignments={assignments}
            categories={categories}
            submissions={submissions}
            onExportExcel={handleExportExcel}
            schoolName={schoolInfo.unitate}
          />
        )}

        {activeTab === "classes" && (
          <ClassTeacherManager
            assignments={assignments}
            classes={classes}
            teachers={teachers}
            categories={categories}
            submissions={submissions}
            onSaveSubmission={async (assignmentId, updatedStudents, isFinal) => {
              await saveAssignmentSubmission(assignmentId, updatedStudents, isFinal)
              await refreshData()
            }}
            onAddClass={async (name, grade, total, teacherId) => {
              const newCls = await addClass(name, grade, total, schoolId || undefined)
              if (teacherId && newCls?.id) {
                await assignTeacherToClass(newCls.id, teacherId)
              }
              await refreshData()
            }}
            onEditClass={async (id, name, grade, total, teacherId, pastedStudents) => {
              await updateClass(id, name, grade, total)
              let assign = null
              if (teacherId) {
                assign = await assignTeacherToClass(id, teacherId)
              } else {
                const store = await getStoreData(schoolId || undefined)
                assign = store.assignments.find(a => a.class_id === id) || null
              }
              if (assign && pastedStudents && pastedStudents.length > 0) {
                await addStudentsToAssignment(assign.id, pastedStudents)
              }
              await refreshData()
            }}
            onAddTeacher={async (name, email, phone, classId) => {
              const newTch = await addTeacher(name, email, phone, schoolId || undefined)
              if (classId && newTch?.id) {
                await assignTeacherToClass(classId, newTch.id)
              }
              await refreshData()
            }}
            onEditTeacher={async (id, name, email, phone) => {
              await updateTeacher(id, name, email, phone)
              await refreshData()
            }}
            onAssign={async (classId, teacherId) => {
              await assignTeacherToClass(classId, teacherId)
              await refreshData()
            }}
            onRefreshData={refreshData}
            onBulkImport={async (rows) => {
              await importBulkData(rows, schoolId || undefined)
              await refreshData()
            }}
            onDeleteClass={async (id) => {
              await deleteClass(id)
              await refreshData()
            }}
            onDeleteTeacher={async (id) => {
              await deleteTeacher(id)
              await refreshData()
            }}
          />
        )}

        {activeTab === "form" && (
          <FormBuilder
            categories={categories}
            onSaveCategory={async (cat) => {
              await saveCategory(cat)
              await refreshData()
            }}
            onToggleVisibility={async (id) => {
              await toggleCategoryVisibility(id)
              await refreshData()
            }}
            onDeleteCategory={async (id) => {
              await deleteCategory(id)
              await refreshData()
            }}
          />
        )}

        {activeTab === "email" && (
          <EmailDispatchCenter
            assignments={assignments}
            onUpdateStatus={async (id, status, invited) => {
              await updateAssignmentStatus(id, status, invited)
              await refreshData()
            }}
            schoolInfo={schoolInfo}
          />
        )}

        {activeTab === "export" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-teal-600" />
                  Centru Export Rapoarte Oficiale CJRAE BN
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Generați documentele oficiale Word (<code>.docx</code>) conform machetei stabilite de CJRAE BN sau fișiere Excel (<code>.xlsx</code>).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel Centralizator (.xlsx)
                </button>
                <button
                  onClick={handleExportDocxAll}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Descarcă Toate Fișele Word (.docx)
                </button>
              </div>
            </div>

            {/* List of Classes for Individual Docx Download */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Generare Fișă de Identificare Word Per Clasă</h3>
                <p className="text-xs text-slate-500">Documentele respectă antetul, formatul de tabel și footer-ul oficial CJRAE BN</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-4">Clasă</th>
                      <th className="p-4">Diriginte</th>
                      <th className="p-4">Elevi Înregistrați</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Descarcă Word (.docx)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((assign) => {
                      const studentCount = (submissions[assign.id] || []).length
                      return (
                        <tr key={assign.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{assign.class.name}</td>
                          <td className="p-4 font-medium text-slate-800">{assign.teacher.full_name}</td>
                          <td className="p-4 text-slate-600 font-semibold">{studentCount} elevi în fișă</td>
                          <td className="p-4 text-center">
                            {assign.status === "completat" ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                Completat
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                                În așteptare
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleExportDocxSingle(assign)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer ml-auto"
                            >
                              <Download className="w-3.5 h-3.5 text-teal-200" />
                              Descarcă .docx
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
        )}
      </main>
    </div>
  )
}
