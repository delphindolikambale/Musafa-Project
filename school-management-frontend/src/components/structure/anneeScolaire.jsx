import React, { useState, useEffect } from "react";
import academicService from "../../services/academicYearService";
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  CalendarCheck,
  X
} from "lucide-react";

const AnneeScolaire = () => {
  const [years, setYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const initialForm = { annee: "", dateDebut: "", dateFin: "", active: true };
  const [formData, setFormData] = useState(initialForm);

  // Boite de dialogue et notifications personnalisées
  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, year: null });

  const fetchYears = async () => {
    try {
      const response = await academicService.getAllAcademicYears();
      setYears(response.data);
    } catch (error) { 
      console.error("Erreur récupération :", error); 
      showNotification("error", "Erreur système", "Impossible de charger les années scolaires depuis le serveur.");
    }
  };

  useEffect(() => { 
    fetchYears(); 
  }, []);

  const showNotification = (type, title, text) => {
    setNotification({ show: true, type, title, text });
  };

  const formatDateIntl = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleOpenEdit = (year) => {
    setEditMode(true);
    setCurrentId(year.id);
    setFormData({ annee: year.annee, dateDebut: year.dateDebut, dateFin: year.dateFin, active: year.active });
    setShowModal(true);
  };

  const triggerDeleteConfirm = (year) => {
    setConfirmDialog({ show: true, year });
  };

  const handleDelete = async () => {
    const year = confirmDialog.year;
    if (!year) return;
    
    setConfirmDialog({ show: false, year: null });
    try {
      await academicService.deleteAcademicYear(year.id);
      showNotification("success", "Suppression réussie", `L'année scolaire ${year.annee} a été supprimée avec succès.`);
      fetchYears();
    } catch (error) {
      const backendError = error.response?.data?.message || "Erreur lors de la suppression de la ressource.";
      showNotification("error", "Échec de suppression", backendError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const yearStart = formData.dateDebut.split("-")[0];
    const yearEnd = formData.dateFin.split("-")[0];
    const expectedLabel = `${yearStart}-${yearEnd}`;

    if (formData.annee !== expectedLabel) {
      showNotification("error", "Incohérence de données", `Le libellé saisi ne correspond pas aux dates. Il doit impérativement être au format "${expectedLabel}".`);
      setLoading(false);
      return;
    }

    try {
      if (editMode) {
        await academicService.updateAcademicYear(currentId, formData);
        showNotification("success", "Mise à jour réussie", `L'année scolaire ${formData.annee} a été modifiée avec succès.`);
      } else {
        await academicService.createAcademicYear(formData);
        showNotification("success", "Enregistrement réussi", `L'année scolaire ${formData.annee} a été créée et ajoutée au calendrier.`);
      }
      setShowModal(false);
      fetchYears();
    } catch (error) {
      const backendError = error.response?.data?.message || "Une erreur inattendue est survenue sur le serveur de l'établissement.";
      showNotification("error", "Erreur d'enregistrement", backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a1d43] dark:text-white flex items-center gap-3">
            <Calendar className="text-blue-600 dark:text-blue-500" size={28} />
            Calendrier Académique
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Configurez et gérez les sessions d'années scolaires de l'établissement.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-initial">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Rechercher une année..." 
              className="pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-64 outline-none font-semibold text-sm focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => { setEditMode(false); setFormData(initialForm); setShowModal(true); }} 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Nouveau calendrier
          </button>
        </div>
      </div>

      {/* GRILLE RESPONSIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.filter(y => y.annee.includes(searchTerm)).map((year) => (
          <div 
            key={year.id} 
            className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 relative transition-all duration-300 group
              ${year.active 
                ? "border-blue-500 dark:border-blue-500 shadow-xl shadow-blue-500/5 dark:shadow-blue-950/20 scale-[1.01]" 
                : "border-slate-200/60 dark:border-slate-800/60 opacity-90 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700"}`}
          >
            
            {/* BOUTONS D'ACTIONS */}
            <div className="absolute top-6 right-6 flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenEdit(year)} 
                title="Modifier" 
                className="p-2 bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={() => triggerDeleteConfirm(year)} 
                title="Supprimer" 
                className="p-2 bg-slate-50 hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {/* BADGES */}
            <div className="absolute top-6 left-6">
              {year.active ? (
                <span className="bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-blue-500/20">
                  <CalendarCheck size={12} /> Session Active
                </span>
              ) : (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Archive
                </span>
              )}
            </div>

            {/* CONTENU CARTE */}
            <div className="mt-12">
              <h2 className="text-4xl font-black text-[#0a1d43] dark:text-white mb-6 tracking-tighter italic group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {year.annee}
              </h2>
              
              <div className="bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-2xl grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800/40">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">OUVERTURE</p>
                  <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{formatDateIntl(year.dateDebut)}</p>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">CLÔTURE</p>
                  <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{formatDateIntl(year.dateFin)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CONFIGURATION (AJOUT / EDITION) */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="absolute inset-0 bg-[#0a1d43]/50 dark:bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 text-slate-800 dark:text-white transform transition-all">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-black mb-6 text-[#0a1d43] dark:text-white flex items-center gap-2.5">
              <Calendar className="text-blue-500" size={24} />
              {editMode ? "Modifier la Session" : "Nouveau Calendrier"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  Libellé de l'année scolaire
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: 2025-2026" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 outline-none font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 text-slate-800 dark:text-slate-200 text-sm" 
                  value={formData.annee} 
                  onChange={(e) => setFormData({...formData, annee: e.target.value})} 
                  required 
                />
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-1 italic">
                  Format requis : Début - Fin (ex: {formData.dateDebut ? `${formData.dateDebut.split("-")[0]}-${formData.dateFin.split("-")[0] || "2026"}` : "2025-2026"})
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Date Début</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 outline-none font-semibold text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500" 
                    value={formData.dateDebut} 
                    onChange={(e) => setFormData({...formData, dateDebut: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Date Fin</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 outline-none font-semibold text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500" 
                    value={formData.dateFin} 
                    onChange={(e) => setFormData({...formData, dateFin: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <input 
                  type="checkbox" 
                  id="sessionActive"
                  checked={formData.active} 
                  onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer" 
                />
                <label htmlFor="sessionActive" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Définir comme session active globale
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0a1d43] dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs active:scale-[0.99] transition-all shadow-xl shadow-blue-950/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Traitement...</>
                ) : (
                  editMode ? "Enregistrer les modifications" : "Créer l'année académique"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOÎTE DE DIALOGUE DE CONFIRMATION DE SUPPRESSION */}
      {confirmDialog.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-sm w-full p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 text-center transform scale-100 transition-all">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-500 mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2 text-slate-900 dark:text-white">Action irréversible</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Voulez-vous réellement détruire la session <span className="font-bold text-red-600 dark:text-red-400">{confirmDialog.year?.annee}</span> ? Les données liées aux suivis et structures de cette période seront inaccessibles.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ show: false, year: null })}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOÎTE DE DIALOGUE INFORMATIVE ET DE CAPTURE D'ERREUR */}
      {notification.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className={`max-w-sm w-full p-6 rounded-[2.5rem] border shadow-2xl text-center transform scale-100 transition-all ${notification.type === "success" ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" : "bg-white dark:bg-slate-900 border-red-200 dark:border-red-950 text-slate-900 dark:text-white"}`}>
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4">
              {notification.type === "success" ? (
                <CheckCircle2 size={48} className="text-green-500" />
              ) : (
                <XCircle size={48} className="text-red-500" />
              )}
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">
              {notification.title}
            </h3>
            <p className="text-sm font-medium mb-6 text-slate-500 dark:text-slate-400 leading-relaxed">
              {notification.text}
            </p>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-transform active:scale-[0.97] shadow-lg
                ${notification.type === "success" 
                  ? "bg-green-600 text-white shadow-green-600/10" 
                  : "bg-red-600 text-white shadow-red-600/10"}`}
            >
              Prendre note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnneeScolaire;