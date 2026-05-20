import React, { useState, useEffect } from "react";
import academicService from "../../services/academicYearService";

const AnneeScolaire = () => {
  const [years, setYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const initialForm = { annee: "", dateDebut: "", dateFin: "", active: true };
  const [formData, setFormData] = useState(initialForm);

  const fetchYears = async () => {
    try {
      const response = await academicService.getAllAcademicYears();
      setYears(response.data);
    } catch (error) { console.error("Erreur récupération :", error); }
  };

  useEffect(() => { fetchYears(); }, []);

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

  const handleDelete = async (year) => {
    const confirmDelete = window.confirm(`Voulez-vous réellement supprimer l'année scolaire ${year.annee} ? Cette action est irréversible.`);
    if (confirmDelete) {
      try {
        await academicService.deleteAcademicYear(year.id);
        fetchYears();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const yearStart = formData.dateDebut.split("-")[0];
    const yearEnd = formData.dateFin.split("-")[0];
    const expectedLabel = `${yearStart}-${yearEnd}`;

    if (formData.annee !== expectedLabel) {
      alert(`Erreur de cohérence : Le libellé doit être "${expectedLabel}" pour correspondre aux dates sélectionnées.`);
      return;
    }

    try {
      if (editMode) {
        await academicService.updateAcademicYear(currentId, formData);
      } else {
        await academicService.createAcademicYear(formData);
      }
      setShowModal(false);
      fetchYears();
    } catch (error) {
      alert("Erreur lors de l'enregistrement sur le serveur.");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#0a1d43]">Calendrier Scolaire</h1>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Rechercher une année..." 
            className="pl-4 py-2 border rounded-lg w-64 outline-none focus:ring-2 focus:ring-[#1d61ff]" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button 
            onClick={() => { setEditMode(false); setFormData(initialForm); setShowModal(true); }} 
            className="bg-[#1d61ff] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#154edb] transition-all"
          >
            + Nouveau
          </button>
        </div>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.filter(y => y.annee.includes(searchTerm)).map((year) => (
          <div key={year.id} className={`bg-white p-7 rounded-[2rem] border-2 relative transition-all ${year.active ? "border-[#1d61ff] shadow-md scale-[1.02]" : "border-gray-100 opacity-90"}`}>
            
            <div className="absolute top-6 right-6 flex gap-2">
              <button onClick={() => handleOpenEdit(year)} title="Modifier" className="text-gray-300 hover:text-blue-500 transition-colors text-xl">✏️</button>
              <button onClick={() => handleDelete(year)} title="Supprimer" className="text-gray-300 hover:text-red-500 transition-colors text-xl">🗑️</button>
            </div>
            
            {/* BADGES DISTINCTS : ACTIVE VS ARCHIVE */}
            <div className="absolute top-6 left-6">
              {year.active ? (
                <span className="bg-[#1d61ff] text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Session Active
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-400 text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Archive
                </span>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-4xl font-black text-[#0a1d43] mb-8 italic tracking-tighter">{year.annee}</h2>
              <div className="bg-gray-50/50 p-5 rounded-2xl grid grid-cols-2 gap-4 border border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">DÉBUT</p>
                  <p className="font-bold text-gray-700 text-sm">{formatDateIntl(year.dateDebut)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">FIN</p>
                  <p className="font-bold text-gray-700 text-sm">{formatDateIntl(year.dateFin)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-[#0a1d43]/40 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative z-10">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-8 text-2xl text-gray-400 hover:text-gray-600 transition-colors">×</button>
            
            <h2 className="text-2xl font-black mb-8 text-[#0a1d43]">{editMode ? "Modifier l'année" : "Nouveau Calendrier"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Libellé (ex: {formData.dateDebut ? `${formData.dateDebut.split("-")[0]}-${formData.dateFin.split("-")[0]}` : "2025-2026"})</label>
                <input 
                  type="text" 
                  placeholder="Ex: 2025-2026" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#1d61ff]" 
                  value={formData.annee} 
                  onChange={(e) => setFormData({...formData, annee: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date Début</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none" value={formData.dateDebut} onChange={(e) => setFormData({...formData, dateDebut: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date Fin</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none" value={formData.dateFin} onChange={(e) => setFormData({...formData, dateFin: e.target.value})} required />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-[#1d61ff] cursor-pointer" />
                <span className="text-sm font-medium text-gray-600">Session active</span>
              </div>
              
              <button type="submit" className="w-full bg-[#0a1d43] text-white py-5 rounded-[1.5rem] font-bold uppercase tracking-widest hover:bg-[#1d61ff] transition-all shadow-lg">
                {editMode ? "METTRE À JOUR" : "ENREGISTRER LA PÉRIODE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnneeScolaire;