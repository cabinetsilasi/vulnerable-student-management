import * as XLSX from "xlsx"
import { AssignmentWithRelations, FormCategory, StudentWithVulns } from "../types"
import { SCHOOL_INFO } from "../store"

export function exportToExcel(
  assignments: AssignmentWithRelations[],
  categories: FormCategory[],
  allSubmissions: Record<string, StudentWithVulns[]>
) {
  const visibleCategories = categories.filter((c) => c.visible).sort((a, b) => a.position - b.position)

  // 1. Sheet 1: Centralizat toate cazurile de elevi vulnerabili
  const flatRows: Array<Record<string, any>> = []

  let globalIndex = 1
  for (const assign of assignments) {
    const students = allSubmissions[assign.id] || []
    for (const student of students) {
      if (!student.full_name) continue

      const rowData: Record<string, any> = {
        "Nr. Crt": globalIndex++,
        "Clasa": assign.class.name,
        "Diriginte": assign.teacher.full_name,
        "Nume Elev": student.full_name,
      }

      visibleCategories.forEach((cat) => {
        const v = student.vulnerabilities.find((vuln) => vuln.category_id === cat.id)
        if (v && v.checked) {
          rowData[cat.label] = "DA" + (v.notes ? ` - ${v.notes}` : "")
        } else {
          rowData[cat.label] = "NU"
        }
      })

      rowData["Observații / Detalii Situative"] = student.general_notes || ""

      flatRows.push(rowData)
    }
  }

  // 2. Sheet 2: Sumar per clasă și categorie (Statistici)
  const summaryRows: Array<Record<string, any>> = assignments.map((assign) => {
    const students = allSubmissions[assign.id] || []
    const row: Record<string, any> = {
      "Clasa": assign.class.name,
      "Diriginte": assign.teacher.full_name,
      "Total Elevi Clasă": assign.class.total_students,
      "Elevi Vulnerabili Identificați": students.length,
      "Status Fișă": assign.status === "completat" ? "Completat" : assign.status === "trimis" ? "Invitație trimisă" : "În așteptare",
    }

    visibleCategories.forEach((cat) => {
      const count = students.filter((s) => s.vulnerabilities.some((v) => v.category_id === cat.id && v.checked)).length
      row[cat.label] = count
    })

    return row
  })

  const wb = XLSX.utils.book_new()

  const wsFlat = XLSX.utils.json_to_sheet(flatRows.length > 0 ? flatRows : [{ "Info": "Niciun elev vulnerabil înregistrat încă." }])
  XLSX.utils.book_append_sheet(wb, wsFlat, "Elevi Vulnerabili Centralizat")

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, wsSummary, "Statistici per Clasă")

  const fileName = `Centralizator_CJRAE_Elevi_Vulnerabili_${SCHOOL_INFO.unitate.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`
  XLSX.writeFile(wb, fileName)
}
