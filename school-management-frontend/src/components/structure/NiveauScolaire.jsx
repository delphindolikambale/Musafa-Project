import React, { useState, useEffect } from "react";
import levelService from "../../services/levelService";
import { Loader2, Trash2, Edit, Plus, Search, X } from "lucide-react";

const NiveauScolaire = () => {
  const [levels, setLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { name: "7ème Année", type: "BASE", active: true };
  const [formData, setFormData] = useState(initialForm);

  const fetchLevels = async () => {
    try {
      const response = await levelService.getAllLevels();
      setLevels(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    }
  };

  useEffect(() => { fetchLevels(); }, []);

  const filteredLevels = levels.filter(level => 
    level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (level) => {
    setEditMode(true);
    setCurrentId(level.id);
    setFormData({ name: level.name, type: level.type, active: level.active });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le niveau "${name}" ?`)) {
      try {
        await levelService.deleteLevel(id);
        fetchLevels();
      } catch (error) {
        alert("Action impossible : Ce niveau est probablement utilisé par une classe.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. SÉCURITÉ ANTI-DOUBLON
    const isDuplicate = levels.some(l => 
      l.name.trim().toLowerCase() === formData.name.trim().toLowerCase() && 
      l.id !== currentId
    );

    if (isDuplicate) {
      alert(`Le niveau "${formData.name}" existe déjà.`);
      setIsSubmitting(false);
      return;
    }

    // 2. VALIDATION HUMANITÉS (1ère à 4ème)
    if (formData.type === "OPTIONNEL") {
      const regex = /^[1-4](ère|ème)/i; 
      if (!regex.test(formData.name)) {
        alert("Sécurité : En RDC, les Humanités vont de la 1ère à la 4ème Année.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (editMode) {
        await levelService.updateLevel(currentId, formData);
      } else {
        await levelService.createLevel(formData);
      }
      setShowModal(false);
      fetchLevels();
    } catch (error) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      name: newType === "BASE" ? "7ème Année" : ""
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0a1d43]">Niveaux Scolaires</h1>
          <p className="text-gray-400 text-sm italic font-medium">Structure Pédagogique Officielle</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
          <div className="relative flex-grow">
            <input 
              type="text"
              placeholder="Rechercher un niveau..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1d61ff] outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
          <button 
            onClick={() => { setEditMode(false); setFormData(initialForm); setShowModal(true); }} 
            className="bg-[#1d61ff] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Nouveau
          </button>
        </div>
      </div>

      {/* GRILLE DES NIVEAUX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLevels.map((level) => (
          <div key={level.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${level.type === "BASE" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                {level.type === "BASE" ? "📚 CYCLE DE BASE" : "🎓 HUMANITÉS"}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
                <button onClick={() => handleOpenEdit(level)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16} /></button>
                <button onClick={() => handleDelete(level.id, level.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-2xl font-black text-[#0a1d43] mb-4">{level.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${level.active ? "bg-emerald-500" : "bg-gray-300"}`}></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{level.active ? "Actif" : "Inactif"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE SAISIE */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md bg-[#0a1d43]/40">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors"><X /></button>
            <h2 className="text-2xl font-black mb-8 text-[#0a1d43]">{editMode ? "Modifier le Niveau" : "Nouveau Niveau"}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Type de Cycle Scolaire</label>
                <select 
                  className="w-full bg-gray-50 rounded-2xl p-4 font-bold text-[#0a1d43] outline-none border-2 border-transparent focus:border-[#1d61ff] transition-all" 
                  value={formData.type} 
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="BASE">Cycle d'Éducation de Base (7-8ème)</option>
                  <option value="OPTIONNEL">Cycle des Humanités (1-4ème)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Désignation du Niveau</label>
                {formData.type === "BASE" ? (
                  <select 
                    className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-[#1d61ff] transition-all" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  >
                    <option value="7ème Année">7ème Année</option>
                    <option value="8ème Année">8ème Année</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    placeholder="Ex: 1ère G&P, 3ème Commerciale..." 
                    className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-[#1d61ff] transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active} 
                  onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                  className="w-5 h-5 accent-[#1d61ff] rounded" 
                />
                <label htmlFor="active" className="text-xs font-bold text-gray-600 cursor-pointer">Niveau ouvert pour l'année scolaire</label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0a1d43] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#1d61ff] disabled:bg-gray-300 shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (editMode ? "Mettre à jour" : "Confirmer")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NiveauScolaire;