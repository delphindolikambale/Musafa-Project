import React, { useState, useEffect } from "react";
import sectionService from "../../services/sectionService";
import optionService from "../../services/optionService";
import { 
  Layers, Plus, Search, Edit2, Trash2, X, CheckCircle, 
  XCircle, AlertTriangle, HelpCircle, Loader2, BookOpen, ToggleLeft 
} from "lucide-react";

const SectionsOptions = () => {
  const [sections, setSections] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchSection, setSearchSection] = useState("");
  const [searchOption, setSearchOption] = useState("");

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  
  const [sectionForm, setSectionForm] = useState({ sectionName: "", active: true });
  const [optionForm, setOptionForm] = useState({ optionName: "", sectionId: "", active: true });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Système de feedback UI (Boîte de dialogue Toast)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Système de boîte de dialogue de confirmation personnalisée
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: "", message: "", onConfirm: null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [secRes, optRes] = await Promise.all([
        sectionService.getAll(),
        optionService.getAll()
      ]);
      setSections(secRes.data);
      setOptions(optRes.data);
    } catch (err) { 
      console.error("Erreur de chargement", err); 
      triggerToast("Erreur lors du chargement des structures académiques", "error");
    } finally { setLoading(false); }
  };

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4500);
  };

  const handleError = (err) => {
    const message = err.response?.data?.message || err.response?.data || "Une erreur inattendue est survenue";
    triggerToast(message, "error");
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await sectionService.update(currentId, sectionForm);
        triggerToast("La section a été modifiée avec succès.");
      } else {
        await sectionService.create(sectionForm);
        triggerToast("La section a été enregistrée avec succès.");
      }
      setShowSectionModal(false);
      loadData();
    } catch (err) { handleError(err); }
  };

  const deleteSection = async (id) => {
    setConfirmDialog({
      show: true,
      title: "Supprimer la Section",
      message: "Voulez-vous vraiment supprimer définitivement cette section ? Toutes les options associées risquent d'être impactées.",
      onConfirm: async () => {
        try { 
          await sectionService.delete(id); 
          triggerToast("Section supprimée avec succès.");
          loadData(); 
        } catch (err) { handleError(err); }
        setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });
      }
    });
  };

  const handleOptionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await optionService.update(currentId, optionForm);
        triggerToast("La filière optionnelle a été mise à jour.");
      } else {
        await optionService.create(optionForm);
        triggerToast("La nouvelle option a été configurée avec succès.");
      }
      setShowOptionModal(false);
      loadData();
    } catch (err) { handleError(err); }
  };

  const deleteOption = async (id) => {
    setConfirmDialog({
      show: true,
      title: "Supprimer la Filière",
      message: "Confirmez-vous la suppression de cette option ? Cette opération est irréversible.",
      onConfirm: async () => {
        try { 
          await optionService.delete(id); 
          triggerToast("L'option a été retirée du catalogue.");
          loadData(); 
        } catch (err) { handleError(err); }
        setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });
      }
    });
  };

  const filteredSections = sections.filter(s => s.sectionName.toLowerCase().includes(searchSection.toLowerCase()));
  const filteredOptions = options.filter(o => 
    o.optionName.toLowerCase().includes(searchOption.toLowerCase()) ||
    o.section?.sectionName.toLowerCase().includes(searchOption.toLowerCase())
  );

  // --- COMPOSANT REUTILISABLE MODERNE : TOGGLE SWITCH ---
  const ToggleActive = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-blue-100 dark:hover:border-blue-900/40 transition-all">
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative outline-none focus:ring-2 focus:ring-blue-500/20 ${value ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans relative">
      
      {/* 1. NOTIFICATION ALERT / TOAST CONTEXTUEL */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full animate-in slide-in-from-top-5 duration-300 px-4 sm:px-0">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 border backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-300"
              : toast.type === "error"
              ? "bg-rose-50/90 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-300"
              : "bg-amber-50/90 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-300"
          }`}>
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "success" && <CheckCircle size={18} />}
              {toast.type === "error" && <XCircle size={18} />}
              {toast.type === "warning" && <AlertTriangle size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-black leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 2. BOITE DE DIALOGUE INTERACTIVE DE CONFIRMATION */}
      {confirmDialog.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[90] p-4 backdrop-blur-md bg-slate-950/40 dark:bg-black/60 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-all">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">{confirmDialog.title}</h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDialog({ show: false, title: "", message: "", onConfirm: null })}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-600/10"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 text-[#1d61ff] dark:text-blue-400 rounded-xl dark:bg-blue-500/20">
              <Layers size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Structure Académique</h1>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold pl-11">Configuration des filières d'enseignement</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : SECTIONS */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-black text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest">Sections</h2>
                <button 
                  onClick={() => { setEditMode(false); setSectionForm({sectionName: "", active: true}); setShowSectionModal(true); }} 
                  className="bg-[#0a1d43] hover:bg-[#1d61ff] dark:bg-blue-600 dark:hover:bg-blue-700 text-white w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/10"
                > 
                  <Plus size={16} /> 
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Rechercher section..." 
                  className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold border-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all outline-none" 
                  value={searchSection} 
                  onChange={(e) => setSearchSection(e.target.value)} 
                />
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {filteredSections.map(sec => (
                <div key={sec.id} className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-transparent hover:border-blue-200 dark:hover:border-blue-900/40 transition-all group shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{sec.sectionName}</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${sec.active ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}`}> 
                      {sec.active ? "● Actif" : "○ Inactif"} 
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                     <button onClick={() => { setEditMode(true); setCurrentId(sec.id); setSectionForm(sec); setShowSectionModal(true); }} className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl text-blue-500 dark:text-blue-400 transition-colors">
                       <Edit2 size={14} />
                     </button>
                     <button onClick={() => deleteSection(sec.id)} className="p-2 hover:bg-red-50 dark:hover:bg-slate-800/60 rounded-xl text-red-500 dark:text-red-400 transition-colors">
                       <Trash2 size={14} />
                     </button>
                  </div>
                </div>
              ))}
              {filteredSections.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4 font-medium">Aucune section trouvée.</p>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : OPTIONS */}
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-900 p-6 rounded-[2rem] shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <h2 className="font-black text-white uppercase text-xs tracking-widest flex-shrink-0">Options & Filières</h2>
                <div className="relative w-full max-w-xs">
                  <input 
                    type="text" 
                    placeholder="Filtrer les options..." 
                    className="w-full bg-white/10 backdrop-blur-md rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/60 border-none outline-none focus:ring-2 focus:ring-white/40 transition-all font-semibold" 
                    value={searchOption} 
                    onChange={(e) => setSearchOption(e.target.value)} 
                  />
                  <Search size={12} className="absolute left-3 top-3 text-white/60" />
                </div>
              </div>
              <button 
                onClick={() => { setEditMode(false); setOptionForm({optionName: "", sectionId: "", active: true}); setShowOptionModal(true); }} 
                className="bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5"
              > 
                <Plus size={14} /> Nouvelle Option 
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOptions.map(opt => (
                <div key={opt.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800/60 flex justify-between items-center group hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1"> 
                      <BookOpen size={10} /> {opt.section?.sectionName || "Sans Section"} 
                    </span>
                    <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight">{opt.optionName}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${opt.active ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                      <span className={`text-[8px] font-black uppercase tracking-widest ${opt.active ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {opt.active ? 'Opérationnelle' : 'Désactivée'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                    <button onClick={() => { setEditMode(true); setCurrentId(opt.id); setOptionForm({optionName: opt.optionName, sectionId: opt.section?.id, active: opt.active}); setShowOptionModal(true); }} className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl text-blue-600 dark:text-blue-400 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteOption(opt.id)} className="p-2 hover:bg-red-50 dark:hover:bg-slate-800/60 rounded-xl text-red-500 dark:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredOptions.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/60">
                <p className="text-xs text-slate-400 font-medium">Aucune filière ou option disponible.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIGURATION : OPTION / FILIÈRE */}
      {showOptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[80] p-4 backdrop-blur-md bg-slate-950/40 dark:bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl relative transform scale-100 transition-all">
              <button onClick={() => setShowOptionModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
              
              <h2 className="text-lg font-black mb-6 text-slate-900 dark:text-white tracking-tight">
                {editMode ? "Modifier l'Option" : "Détails de la Filière"}
              </h2>

              <form onSubmit={handleOptionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-wider">Section Parente</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl p-3 font-bold text-xs outline-none border-2 border-transparent focus:border-blue-500 transition-all" value={optionForm.sectionId} onChange={(e) => setOptionForm({...optionForm, sectionId: e.target.value})} required>
                    <option value="" className="text-slate-400">Sélectionner une section...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-wider">Nom de la Filière</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl p-3 font-bold text-xs outline-none border-2 border-transparent focus:border-blue-500 transition-all" value={optionForm.optionName} onChange={(e) => setOptionForm({...optionForm, optionName: e.target.value})} placeholder="Ex: Pédagogie Générale" required />
                </div>
                
                <ToggleActive 
                  label="État opérationnel" 
                  value={optionForm.active} 
                  onChange={(val) => setOptionForm({...optionForm, active: val})} 
                />

                <div className="pt-4 flex flex-col gap-2">
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-900 text-white py-3.5 rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-500/10 active:scale-95 transition-all tracking-wider">
                    Enregistrer les données
                  </button>
                  <button type="button" onClick={() => setShowOptionModal(false)} className="w-full text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider text-[10px] py-2 hover:text-slate-600">
                    Fermer la fenêtre
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
      
      {/* MODAL CONFIGURATION : SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[80] p-4 backdrop-blur-md bg-slate-950/40 dark:bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl relative">
             <button onClick={() => setShowSectionModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <X size={18} />
             </button>

             <h2 className="text-lg font-black mb-6 text-slate-900 dark:text-white tracking-tight">
               {editMode ? "Modifier la Section" : "Nouvelle Section Académique"}
             </h2>

             <form onSubmit={handleSectionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-wider">Libellé de la Section</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl p-3.5 font-bold text-xs outline-none border-2 border-transparent focus:border-blue-500 transition-all" value={sectionForm.sectionName} onChange={(e) => setSectionForm({...sectionForm, sectionName: e.target.value})} placeholder="Nom (ex: Technique, Humanités Littéraires)" required />
                </div>
                
                <ToggleActive 
                  label="État de la Structure" 
                  value={sectionForm.active} 
                  onChange={(val) => setSectionForm({...sectionForm, active: val})} 
                />

                <div className="pt-2 flex flex-col gap-2">
                  <button type="submit" className="w-full bg-[#0a1d43] dark:bg-blue-600 hover:opacity-95 text-white py-3.5 rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all tracking-wider">
                    Confirmer la configuration
                  </button>
                  <button type="button" onClick={() => setShowSectionModal(false)} className="w-full text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider text-[10px] py-2 hover:text-slate-600">
                    Annuler l'action
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsOptions;