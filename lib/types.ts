export type AssignmentStatus = "asteptare" | "trimis" | "completat"

export interface ClassRow {
  id: string
  name: string
  grade_level: string | null
  total_students: number
  created_at: string
}

export interface TeacherRow {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  created_at: string
}

export interface AssignmentRow {
  id: string
  class_id: string
  teacher_id: string
  pin: string
  token: string
  status: AssignmentStatus
  invited_at: string | null
  submitted_at: string | null
  created_at: string
}

export interface FormCategory {
  id: string
  key: string
  label: string
  type: "text" | "checkbox_notes"
  position: number
  visible: boolean
  is_custom: boolean
  created_at: string
}

export interface StudentRow {
  id: string
  assignment_id: string
  position: number
  full_name: string
  general_notes?: string
  created_at: string
}

export interface StudentVulnerability {
  id: string
  student_id: string
  category_id: string
  checked: boolean
  notes: string
}

// Composed views used across admin + teacher UIs
export interface AssignmentWithRelations extends AssignmentRow {
  class: ClassRow
  teacher: TeacherRow
}

export interface StudentWithVulns extends StudentRow {
  vulnerabilities: StudentVulnerability[]
}

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  asteptare: "În așteptare",
  trimis: "Invitație trimisă",
  completat: "Completat",
}
