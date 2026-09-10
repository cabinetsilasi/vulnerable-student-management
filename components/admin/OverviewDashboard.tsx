"use client"

import { useState } from "react"
import { AssignmentWithRelations, FormCategory, StudentWithVulns } from "@/lib/types"
import { Users, FileCheck, AlertTriangle, Search, Filter, ShieldCheck, Download } from "lucide-react"

interface OverviewDashboardProps {
  assignments: AssignmentWithRelations[]
  categories: FormCategory[]
  submissions: Record<string, StudentWithVulns[]>
  onExportExcel: () => void
  schoolName?: string
}

export function OverviewDashboard({ assignments, categories, submissions, onExportExcel, schoolName }: OverviewDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Calculations
  const totalClasses = assignments.length
  const completedClasses = assignments.filter((a) => a.status === "completat").length
  const pendingClasses = assignments.filter((a) => a.status !== "completat").length
  const completionPercentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0

  const allVulnerableStudents: Array<{
    student: StudentWithVulns
    assignment: AssignmentWithRelations
  }> = []

  let totalVulnerabilitiesCount = 0

  assignments.forEach((assign) => {
    const list = submissions[assign.id] || []
    list.forEach((st) => {
      if (st.full_name.trim()) {
        allVulnerableStudents.push({ student: st, assignment: assign })
        const checkedCount = st.vulnerabilities.filter((v) => v.checked).length
        totalVulnerabilitiesCount += checkedCount
      }
    })
  })

  // Category counts breakdown
  const visibleCategories = categories.filter((c) => c.visible).sort((a, b) => a.position - b.position)

  const categoryStats = visibleCategories.map((cat) => {
    let count = 0
    allVulnerableStudents.forEach(({ student }) => {
      const v = student.vulnerabilities.find((vuln) => vuln.category_id === cat.id)
      if (v && v.checked) count++
    })
    return { category: cat, count }
  })

  // Filtered student list
  const filteredStudents = allVulnerableStudents.filter(({ student, assignment }) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClass = selectedClass === "all" || assignment.class.id === selectedClass

    const matchesCategory =
      selectedCategory === "all" ||
      student.vulnerabilities.some((v) => v.category_id === selectedCategory && v.checked)

    return matchesSearch && matchesClass && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-200" />
            Panou Centralizator Rapoarte & Statistici CJRAE
          </h2>
          <p className="text-teal-100/90 text-sm mt-1">
            Monitorizarea elevilor din categorii vulnerabile pentru {schoolName || 'toate unitățile școlare'}
          </p>
        </div>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Excel Centralizator (.xlsx)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Progres Completare Fișe</div>
            <div className="text-2xl font-bold text-slate-800">
              {completedClasses} / {totalClasses} <span className="text-sm font-normal text-slate-500">clase</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Elevi Vulnerabili Identificați</div>
            <div className="text-2xl font-bold text-slate-800">{allVulnerableStudents.length}</div>
            <div className="text-xs text-slate-400 mt-1">înregistrări transmise de diriginți</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Indicatori Vulnerabilitate Markați</div>
            <div className="text-2xl font-bold text-slate-800">{totalVulnerabilitiesCount}</div>
            <div className="text-xs text-slate-400 mt-1">bife cumulative per categorii</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Fișe În Așteptare</div>
            <div className="text-2xl font-bold text-slate-800">{pendingClasses}</div>
            <div className="text-xs text-slate-400 mt-1">necesită completare diriginți</div>
          </div>
        </div>
      </div>

      {/* Visual Charts / Breakdown by Category */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Distribuție Cazuistică pe Categorii de Vulnerabilitate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.map(({ category, count }) => {
            const maxCount = Math.max(...categoryStats.map((s) => s.count), 1)
            const percent = Math.round((count / maxCount) * 100)
            return (
              <div key={category.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[80%]">{category.label}</span>
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold">{count} elevi</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Central Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registru Centralizator Elevi Identificați</h3>
            <p className="text-xs text-slate-500">Căutare și filtrare rapidă după clasă, categorie sau nume elev</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Caută elev sau diriginte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Filter by Class */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">Toate Clasele</option>
              {assignments.map((a) => (
                <option key={a.class.id} value={a.class.id}>
                  {a.class.name}
                </option>
              ))}
            </select>

            {/* Filter by Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">Toate Categoriile</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Nume & Prenume Elev</th>
                <th className="p-4">Clasă</th>
                <th className="p-4">Diriginte</th>
                <th className="p-4">Categorii Vulnerabilitate Identificate</th>
                <th className="p-4">Observații / Detalii Situative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nu s-au găsit elevi vulnerabili înregistrați conform filtrelor selectate.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(({ student, assignment }, idx) => {
                  const activeVulns = student.vulnerabilities.filter((v) => v.checked)
                  return (
                    <tr key={student.id + idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-medium text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-900">{student.full_name}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs">
                          {assignment.class.name}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{assignment.teacher.full_name}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {activeVulns.length === 0 ? (
                            <span className="text-slate-400 italic text-xs">Fără marcaje bifate</span>
                          ) : (
                            activeVulns.map((v) => {
                              const cat = categories.find((c) => c.id === v.category_id)
                              return (
                                <span
                                  key={v.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-lg border border-teal-200/60"
                                  title={v.notes || undefined}
                                >
                                  {cat?.label || "Categorie"}
                                  {v.notes && <span className="text-teal-600 font-bold">({v.notes})</span>}
                                </span>
                              )
                            })
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        {student.general_notes ? (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200/60 rounded-lg block max-w-xs truncate" title={student.general_notes}>
                            {student.general_notes}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
