"use client"

import { useState } from "react"
import { FormCategory } from "@/lib/types"
import { Settings2, Plus, Eye, EyeOff, ArrowUp, ArrowDown, Trash2, CheckCircle } from "lucide-react"

interface FormBuilderProps {
  categories: FormCategory[]
  onSaveCategory: (category: Partial<FormCategory> & { label: string }) => Promise<void>
  onToggleVisibility: (id: string) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
}

export function FormBuilder({ categories, onSaveCategory, onToggleVisibility, onDeleteCategory }: FormBuilderProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLabelInput, setNewLabelInput] = useState("")

  const sortedCategories = [...categories].sort((a, b) => a.position - b.position)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabelInput.trim()) return
    await onSaveCategory({ label: newLabelInput.trim() })
    setNewLabelInput("")
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-teal-600" />
            Configurabil Formular (Form Builder Categorii Vulnerabilitate)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Personalizați rubricile disponibile în formularul transmis cadrelor didactice / diriginților
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adaugă Categorie Personalizată
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Categorii Active în Formular</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
            {categories.filter((c) => c.visible).length} / {categories.length} categorii vizibile
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedCategories.map((cat, index) => (
            <div
              key={cat.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                !cat.visible ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>

                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {cat.label}
                    {cat.is_custom && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">
                        Personalizat
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Tip câmp: <span className="font-mono text-slate-600">Bifă Checkbox + Câmp Note Detalii</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle Visibility */}
                <button
                  onClick={() => onToggleVisibility(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    cat.visible
                      ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                  title={cat.visible ? "Vizibil în formular" : "Ascuns din formular"}
                >
                  {cat.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {cat.visible ? "Vizibil" : "Ascuns"}
                </button>

                {/* Delete Custom Category */}
                {cat.is_custom && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                    title="Șterge categorie personalizată"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Adaugă Categorie Nouă de Vulnerabilitate</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Denumire Categorie (ex: Dificultăți de integrare lingvistică)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Introduceți titlul categoriei..."
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Anulează
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-500">
                  Salvează Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
