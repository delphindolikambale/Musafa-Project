import React, { useState, useEffect } from "react";
import levelService from "../../services/levelService";
import { 
  Loader2, Trash2, Edit, Plus, Search, X, 
  BookOpen, GraduationCap, Layers, CheckCircle, XCircle, AlertTriangle 
} from "lucide-react";

const NiveauScolaire = () => {
  const [levels, setLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion de la boîte de dialogue d'état (Succès / Erreurs réelles)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const initialForm = { name: "7ème Année", type: "BASE", active: true };
  const [formData, setFormData] = useState(initialForm);

  // Fonction utilitaire pour déclencher le Toast personnalisé
  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const fetchLevels = async () => {
    try {
      const response = await levelService.getAllLevels();
      setLevels(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
      showNotification("Impossible de charger les niveaux depuis le serveur.", "error");
    }
  };

  useEffect(() => { 
    fetchLevels(); 
  }, []);

  // Tri : Base (7, 8) puis Humanités (1, 2, 3, 4)
  const sortLevels = (a, b) => {
    if (a.type === "BASE" && b.type !== "BASE") return -1;
    if (a.type !== "BASE" && b.type === "BASE") return 1;
    
    const numA = parseInt(a.name) || 0;
    const numB = parseInt(b.name) || 0;
    return numA - numB;
  };

  const filteredAndSortedLevels = levels
    .filter(level => level.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(sortLevels);

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
        showNotification(`Le niveau "${name}" a été supprimé avec succès.`, "success");
        fetchLevels();
      } catch (error) {
        // Extraction du message d'erreur réel renvoyé par l'API si disponible
        const apiErrorMessage = error.response?.data?.message || "Action impossible : Ce niveau est probablement lié à des classes existantes.";
        showNotification(apiErrorMessage, "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isDuplicate = levels.some(l => 
      l.name.trim().toLowerCase() === formData.name.trim().toLowerCase() && 
      l.id !== currentId
    );

    if (isDuplicate) {
      showNotification(`Le niveau "${formData.name}" existe déjà au sein du système.`, "warning");
      setIsSubmitting(false);
      return;
    }

    if (formData.type === "OPTIONNEL") {
      const regex = /^[1-4](ère|ème)/i; 
      if (!regex.test(formData.name)) {
        showNotification("Sécurité : En RDC, la désignation des Humanités doit commencer de la 1ère à la 4ème Année.", "warning");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (editMode) {
        await levelService.updateLevel(currentId, formData);
        showNotification(`Le niveau "${formData.name}" a été modifié avec succès.`, "success");
      } else {
        await levelService.createLevel(formData);
        showNotification(`Le niveau "${formData.name}" a été configuré avec succès.`, "success");
      }
      setShowModal(false);
      fetchLevels();
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Une erreur est survenue lors de la communication avec l'API.";
      showNotification(serverMessage, "error");
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

  const getLevelIcon = (type, name) => {
    if (type === "BASE") {
      return <BookOpen className="text-emerald-500 dark:text-emerald-400" size={24} />;
    }
    return <GraduationCap className="text-blue-500 dark:text-blue-400" size={24} />;
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans relative">
      
      {/* BOITE DE DIALOGUE CONTEXTUELLE (TOAST NOTIFICATION) */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full sm:w-auto animate-in slide-in-from-top-5 duration-300">
          <div className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-300"
              : toast.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-300"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-300"
          }`}>
            <div className="mt-0.5">
              {toast.type === "success" && <CheckCircle size={18} />}
              {toast.type === "warning" && <AlertTriangle size={18} />}
              {toast.type === "error" && <XCircle size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 text-[#1d61ff] rounded-xl dark:bg-blue-500/20">
              <Layers size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Niveaux Scolaires
            </h1>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold pl-11">
            Structure Pédagogique Officielle
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
          <div className="relative flex-grow sm:w-80">
            <input 
              type="text"
              placeholder="Rechercher un niveau..."
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#1d61ff] dark:focus:ring-blue-500 text-slate-800 dark:text-white outline-none shadow-sm transition-all text-sm font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={18} />
          </div>
          <button 
            onClick={() => { setEditMode(false); setFormData(initialForm); setShowModal(true); }} 
            className="bg-gradient-to-r from-blue-600 to-indigo-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <Plus size={18} /> Nouveau Niveau
          </button>
        </div>
      </div>

      {/* GRILLE DES NIVEAUX */}
      {filteredAndSortedLevels.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <p className="text-slate-400 dark:text-slate-500 font-medium">Aucun niveau scolaire trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedLevels.map((level) => (
            <div 
              key={level.id} 
              className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black px-3 py-1.2 rounded-full tracking-wider uppercase ${
                    level.type === "BASE" 
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                      : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  }`}>
                    {level.type === "BASE" ? "📚 Cycle de Base" : "🎓 Humanités"}
                  </span>
                  
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform md:translate-y-[-5px] group-hover:translate-y-0">
                    <button 
                      onClick={() => handleOpenEdit(level)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Modifier"
                    >
                      <Edit size={15} />
                    </button>
                    <button 
                      onClick={() => handleDelete(level.id, level.name)} 
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    {getLevelIcon(level.type, level.name)}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-[#1d61ff] dark:group-hover:text-blue-400 transition-colors">
                    {level.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div className={`w-2 h-2 rounded-full ${level.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}></div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {level.active ? "Ouvert / Actif" : "Fermé / Inactif"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CONFIGURATION */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 p-4 backdrop-blur-md bg-slate-950/40 dark:bg-black/60 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl relative transform scale-100 transition-all duration-300">
            
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {editMode ? "Modifier le Niveau" : "Créer un Niveau Scolaire"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                  Type de Cycle Scolaire
                </label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl p-3.5 font-bold outline-none border-2 border-transparent focus:border-[#1d61ff] dark:focus:border-blue-500 transition-all text-xs" 
                  value={formData.type} 
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="BASE">Cycle d'Éducation de Base (7ème - 8ème)</option>
                  <option value="OPTIONNEL">Cycle des Humanités (1ère - 4ème)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                  Désignation du Niveau
                </label>
                {formData.type === "BASE" ? (
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl p-3.5 font-bold outline-none border-2 border-transparent focus:border-[#1d61ff] dark:focus:border-blue-500 transition-all text-xs" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  >
                    <option value="7ème Année">7ème Année</option>
                    <option value="8ème Année">8ème Année</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    placeholder="Ex: 1ère Générale, 3ème Commerciale..." 
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl p-3.5 font-bold outline-none border-2 border-transparent focus:border-[#1d61ff] dark:focus:border-blue-500 transition-all text-xs"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                )}
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active} 
                  onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                  className="w-4 h-4 accent-[#1d61ff] rounded" 
                />
                <label htmlFor="active" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Niveau ouvert pour le suivi académique
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/10 hover:opacity-95 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-800 dark:disabled:to-slate-900 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  editMode ? "Mettre à jour" : "Confirmer la création"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NiveauScolaire;