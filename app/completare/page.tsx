"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  getAssignmentByPinOrToken,
  getFormCategories,
  getStudentsForAssignment,
  saveAssignmentSubmission,
  SCHOOL_INFO,
} from "@/lib/store"
import { AssignmentWithRelations, FormCategory, StudentWithVulns } from "@/lib/types"
import { TeacherForm } from "@/components/teacher/TeacherForm"
import { Key, ShieldAlert, RefreshCw, ArrowLeft, GraduationCap } from "lucide-react"

function CompletareFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pinParam = searchParams.get("pin") || ""
  const tokenParam = searchParams.get("token") || ""

  const [loading, setLoading] = useState(true)
  const [assignment, setAssignment] = useState<AssignmentWithRelations | null>(null)
  const [categories, setCategories] = useState<FormCategory[]>([])
  const [students, setStudents] = useState<StudentWithVulns[]>([])

  const [pinInput, setPinInput] = useState(pinParam)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [tokenContext, setTokenContext] = useState<AssignmentWithRelations | null>(null)

  const loadAssignmentData = async (queryStr: string) => {
    if (!queryStr.trim()) {
      setLoading(false)
      return
    }
    setLoading(true)
    setErrorMsg(null)

    const found = await getAssignmentByPinOrToken(queryStr.trim())
    if (found) {
      const cats = await getFormCategories()
      const existingStudents = await getStudentsForAssignment(found.id)
      setAssignment(found)
      setCategories(cats)
      setStudents(existingStudents)
    } else {
      setErrorMsg("Cod PIN invalid. Verificați din nou credențialele primite.")
      setAssignment(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (pinParam) {
      loadAssignmentData(pinParam)
    } else if (tokenParam) {
      getAssignmentByPinOrToken(tokenParam).then((found) => {
        if (found) setTokenContext(found)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [tokenParam, pinParam])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadAssignmentData(pinInput)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-teal-300 animate-pulse bg-slate-900/80 px-6 py-4 rounded-2xl border border-teal-800/50 shadow-xl">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
          <span>Se validează codul de acces în portal...</span>
        </div>
      </div>
    )
  }

  // If valid assignment found, render TeacherForm or Success Screen
  if (assignment) {
    if (assignment.status === "completat") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-center items-center p-4">
          <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-teal-700/50 rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-emerald-400/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Fișă Securizată</h2>
            <p className="text-teal-200/90 text-sm leading-relaxed">
              Fișa a fost transmisă cu succes către cabinetul de consiliere și este acum securizată. 
              Din motive de confidențialitate, datele nu mai pot fi vizualizate sau modificate din acest cont.
            </p>
            <p className="text-xs text-slate-400 mt-2">Vă mulțumim pentru colaborare!</p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setAssignment(null)
                  router.push("/")
                }}
                className="px-6 py-2.5 bg-teal-900/40 hover:bg-teal-800/60 text-teal-100 font-semibold rounded-xl border border-teal-700/50 transition-colors cursor-pointer"
              >
                Înapoi
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 pb-12">
        <TeacherForm
          assignment={assignment}
          categories={categories}
          initialStudents={students}
          onSaveDraft={async (updatedStudents) => {
            await saveAssignmentSubmission(assignment.id, updatedStudents, false)
          }}
          onSubmitFinal={async (updatedStudents) => {
            await saveAssignmentSubmission(assignment.id, updatedStudents, true)
            // Reload assignment status
            const reloaded = await getAssignmentByPinOrToken(assignment.pin)
            if (reloaded) setAssignment(reloaded)
          }}
          onBackToLogin={() => router.push("/")}
        />
      </div>
    )
  }

  // If no valid assignment loaded yet, render PIN entry screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[130px] pointer-events-none"></div>

      <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-4 relative z-10 border-b border-teal-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5 text-teal-300" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">{SCHOOL_INFO.unitate}</span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-900/40 hover:bg-teal-800/60 text-teal-200 text-xs font-semibold rounded-xl border border-teal-700/50 transition-colors backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Acasă
        </button>
      </header>

      <div className="max-w-md mx-auto w-full my-auto bg-slate-900/90 backdrop-blur-xl border border-teal-700/50 rounded-3xl p-8 shadow-2xl shadow-teal-950/60 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-3 border border-teal-400/30 shadow-inner">
            <Key className="w-6 h-6 text-teal-300" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Acces Formular Diriginte</h2>
          {tokenContext && (
            <div className="bg-teal-900/40 border border-teal-500/30 rounded-lg p-3 my-4">
              <p className="text-sm text-teal-100 font-semibold">{tokenContext.class.name}</p>
              <p className="text-xs text-teal-300/80">Prof. {tokenContext.teacher.full_name}</p>
            </div>
          )}
          <p className="text-xs text-teal-200/80 mt-2">
            Introduceți codul PIN din 6 cifre primit de la consilierul școlar pentru a deschide fișa clasei.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={6}
              placeholder="Introduceți PIN 6 cifre..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3.5 bg-slate-950/90 border border-teal-800/80 rounded-2xl text-center text-xl font-mono tracking-widest text-teal-300 placeholder:text-teal-700/60 font-bold focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
            />
            {errorMsg && <p className="text-rose-400 text-xs mt-2 text-center font-semibold">{errorMsg}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
          >
            Accesează Formularul
          </button>
        </form>
      </div>

      <footer className="text-center text-xs text-teal-300/70 py-4 relative z-10 border-t border-teal-800/40 max-w-4xl mx-auto w-full">
        Consilier școlar: <strong className="text-white">{SCHOOL_INFO.consilier}</strong>
      </footer>
    </div>
  )
}

export default function CompletarePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center">
          <div className="text-sm font-semibold text-teal-300 animate-pulse bg-slate-900/80 px-6 py-4 rounded-2xl border border-teal-800/50">Se încarcă...</div>
        </div>
      }
    >
      <CompletareFormContent />
    </Suspense>
  )
}
