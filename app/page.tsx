"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSchools, verifySchoolPassword, updateSchoolPassword } from "@/lib/store"
import { SchoolRow } from "@/lib/types"
import { ShieldCheck, UserCheck, Key, Lock, ArrowRight, BookOpen, GraduationCap, ChevronRight, Building2, KeyRound, CheckCircle, ArrowLeft } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null)
  const [loadingSchools, setLoadingSchools] = useState(true)

  const [activeTab, setActiveTab] = useState<"teacher" | "admin">("teacher")

  // Teacher PIN input
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState<string | null>(null)

  // Admin Passcode input
  const [passcode, setPasscode] = useState("")
  const [adminError, setAdminError] = useState<string | null>(null)

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)

  useEffect(() => {
    getSchools().then((s) => {
      setSchools(s)
      setLoadingSchools(false)
    })
  }, [])

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinInput.trim() || pinInput.length !== 6) {
      setPinError("Introduceți un cod PIN din 6 cifre.")
      return
    }
    setPinError(null)
    router.push(`/completare?pin=${pinInput.trim()}`)
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return

    const isValid = await verifySchoolPassword(selectedSchool.id, passcode.trim())
    if (isValid) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_auth", "true")
        sessionStorage.setItem("admin_school_id", selectedSchool.id)
      }
      router.push("/admin")
    } else {
      setAdminError("Cod de acces incorect. Încercați din nou.")
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return
    setPasswordChangeError(null)
    setPasswordChangeSuccess(false)

    // Verify current password
    const isValid = await verifySchoolPassword(selectedSchool.id, currentPassword.trim())
    if (!isValid) {
      setPasswordChangeError("Parola curentă este incorectă.")
      return
    }

    if (newPassword.length < 4) {
      setPasswordChangeError("Parola nouă trebuie să aibă cel puțin 4 caractere.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Parolele noi nu coincid.")
      return
    }

    await updateSchoolPassword(selectedSchool.id, newPassword.trim())
    setPasswordChangeSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    // Update local school data
    setSelectedSchool({ ...selectedSchool, admin_password: newPassword.trim() })
    setSchools(schools.map(s => s.id === selectedSchool.id ? { ...s, admin_password: newPassword.trim() } : s))

    setTimeout(() => {
      setShowPasswordChange(false)
      setPasswordChangeSuccess(false)
    }, 2000)
  }

  const handleBackToSchoolSelect = () => {
    setSelectedSchool(null)
    setPasscode("")
    setPinInput("")
    setAdminError(null)
    setPinError(null)
    setShowPasswordChange(false)
    setPasswordChangeError(null)
    setPasswordChangeSuccess(false)
  }

  // School Selection Screen
  if (!selectedSchool) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-teal-500 selection:text-white">
        {/* Dynamic Ambient Background Elements */}
        <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[650px] h-[650px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>

        {/* Top Header */}
        <header className="max-w-6xl mx-auto w-full flex justify-between items-center py-4 border-b border-teal-800/40 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center font-black shadow-inner">
              <GraduationCap className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Cabinet de Asistență Psihopedagogică</h1>
              <p className="text-xs text-teal-200/80">CJRAE Bistrița-Năsăud — Sistem Management Elevi Vulnerabili</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 bg-teal-900/40 border border-teal-700/50 text-teal-300 rounded-full shadow-sm backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>An Școlar 2026-2027</span>
          </div>
        </header>

        {/* Hero Body */}
        <div className="max-w-4xl mx-auto w-full my-auto py-12 relative z-10">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>Sistem Oficial de Identificare a Elevilor Vulnerabili</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              Selectați Unitatea Școlară
            </h2>

            <p className="text-teal-100/80 text-sm sm:text-base font-normal">
              Alegeți școala pentru care doriți să accesați sistemul de management al elevilor din categorii vulnerabile.
            </p>
          </div>

          {/* School Cards */}
          <div className="max-w-2xl mx-auto space-y-4">
            {loadingSchools ? (
              <div className="text-center text-teal-300 animate-pulse text-sm font-semibold py-8">
                Se încarcă unitățile școlare...
              </div>
            ) : (
              schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => setSelectedSchool(school)}
                  className="w-full bg-slate-900/90 backdrop-blur-xl border border-teal-700/50 rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:border-teal-500/60 hover:bg-slate-800/90 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-200 transition-colors">
                          {school.name}
                        </h3>
                        <p className="text-xs text-teal-200/70 mt-0.5">
                          Consilier: <strong className="text-teal-100">{school.consilier}</strong> — {school.cjrae}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto w-full text-center text-xs text-teal-300/70 py-4 border-t border-teal-800/40 relative z-10">
          <p>
            Cabinet de Asistență Psihopedagogică — CJRAE Bistrița-Năsăud
          </p>
        </footer>
      </main>
    )
  }

  // Login Screen (after school selected)
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[650px] h-[650px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center py-4 border-b border-teal-800/40 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center font-black shadow-inner">
            <GraduationCap className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">{selectedSchool.name}</h1>
            <p className="text-xs text-teal-200/80">Cabinet Școlar de Asistență Psihopedagogică — {selectedSchool.cjrae}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToSchoolSelect}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-teal-900/40 border border-teal-700/50 text-teal-300 rounded-full shadow-sm backdrop-blur-md hover:bg-teal-800/60 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Altă Școală</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 bg-teal-900/40 border border-teal-700/50 text-teal-300 rounded-full shadow-sm backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>An Școlar {selectedSchool.an_scolar}</span>
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <div className="max-w-4xl mx-auto w-full my-auto py-12 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Sistem Oficial de Identificare a Elevilor Vulnerabili</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Cabinetul de Consiliere Psihopedagogică
          </h2>

          <p className="text-teal-100/80 text-sm sm:text-base font-normal">
            Colectarea și gestionarea securizată a datelor privind elevii din categorii vulnerabile,
            conform modelului oficial <strong className="text-white font-bold">CJRAE Bistrița-Năsăud</strong>.
          </p>
        </div>

        {/* Access Box */}
        <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border border-teal-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-950/60 space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-2xl border border-teal-900/60">
            <button
              onClick={() => { setActiveTab("teacher"); setShowPasswordChange(false) }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "teacher"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/40"
                  : "text-teal-200/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Portal Diriginte
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "admin"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/40"
                  : "text-teal-200/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <Lock className="w-4 h-4" />
              Acces Consilier (Admin)
            </button>
          </div>

          {/* Teacher PIN Login */}
          {activeTab === "teacher" ? (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-bold text-white">Completare Formular Clasă</h3>
                <p className="text-xs text-teal-200/80 mt-1">
                  Introduceți codul PIN din 6 cifre primit prin email sau de la consilierul școlar.
                </p>
              </div>

              <div>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Cod PIN din 6 cifre..."
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/90 border border-teal-800/80 rounded-2xl text-center text-lg font-mono tracking-widest text-teal-300 placeholder:text-teal-700/60 font-bold focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
                  />
                </div>
                {pinError && <p className="text-rose-400 text-xs mt-1.5 text-center font-semibold">{pinError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deschide Formularul Dirigintelui</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : showPasswordChange ? (
            /* Password Change Form */
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-bold text-white">Schimbare Parolă Admin</h3>
                <p className="text-xs text-teal-200/80 mt-1">
                  Schimbați parola de acces pentru <strong className="text-teal-100">{selectedSchool.short_name || selectedSchool.name}</strong>
                </p>
              </div>

              {passwordChangeSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-emerald-300 text-sm font-bold">Parola a fost schimbată cu succes!</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-teal-200/80 mb-1">Parola curentă</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400/70" />
                      <input
                        type="password"
                        placeholder="Parola curentă..."
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-teal-800/80 rounded-xl text-sm text-white placeholder:text-teal-700/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-200/80 mb-1">Parola nouă</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400/70" />
                      <input
                        type="password"
                        placeholder="Parola nouă (min. 4 caractere)..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-teal-800/80 rounded-xl text-sm text-white placeholder:text-teal-700/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-200/80 mb-1">Confirmă parola nouă</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400/70" />
                      <input
                        type="password"
                        placeholder="Repetați parola nouă..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-teal-800/80 rounded-xl text-sm text-white placeholder:text-teal-700/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
                        required
                      />
                    </div>
                  </div>

                  {passwordChangeError && <p className="text-rose-400 text-xs text-center font-semibold">{passwordChangeError}</p>}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowPasswordChange(false); setPasswordChangeError(null) }}
                      className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-teal-200 font-semibold text-sm rounded-xl transition-all cursor-pointer border border-teal-800/50"
                    >
                      Anulează
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
                    >
                      Salvează Parola
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Admin Counselor Login */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-bold text-white">Autentificare Consilier Şcolar</h3>
                <p className="text-xs text-teal-200/80 mt-1">
                  Introduceți codul de acces pentru administrare și rapoarte.
                </p>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400" />
                  <input
                    type="password"
                    placeholder="Cod de acces..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/90 border border-teal-800/80 rounded-2xl text-center text-sm font-bold text-white placeholder:text-teal-700/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
                  />
                </div>
                {adminError && <p className="text-rose-400 text-xs mt-1.5 text-center font-semibold">{adminError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Intră în Panoul Consilierului</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Password Change Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(true)}
                  className="text-xs text-teal-300/70 hover:text-teal-200 transition-colors cursor-pointer underline underline-offset-2 inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3 h-3" />
                  Schimbă parola de acces
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-teal-300/70 py-4 border-t border-teal-800/40 relative z-10">
        <p>
          Profesor Consilier Școlar: <strong className="text-white">{selectedSchool.consilier}</strong> — {selectedSchool.name}
        </p>
      </footer>
    </main>
  )
}
