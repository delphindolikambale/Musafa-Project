import React, { useState, useEffect } from "react";
import sectionService from "../../services/sectionService";
import optionService from "../../services/optionService";

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
    } catch (err) { console.error("Erreur de chargement", err); }
    finally { setLoading(false); }
  };

  const handleError = (err) => {
    const message = err.response?.data?.message || err.response?.data || "Une erreur est survenue";
    alert(`⚠️ Attention: ${message}`);
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) await sectionService.update(currentId, sectionForm);
      else await sectionService.create(sectionForm);
      setShowSectionModal(false);
      loadData();
    } catch (err) { handleError(err); }
  };

  const deleteSection = async (id) => {
    if (window.confirm("Supprimer cette section ?")) {
      try { await sectionService.delete(id); loadData(); }
      catch (err) { handleError(err); }
    }
  };

  const handleOptionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) await optionService.update(currentId, optionForm);
      else await optionService.create(optionForm);
      setShowOptionModal(false);
      loadData();
    } catch (err) { handleError(err); }
  };

  const deleteOption = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette option ?")) {
      try { await optionService.delete(id); loadData(); }
      catch (err) { handleError(err); }
    }
  };

  const filteredSections = sections.filter(s => s.sectionName.toLowerCase().includes(searchSection.toLowerCase()));
  const filteredOptions = options.filter(o => 
    o.optionName.toLowerCase().includes(searchOption.toLowerCase()) ||
    o.section?.sectionName.toLowerCase().includes(searchOption.toLowerCase())
  );

  // --- COMPOSANT REUTILISABLE : TOGGLE SWITCH ---
  const ToggleActive = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#f8faff] min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a1d43]">Structure Académique</h1>
          <p className="text-gray-400 italic font-medium">Configuration des filières d'enseignement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : SECTIONS */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-[#0a1d43] uppercase text-xs tracking-widest">Sections</h2>
              <button onClick={() => { setEditMode(false); setSectionForm({sectionName: "", active: true}); setShowSectionModal(true); }} className="bg-[#0a1d43] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#1d61ff] transition-all shadow-lg shadow-blue-200"> + </button>
            </div>
            <input type="text" placeholder="Rechercher section..." className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={searchSection} onChange={(e) => setSearchSection(e.target.value)} />
          </div>

          <div className="space-y-3">
            {filteredSections.map(sec => (
              <div key={sec.id} className="bg-white p-4 rounded-[1.5rem] border border-transparent hover:border-blue-200 transition-all group shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#0a1d43]">{sec.sectionName}</p>
                  <span className={`text-[9px] font-bold uppercase ${sec.active ? "text-green-500" : "text-gray-400"}`}> {sec.active ? "● Actif" : "○ Inactif"} </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button onClick={() => { setEditMode(true); setCurrentId(sec.id); setSectionForm(sec); setShowSectionModal(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors">✏️</button>
                   <button onClick={() => deleteSection(sec.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE : OPTIONS */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-[#1d61ff] p-6 rounded-[2rem] shadow-xl shadow-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-black text-white uppercase text-xs tracking-widest">Options & Filières</h2>
              <input type="text" placeholder="Filtrer les options..." className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-xs text-white placeholder-white/70 border-none outline-none focus:ring-2 focus:ring-white/50 transition-all" value={searchOption} onChange={(e) => setSearchOption(e.target.value)} />
            </div>
            <button onClick={() => { setEditMode(false); setOptionForm({optionName: "", sectionId: "", active: true}); setShowOptionModal(true); }} className="bg-white text-[#1d61ff] px-6 py-2 rounded-xl font-black text-xs hover:bg-[#0a1d43] hover:text-white transition-all shadow-lg"> + NOUVELLE OPTION </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOptions.map(opt => (
              <div key={opt.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex justify-between items-center group hover:shadow-md transition-all">
                <div>
                  <span className="text-[9px] font-black text-[#1d61ff] bg-blue-50 px-2 py-1 rounded-md uppercase mb-2 inline-block tracking-tighter"> {opt.section?.sectionName || "Sans Section"} </span>
                  <h3 className="font-black text-[#0a1d43] text-base">{opt.optionName}</h3>
                  <span className={`text-[8px] font-bold ${opt.active ? 'text-green-500' : 'text-red-400'} uppercase`}>{opt.active ? 'Opérationnelle' : 'Désactivée'}</span>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditMode(true); setCurrentId(opt.id); setOptionForm({optionName: opt.optionName, sectionId: opt.section?.id, active: opt.active}); setShowOptionModal(true); }} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600">✏️</button>
                  <button onClick={() => deleteOption(opt.id)} className="p-2 hover:bg-red-50 rounded-xl text-red-500">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL OPTION */}
      {showOptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-[#0a1d43]/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
             <h2 className="text-xl font-black mb-6 text-[#0a1d43]">Détails de l'Option</h2>
             <form onSubmit={handleOptionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Section Parente</label>
                  <select className="w-full bg-gray-50 rounded-xl p-3 font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" value={optionForm.sectionId} onChange={(e) => setOptionForm({...optionForm, sectionId: e.target.value})} required>
                    <option value="">Sélectionner...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nom de la Filière</label>
                  <input type="text" className="w-full bg-gray-50 rounded-xl p-3 font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" value={optionForm.optionName} onChange={(e) => setOptionForm({...optionForm, optionName: e.target.value})} placeholder="Ex: Pédagogie Générale" required />
                </div>
                
                {/* AJOUT DU TOGGLE ACTIVE */}
                <ToggleActive 
                  label="État de l'Option" 
                  value={optionForm.active} 
                  onChange={(val) => setOptionForm({...optionForm, active: val})} 
                />

                <div className="pt-4 space-y-2">
                  <button type="submit" className="w-full bg-[#1d61ff] text-white py-4 rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-200 active:scale-95 transition-all">Enregistrer</button>
                  <button type="button" onClick={() => setShowOptionModal(false)} className="w-full text-gray-400 font-bold text-xs py-2">Fermer</button>
                </div>
             </form>
          </div>
        </div>
      )}
      
      {/* MODAL SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-[#0a1d43]/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
             <h2 className="text-xl font-black mb-6 text-[#0a1d43]">{editMode ? "Modifier Section" : "Nouvelle Section"}</h2>
             <form onSubmit={handleSectionSubmit} className="space-y-4">
                <input type="text" className="w-full bg-gray-50 rounded-xl p-4 font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" value={sectionForm.sectionName} onChange={(e) => setSectionForm({...sectionForm, sectionName: e.target.value})} placeholder="Nom (ex: Technique)" required />
                
                {/* AJOUT DU TOGGLE ACTIVE */}
                <ToggleActive 
                  label="État de la Section" 
                  value={sectionForm.active} 
                  onChange={(val) => setSectionForm({...sectionForm, active: val})} 
                />

                <button type="submit" className="w-full bg-[#0a1d43] text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Confirmer</button>
                <button type="button" onClick={() => setShowSectionModal(false)} className="w-full text-gray-400 font-bold text-xs">Annuler</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsOptions;