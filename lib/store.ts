import {
  ClassRow,
  TeacherRow,
  AssignmentRow,
  FormCategory,
  AssignmentWithRelations,
  StudentWithVulns,
  AssignmentStatus,
  StudentVulnerability,
  SchoolRow,
} from "./types"
import { getServiceClient } from "./supabase/admin"

// Legacy compatibility — used by components that haven't migrated yet
export interface SchoolInfo {
  unitate: string
  cabinet: string
  consilier: string
  cjrae: string
  anScolar: string
}

// Helper: converts SchoolRow to legacy SchoolInfo format
export function schoolToInfo(school: SchoolRow): SchoolInfo {
  return {
    unitate: school.name,
    cabinet: school.cabinet,
    consilier: school.consilier,
    cjrae: school.cjrae,
    anScolar: school.an_scolar,
  }
}

// Default fallback (used only when no school is selected)
export const SCHOOL_INFO: SchoolInfo = {
  unitate: 'Școala Gimnazială „Grigore Silași" Beclean',
  cabinet: 'Școala Gimnazială „Grigore Silași" Beclean',
  consilier: 'prof. ORBAN IOAN ȘTEFAN',
  cjrae: 'CJRAE BN (Bistrița-Năsăud)',
  anScolar: '2026-2027',
}

// ========== SEED DATA ==========

const INITIAL_SCHOOLS: SchoolRow[] = [
  {
    id: "school-silasi",
    name: 'Școala Gimnazială „Grigore Silași" Beclean',
    short_name: "Silași Beclean",
    cabinet: 'Școala Gimnazială „Grigore Silași" Beclean',
    consilier: "prof. ORBAN IOAN ȘTEFAN",
    cjrae: "CJRAE BN (Bistrița-Năsăud)",
    an_scolar: "2026-2027",
    admin_password: "admin123",
    created_at: new Date().toISOString(),
  },
  {
    id: "school-branistea",
    name: "Școala Gimnazială Braniștea",
    short_name: "Braniștea",
    cabinet: "Școala Gimnazială Braniștea",
    consilier: "prof. ORBAN IOAN ȘTEFAN",
    cjrae: "CJRAE BN (Bistrița-Năsăud)",
    an_scolar: "2026-2027",
    admin_password: "admin123",
    created_at: new Date().toISOString(),
  },
]

const INITIAL_CATEGORIES: FormCategory[] = [
  {
    id: "cat-1",
    key: "rezultate_slabe",
    label: "Rezultate școlare slabe (corigențe / repetenție)",
    type: "checkbox_notes",
    position: 1,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-2",
    key: "comportament",
    label: "Probleme de comportament (bullying, disciplină)",
    type: "checkbox_notes",
    position: 2,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-3",
    key: "absenteism",
    label: "Absenteism școlar",
    type: "checkbox_notes",
    position: 3,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-4",
    key: "substante",
    label: "Consum de substanțe",
    type: "checkbox_notes",
    position: 4,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-5",
    key: "ces",
    label: "CES (cu certificat CJRAE)",
    type: "checkbox_notes",
    position: 5,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-6",
    key: "familiala",
    label: "Situație familială (divorț, deces, plecați străinătate, plasament)",
    type: "checkbox_notes",
    position: 6,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-7",
    key: "remigrati",
    label: "Copii remigrați",
    type: "checkbox_notes",
    position: 7,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-8",
    key: "alte_situatii",
    label: "Alte situații (handicap, diagnostic medical etc.)",
    type: "checkbox_notes",
    position: 8,
    visible: true,
    is_custom: false,
    created_at: new Date().toISOString(),
  },
]

const INITIAL_CLASSES: ClassRow[] = [
  { id: "c-5a", school_id: "school-silasi", name: "Clasa a V-a A", grade_level: "V", total_students: 24, created_at: new Date().toISOString() },
  { id: "c-5b", school_id: "school-silasi", name: "Clasa a V-a B", grade_level: "V", total_students: 22, created_at: new Date().toISOString() },
  { id: "c-6a", school_id: "school-silasi", name: "Clasa a VI-a A", grade_level: "VI", total_students: 26, created_at: new Date().toISOString() },
  { id: "c-6b", school_id: "school-silasi", name: "Clasa a VI-a B", grade_level: "VI", total_students: 25, created_at: new Date().toISOString() },
  { id: "c-7a", school_id: "school-silasi", name: "Clasa a VII-a A", grade_level: "VII", total_students: 23, created_at: new Date().toISOString() },
  { id: "c-8a", school_id: "school-silasi", name: "Clasa a VIII-a A", grade_level: "VIII", total_students: 28, created_at: new Date().toISOString() },
]

const INITIAL_TEACHERS: TeacherRow[] = [
  { id: "t-1", school_id: "school-silasi", full_name: "Pop Maria", email: "maria.pop@silasibeclean.ro", phone: "0740111222", created_at: new Date().toISOString() },
  { id: "t-2", school_id: "school-silasi", full_name: "Ionescu Dan", email: "dan.ionescu@silasibeclean.ro", phone: "0740222333", created_at: new Date().toISOString() },
  { id: "t-3", school_id: "school-silasi", full_name: "Moldovan Elena", email: "elena.moldovan@silasibeclean.ro", phone: "0740333444", created_at: new Date().toISOString() },
  { id: "t-4", school_id: "school-silasi", full_name: "Rusu Alexandru", email: "alexandru.rusu@silasibeclean.ro", phone: "0740444555", created_at: new Date().toISOString() },
  { id: "t-5", school_id: "school-silasi", full_name: "Nagy Ana", email: "ana.nagy@silasibeclean.ro", phone: "0740555666", created_at: new Date().toISOString() },
  { id: "t-6", school_id: "school-silasi", full_name: "Mureșan Cristian", email: "cristian.muresan@silasibeclean.ro", phone: "0740666777", created_at: new Date().toISOString() },
]

const INITIAL_ASSIGNMENTS: AssignmentRow[] = [
  {
    id: "a-1",
    class_id: "c-5a",
    teacher_id: "t-1",
    pin: "549210",
    token: "token-clasa-5a-maria",
    status: "completat",
    invited_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "a-2",
    class_id: "c-5b",
    teacher_id: "t-2",
    pin: "812034",
    token: "token-clasa-5b-dan",
    status: "trimis",
    invited_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    submitted_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "a-3",
    class_id: "c-6a",
    teacher_id: "t-3",
    pin: "394182",
    token: "token-clasa-6a-elena",
    status: "completat",
    invited_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "a-4",
    class_id: "c-6b",
    teacher_id: "t-4",
    pin: "671049",
    token: "token-clasa-6b-alex",
    status: "asteptare",
    invited_at: null,
    submitted_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "a-5",
    class_id: "c-7a",
    teacher_id: "t-5",
    pin: "128475",
    token: "token-clasa-7a-ana",
    status: "trimis",
    invited_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    submitted_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "a-6",
    class_id: "c-8a",
    teacher_id: "t-6",
    pin: "905314",
    token: "token-clasa-8a-cristian",
    status: "asteptare",
    invited_at: null,
    submitted_at: null,
    created_at: new Date().toISOString(),
  },
]

const INITIAL_SUBMISSIONS: Record<string, StudentWithVulns[]> = {
  "a-1": [
    {
      id: "s-1",
      assignment_id: "a-1",
      position: 1,
      full_name: "Apetrei Andrei",
      created_at: new Date().toISOString(),
      vulnerabilities: [
        { id: "v-1", student_id: "s-1", category_id: "cat-1", checked: true, notes: "Corigent la Matematică sem. 1" },
        { id: "v-2", student_id: "s-1", category_id: "cat-3", checked: true, notes: "peste 40 absente nemotivate" },
      ],
    },
    {
      id: "s-2",
      assignment_id: "a-1",
      position: 2,
      full_name: "Bălan Sofia",
      created_at: new Date().toISOString(),
      vulnerabilities: [
        { id: "v-3", student_id: "s-2", category_id: "cat-6", checked: true, notes: "Părinți plecați în Spania, în grija bunicilor" },
      ],
    },
    {
      id: "s-3",
      assignment_id: "a-1",
      position: 3,
      full_name: "Covaci Radu",
      created_at: new Date().toISOString(),
      vulnerabilities: [
        { id: "v-4", student_id: "s-3", category_id: "cat-5", checked: true, notes: "Certificat CES nr. 412/2025" },
        { id: "v-5", student_id: "s-3", category_id: "cat-2", checked: true, notes: "Conflicte frecvente în pauze" },
      ],
    },
  ],
  "a-3": [
    {
      id: "s-4",
      assignment_id: "a-3",
      position: 1,
      full_name: "Dumbravă Matei",
      created_at: new Date().toISOString(),
      vulnerabilities: [
        { id: "v-6", student_id: "s-4", category_id: "cat-7", checked: true, notes: "Revenit din Italia în 2025" },
        { id: "v-7", student_id: "s-4", category_id: "cat-1", checked: true, notes: "Dificultăți de adaptare limba română" },
      ],
    },
    {
      id: "s-5",
      assignment_id: "a-3",
      position: 2,
      full_name: "Florea Daria",
      created_at: new Date().toISOString(),
      vulnerabilities: [
        { id: "v-8", student_id: "s-5", category_id: "cat-8", checked: true, notes: "Diabet juvenil tip 1" },
      ],
    },
  ],
}

const STORAGE_KEY = "vulnerable_student_app_data_v2"

interface AppStoreState {
  schools: SchoolRow[]
  classes: ClassRow[]
  teachers: TeacherRow[]
  assignments: AssignmentRow[]
  categories: FormCategory[]
  submissions: Record<string, StudentWithVulns[]>
}

function loadStore(): AppStoreState {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure schools array exists (migration from v1)
        if (!parsed.schools) {
          parsed.schools = INITIAL_SCHOOLS
        }
        return parsed
      }
    } catch (e) {
      console.error("Failed loading local storage state", e)
    }
  }
  return {
    schools: INITIAL_SCHOOLS,
    classes: INITIAL_CLASSES,
    teachers: INITIAL_TEACHERS,
    assignments: INITIAL_ASSIGNMENTS,
    categories: INITIAL_CATEGORIES,
    submissions: INITIAL_SUBMISSIONS,
  }
}

let memoryState: AppStoreState = loadStore()

function saveStoreState(state: AppStoreState) {
  memoryState = state
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error("Failed saving local storage state", e)
    }
  }
}

export function generate4DigitPIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export function generate6DigitPIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "token-" + Math.random().toString(36).substring(2, 10) + "-" + Date.now().toString(36)
}

// ========== SCHOOLS API ==========

export async function getSchools(): Promise<SchoolRow[]> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data } = await supabase.from("schools").select("*").order("name")
      if (data && data.length > 0) return data as SchoolRow[]
    } catch (e) {
      console.warn("Supabase schools fetch error:", e)
    }
  }
  return memoryState.schools
}

export async function getSchoolById(id: string): Promise<SchoolRow | null> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data } = await supabase.from("schools").select("*").eq("id", id).single()
      if (data) return data as SchoolRow
    } catch (e) {
      console.warn(e)
    }
  }
  return memoryState.schools.find((s) => s.id === id) || null
}

export async function addSchool(school: Omit<SchoolRow, "id" | "created_at">): Promise<SchoolRow> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.from("schools").insert(school).select().single()
      if (error) throw new Error(error.message)
      if (data) return data as SchoolRow
    } catch (e: any) {
      console.error("Supabase Error (addSchool):", e)
      throw e
    }
  }
  const newSchool: SchoolRow = {
    ...school,
    id: "school-" + Date.now(),
    created_at: new Date().toISOString(),
  }
  saveStoreState({ ...memoryState, schools: [...memoryState.schools, newSchool] })
  return newSchool
}

export async function updateSchool(id: string, updates: Partial<SchoolRow>): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      await supabase.from("schools").update(updates).eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updated = memoryState.schools.map((s) => (s.id === id ? { ...s, ...updates } : s))
  saveStoreState({ ...memoryState, schools: updated })
}

export async function verifySchoolPassword(schoolId: string, password: string): Promise<boolean> {
  const school = await getSchoolById(schoolId)
  if (!school) return false
  return school.admin_password === password
}

export async function updateSchoolPassword(schoolId: string, newPassword: string): Promise<void> {
  await updateSchool(schoolId, { admin_password: newPassword })
}

// ========== STORE DATA API (School-scoped) ==========

export async function getStoreData(schoolId?: string): Promise<AppStoreState & { schools: SchoolRow[] }> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data: schoolsData } = await supabase.from("schools").select("*").order("name")

      let classesQuery = supabase.from("classes").select("*").order("name")
      let teachersQuery = supabase.from("teachers").select("*").order("full_name")

      if (schoolId) {
        classesQuery = classesQuery.eq("school_id", schoolId)
        teachersQuery = teachersQuery.eq("school_id", schoolId)
      }

      const { data: classesData, error: clsErr } = await classesQuery
      const { data: teachersData, error: tchErr } = await teachersQuery
      const { data: assignmentsData, error: asgErr } = await supabase.from("assignments").select("*")
      const { data: categoriesData, error: catErr } = await supabase.from("form_categories").select("*").order("position")

      if (clsErr) console.error("Error fetching classes from Supabase:", clsErr)
      if (tchErr) console.error("Error fetching teachers from Supabase:", tchErr)
      if (asgErr) console.error("Error fetching assignments from Supabase:", asgErr)
      if (catErr) console.error("Error fetching categories from Supabase:", catErr)

      const finalSchools = (schoolsData && schoolsData.length > 0) ? (schoolsData as SchoolRow[]) : memoryState.schools
      const finalClasses = (classesData && classesData.length > 0) ? (classesData as ClassRow[]) : filterBySchool(memoryState.classes, schoolId)
      const finalTeachers = (teachersData && teachersData.length > 0) ? (teachersData as TeacherRow[]) : filterBySchool(memoryState.teachers, schoolId)
      const finalCategories = (categoriesData && categoriesData.length > 0) ? (categoriesData as FormCategory[]) : memoryState.categories

      // Filter assignments to only include those belonging to classes of the selected school
      const classIds = new Set(finalClasses.map((c) => c.id))
      const allAssignments = assignmentsData ? (assignmentsData as AssignmentRow[]) : memoryState.assignments
      const finalAssignments = schoolId ? allAssignments.filter((a) => classIds.has(a.class_id)) : allAssignments

      // Filter submissions to only include those for filtered assignments
      const assignmentIds = new Set(finalAssignments.map((a) => a.id))
      const finalSubmissions: Record<string, StudentWithVulns[]> = {}
      for (const [key, value] of Object.entries(memoryState.submissions)) {
        if (!schoolId || assignmentIds.has(key)) {
          finalSubmissions[key] = value
        }
      }

      return {
        schools: finalSchools,
        classes: finalClasses,
        teachers: finalTeachers,
        assignments: finalAssignments,
        categories: finalCategories,
        submissions: finalSubmissions,
      }
    } catch (e) {
      console.warn("Supabase fetch error, fallback to memory state:", e)
    }
  }

  // Fallback to memory state with school filtering
  const classes = filterBySchool(memoryState.classes, schoolId)
  const teachers = filterBySchool(memoryState.teachers, schoolId)
  const classIds = new Set(classes.map((c) => c.id))
  const assignments = schoolId ? memoryState.assignments.filter((a) => classIds.has(a.class_id)) : memoryState.assignments
  const assignmentIds = new Set(assignments.map((a) => a.id))
  const submissions: Record<string, StudentWithVulns[]> = {}
  for (const [key, value] of Object.entries(memoryState.submissions)) {
    if (!schoolId || assignmentIds.has(key)) {
      submissions[key] = value
    }
  }

  return {
    schools: memoryState.schools,
    classes,
    teachers,
    assignments,
    categories: memoryState.categories,
    submissions,
  }
}

function filterBySchool<T extends { school_id: string }>(items: T[], schoolId?: string): T[] {
  if (!schoolId) return items
  return items.filter((item) => item.school_id === schoolId)
}

export async function getFormCategories(): Promise<FormCategory[]> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data } = await supabase.from("form_categories").select("*").eq("visible", true).order("position")
      if (data && data.length > 0) return data as FormCategory[]
    } catch (e) {
      console.warn(e)
    }
  }
  return memoryState.categories.filter((c) => c.visible).sort((a, b) => a.position - b.position)
}

export async function getAllCategories(): Promise<FormCategory[]> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data } = await supabase.from("form_categories").select("*").order("position")
      if (data && data.length > 0) return data as FormCategory[]
    } catch (e) {
      console.warn(e)
    }
  }
  return [...memoryState.categories].sort((a, b) => a.position - b.position)
}

export async function saveCategory(category: Partial<FormCategory> & { label: string }): Promise<FormCategory> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      if (category.id) {
        const { data } = await supabase.from("form_categories").update({ label: category.label }).eq("id", category.id).select().single()
        if (data) return data as FormCategory
      } else {
        const key = "custom_" + Date.now()
        const { data } = await supabase
          .from("form_categories")
          .insert({
            key,
            label: category.label,
            type: "checkbox_notes",
            position: memoryState.categories.length + 1,
            visible: true,
            is_custom: true,
          })
          .select()
          .single()
        if (data) return data as FormCategory
      }
    } catch (e) {
      console.warn(e)
    }
  }

  const current = memoryState.categories
  if (category.id) {
    const updated = current.map((c) => (c.id === category.id ? { ...c, ...category } : c))
    saveStoreState({ ...memoryState, categories: updated })
    return updated.find((c) => c.id === category.id)!
  } else {
    const newCat: FormCategory = {
      id: "cat-custom-" + Date.now(),
      key: "custom_" + Date.now(),
      label: category.label,
      type: "checkbox_notes",
      position: current.length + 1,
      visible: true,
      is_custom: true,
      created_at: new Date().toISOString(),
    }
    saveStoreState({ ...memoryState, categories: [...current, newCat] })
    return newCat
  }
}

export async function toggleCategoryVisibility(id: string): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const current = memoryState.categories.find((c) => c.id === id)
      if (current) {
        await supabase.from("form_categories").update({ visible: !current.visible }).eq("id", id)
      }
    } catch (e) {
      console.warn(e)
    }
  }
  const updated = memoryState.categories.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
  saveStoreState({ ...memoryState, categories: updated })
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      await supabase.from("form_categories").delete().eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updated = memoryState.categories.filter((c) => c.id !== id)
  saveStoreState({ ...memoryState, categories: updated })
}

export async function getAssignmentsWithRelations(schoolId?: string): Promise<AssignmentWithRelations[]> {
  const data = await getStoreData(schoolId)
  const { assignments, classes, teachers } = data
  return assignments.map((a) => {
    const cls = classes.find((c) => c.id === a.class_id) || {
      id: a.class_id,
      school_id: schoolId || "",
      name: "Clasă necunoscută",
      grade_level: null,
      total_students: 0,
      created_at: new Date().toISOString(),
    }
    const tch = teachers.find((t) => t.id === a.teacher_id) || {
      id: a.teacher_id,
      school_id: schoolId || "",
      full_name: "Diriginte nealocat",
      email: null,
      phone: null,
      created_at: new Date().toISOString(),
    }
    return {
      ...a,
      class: cls,
      teacher: tch,
    }
  })
}

export async function addClass(name: string, grade_level: string, total_students: number, schoolId?: string): Promise<ClassRow> {
  const supabase = getServiceClient()
  const effectiveSchoolId = schoolId || "school-silasi"
  if (supabase) {
    try {
      const { data, error } = await supabase.from("classes").insert({ name, grade_level, total_students, school_id: effectiveSchoolId }).select().single()
      if (error) throw new Error(error.message || "Eroare la crearea clasei")
      if (data) return data as ClassRow
    } catch (e: any) {
      console.error("Supabase Error (addClass):", e)
      throw e
    }
  }
  const newClass: ClassRow = {
    id: "c-" + Date.now(),
    school_id: effectiveSchoolId,
    name,
    grade_level,
    total_students,
    created_at: new Date().toISOString(),
  }
  saveStoreState({ ...memoryState, classes: [...memoryState.classes, newClass] })
  return newClass
}

export async function updateClass(id: string, name: string, grade_level: string, total_students: number): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      await supabase.from("classes").update({ name, grade_level, total_students }).eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updated = memoryState.classes.map((c) => (c.id === id ? { ...c, name, grade_level, total_students } : c))
  saveStoreState({ ...memoryState, classes: updated })
}

export async function deleteClass(id: string): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      await supabase.from("classes").delete().eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updatedClasses = memoryState.classes.filter((c) => c.id !== id)
  const updatedAssignments = memoryState.assignments.filter((a) => a.class_id !== id)
  saveStoreState({ ...memoryState, classes: updatedClasses, assignments: updatedAssignments })
}

export async function addTeacher(full_name: string, email: string, phone: string, schoolId?: string): Promise<TeacherRow> {
  const supabase = getServiceClient()
  const effectiveSchoolId = schoolId || "school-silasi"
  if (supabase) {
    try {
      const { data, error } = await supabase.from("teachers").insert({ full_name, email: email || null, phone: phone || null, school_id: effectiveSchoolId }).select().single()
      if (error) throw new Error(error.message || "Eroare la crearea cadrului didactic")
      if (data) return data as TeacherRow
    } catch (e: any) {
      console.error("Supabase Error (addTeacher):", e)
      throw e
    }
  }
  const newTeacher: TeacherRow = {
    id: "t-" + Date.now(),
    school_id: effectiveSchoolId,
    full_name,
    email: email || null,
    phone: phone || null,
    created_at: new Date().toISOString(),
  }
  saveStoreState({ ...memoryState, teachers: [...memoryState.teachers, newTeacher] })
  return newTeacher
}

export async function updateTeacher(id: string, full_name: string, email: string, phone: string): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      await supabase.from("teachers").update({ full_name, email: email || null, phone: phone || null }).eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updated = memoryState.teachers.map((t) => (t.id === id ? { ...t, full_name, email, phone } : t))
  saveStoreState({ ...memoryState, teachers: updated })
}

export async function deleteTeacher(id: string): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      await supabase.from("teachers").delete().eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updatedTeachers = memoryState.teachers.filter((t) => t.id !== id)
  const updatedAssignments = memoryState.assignments.filter((a) => a.teacher_id !== id)
  saveStoreState({ ...memoryState, teachers: updatedTeachers, assignments: updatedAssignments })
}

export async function assignTeacherToClass(classId: string, teacherId: string): Promise<AssignmentRow> {
  const supabase = getServiceClient()
  const pin = generate6DigitPIN()
  const token = generateToken()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .upsert(
          { class_id: classId, teacher_id: teacherId, pin, token, status: "asteptare" },
          { onConflict: "class_id,teacher_id" }
        )
        .select()
        .single()

      if (error) {
        console.error("Eroare Supabase la crearea/actualizarea asocierii:", error)
        throw new Error(error.message || "Eroare la salvarea asocierii în Supabase")
      }
      if (data) return data as AssignmentRow
    } catch (e: any) {
      console.error("Eroare la salvarea asocierii:", e)
      throw e
    }
  }

  const existingIndex = memoryState.assignments.findIndex((a) => a.class_id === classId)
  if (existingIndex >= 0) {
    const updated = [...memoryState.assignments]
    updated[existingIndex] = {
      ...updated[existingIndex],
      teacher_id: teacherId,
    }
    saveStoreState({ ...memoryState, assignments: updated })
    return updated[existingIndex]
  } else {
    const newAssignment: AssignmentRow = {
      id: "a-" + Date.now(),
      class_id: classId,
      teacher_id: teacherId,
      pin: generate6DigitPIN(),
      token: generateToken(),
      status: "asteptare",
      invited_at: null,
      submitted_at: null,
      created_at: new Date().toISOString(),
    }
    saveStoreState({ ...memoryState, assignments: [...memoryState.assignments, newAssignment] })
    return newAssignment
  }
}

export async function updateAssignmentStatus(id: string, status: AssignmentStatus, invited: boolean = false): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const payload: any = { status }
      if (invited) payload.invited_at = new Date().toISOString()
      if (status === "completat") payload.submitted_at = new Date().toISOString()
      await supabase.from("assignments").update(payload).eq("id", id)
    } catch (e) {
      console.warn(e)
    }
  }
  const updated = memoryState.assignments.map((a) => {
    if (a.id === id) {
      return {
        ...a,
        status,
        invited_at: invited ? new Date().toISOString() : a.invited_at,
        submitted_at: status === "completat" ? new Date().toISOString() : a.submitted_at,
      }
    }
    return a
  })
  saveStoreState({ ...memoryState, assignments: updated })
}

export async function getAssignmentByPinOrToken(query: string): Promise<AssignmentWithRelations | null> {
  // PIN/token lookup is global (not scoped to school) — PIN is unique across all schools
  const data = await getAssignmentsWithRelations()
  const clean = query.trim().toLowerCase()
  return data.find((a) => a.pin === clean || a.token.toLowerCase() === clean) || null
}

export async function getStudentsForAssignment(assignmentId: string): Promise<StudentWithVulns[]> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      const { data: studentsData } = await supabase.from("students").select("*, vulnerabilities:student_vulnerabilities(*)").eq("assignment_id", assignmentId).order("position")
      if (studentsData) return studentsData as StudentWithVulns[]
    } catch (e) {
      console.warn(e)
    }
  }
  return memoryState.submissions[assignmentId] || []
}

export async function addStudentsToAssignment(assignmentId: string, studentNames: string[]): Promise<void> {
  const supabase = getServiceClient()
  const validNames = studentNames.map(n => n.trim()).filter(n => n.length > 0)
  if (validNames.length === 0) return

  if (supabase) {
    try {
      // Find current max position
      const { data: existing } = await supabase.from("students").select("position").eq("assignment_id", assignmentId).order("position", { ascending: false }).limit(1)
      let currentMaxPos = (existing && existing.length > 0) ? existing[0].position : 0

      for (const name of validNames) {
        currentMaxPos++
        await supabase
          .from("students")
          .insert({ assignment_id: assignmentId, position: currentMaxPos, full_name: name })
      }
    } catch (e) {
      console.warn("Supabase add students error:", e)
    }
  }

  // Update memory state
  const currentStudents = memoryState.submissions[assignmentId] || []
  let pos = currentStudents.length > 0 ? Math.max(...currentStudents.map(s => s.position)) : 0
  const newStudents: StudentWithVulns[] = validNames.map(name => {
    pos++
    return {
      id: "s-" + Math.random().toString(36).substr(2, 7),
      assignment_id: assignmentId,
      position: pos,
      full_name: name,
      created_at: new Date().toISOString(),
      vulnerabilities: []
    }
  })

  saveStoreState({
    ...memoryState,
    submissions: {
      ...memoryState.submissions,
      [assignmentId]: [...currentStudents, ...newStudents]
    }
  })
}

export async function saveAssignmentSubmission(
  assignmentId: string,
  students: StudentWithVulns[],
  isFinalSubmission: boolean = false
): Promise<void> {
  const supabase = getServiceClient()
  if (supabase) {
    try {
      // Check if assignment is already completed (backend restriction)
      const { data: existingAssignment } = await supabase
        .from("assignments")
        .select("status")
        .eq("id", assignmentId)
        .single()

      if (existingAssignment?.status === "completat") {
        console.warn(`[Backend] Save rejected: Assignment ${assignmentId} is already completed.`)
        throw new Error("Fișa este securizată și nu mai poate fi modificată.")
      }

      const payload: any = { status: isFinalSubmission ? "completat" : undefined }
      // Remove undefined keys to prevent erasing existing data if isFinalSubmission is false
      if (payload.status === undefined) delete payload.status

      if (isFinalSubmission) payload.submitted_at = new Date().toISOString()

      if (Object.keys(payload).length > 0) {
        await supabase.from("assignments").update(payload).eq("id", assignmentId)
      }

      for (const st of students) {
        if (!st.full_name.trim()) continue

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(st.id)
        const studentPayload: any = { assignment_id: assignmentId, position: st.position, full_name: st.full_name }
        if (isUUID) {
          studentPayload.id = st.id
        }

        const { data: studentRecord } = await supabase
          .from("students")
          .upsert(studentPayload, { onConflict: "id" })
          .select()
          .single()

        if (studentRecord && st.vulnerabilities) {
          for (const v of st.vulnerabilities) {
            await supabase.from("student_vulnerabilities").upsert({
              student_id: studentRecord.id,
              category_id: v.category_id,
              checked: v.checked,
              notes: v.notes || "",
            }, { onConflict: "student_id,category_id" })
          }
        }
      }
    } catch (e) {
      console.warn("Supabase save error:", e)
    }
  }

  const updatedSubmissions = {
    ...memoryState.submissions,
    [assignmentId]: students,
  }

  const updatedAssignments = memoryState.assignments.map((a) => {
    if (a.id === assignmentId) {
      return {
        ...a,
        status: isFinalSubmission ? ("completat" as AssignmentStatus) : a.status,
        submitted_at: isFinalSubmission ? new Date().toISOString() : a.submitted_at,
      }
    }
    return a
  })

  saveStoreState({
    ...memoryState,
    submissions: updatedSubmissions,
    assignments: updatedAssignments,
  })
}

export async function importBulkData(
  rows: Array<{ diriginte: string; email?: string; phone?: string; clasa: string; totalElevi?: number }>,
  schoolId?: string
): Promise<{ addedClasses: number; addedTeachers: number; assigned: number }> {
  let addedClasses = 0
  let addedTeachers = 0
  let assigned = 0

  const effectiveSchoolId = schoolId || "school-silasi"
  const state = { ...memoryState }

  for (const row of rows) {
    if (!row.clasa || !row.diriginte) continue

    let cls = state.classes.find((c) => c.name.toLowerCase() === row.clasa.trim().toLowerCase() && c.school_id === effectiveSchoolId)
    if (!cls) {
      cls = {
        id: "c-" + Math.random().toString(36).substr(2, 7),
        school_id: effectiveSchoolId,
        name: row.clasa.trim(),
        grade_level: row.clasa.trim().split(" ")[2] || "I",
        total_students: Number(row.totalElevi) || 25,
        created_at: new Date().toISOString(),
      }
      state.classes.push(cls)
      addedClasses++
    }

    let tch = state.teachers.find((t) => t.full_name.toLowerCase() === row.diriginte.trim().toLowerCase() && t.school_id === effectiveSchoolId)
    if (!tch) {
      tch = {
        id: "t-" + Math.random().toString(36).substr(2, 7),
        school_id: effectiveSchoolId,
        full_name: row.diriginte.trim(),
        email: row.email || null,
        phone: row.phone || null,
        created_at: new Date().toISOString(),
      }
      state.teachers.push(tch)
      addedTeachers++
    }

    const existingAssignIndex = state.assignments.findIndex((a) => a.class_id === cls!.id)
    if (existingAssignIndex >= 0) {
      state.assignments[existingAssignIndex].teacher_id = tch.id
    } else {
      state.assignments.push({
        id: "a-" + Math.random().toString(36).substr(2, 7),
        class_id: cls.id,
        teacher_id: tch.id,
        pin: generate6DigitPIN(),
        token: generateToken(),
        status: "asteptare",
        invited_at: null,
        submitted_at: null,
        created_at: new Date().toISOString(),
      })
    }
    assigned++
  }

  saveStoreState(state)
  return { addedClasses, addedTeachers, assigned }
}

export async function resetToDefaultSeed(): Promise<void> {
  const defaultState: AppStoreState = {
    schools: INITIAL_SCHOOLS,
    classes: INITIAL_CLASSES,
    teachers: INITIAL_TEACHERS,
    assignments: INITIAL_ASSIGNMENTS,
    categories: INITIAL_CATEGORIES,
    submissions: INITIAL_SUBMISSIONS,
  }
  saveStoreState(defaultState)
}
