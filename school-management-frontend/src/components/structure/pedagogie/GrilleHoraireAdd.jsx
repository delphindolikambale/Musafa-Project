import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertTriangle } from 'lucide-react';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';
// Assurez-vous que le chemin d'importation vers academicService correspond à votre arborescence
import academicYearService from '../../../services/academicYearService';
import { toast } from 'react-hot-toast';

const GrilleHoraireAdd = ({ isOpen, onClose, activeCycle, selectedOptionId, activeYearId, allLevels, onSaveSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    
    // États du formulaire principal
    const [courseName, setCourseName] = useState("");
    const [category, setCategory] = useState("GENERAL");
    const [hoursInputs, setHoursInputs] = useState({});

    // Récupérer la liste des colonnes/niveaux à afficher selon le contexte
    const cycleLevels = activeCycle === "CEB" ? ["7ème", "8ème"] : ["1ère", "2ème", "3ème", "4ème"];
    
    // Obtenir la correspondance réelle des objets Level du backend avec une sécurité si allLevels est indéfini
    const currentCycleLevelsObjects = allLevels 
        ? cycleLevels.map(name => 
            allLevels.find(l => l && (l.name === name || l.name.includes(name)))
          ).filter(Boolean)
        : [];

    // Initialiser et réinitialiser les champs à l'ouverture du modal
    useEffect(() => {
        if (isOpen) {
            setCourseName("");
            setCategory("GENERAL");
            setFormError("");
            
            // Initialiser les inputs d'heures à vide de manière sécurisée
            const initialHours = {};
            currentCycleLevelsObjects.forEach(lvl => {
                if (lvl && lvl.id) {
                    initialHours[lvl.id] = "";
                }
            });
            setHoursInputs(initialHours);
        }
    }, [isOpen, activeCycle, allLevels]);

    const handleHourChange = (levelId, value) => {
        setHoursInputs(prev => ({
            ...prev,
            [levelId]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!courseName.trim()) {
            toast.error("Le nom du cours est obligatoire.");
            return;
        }

        // On vérifie d'abord les heures avant de bloquer l'interface avec le chargement
        const levelHoursMap = {};
        let hasHours = false;

        currentCycleLevelsObjects.forEach(lvl => {
            if (lvl && lvl.id) {
                const hVal = parseFloat(hoursInputs[lvl.id]);
                if (!isNaN(hVal) && hVal > 0) {
                    levelHoursMap[lvl.id] = hVal;
                    hasHours = true;
                }
            }
        });

        if (!hasHours) {
            toast.error("Veuillez renseigner au moins une heure pour l'un des niveaux.");
            return;
        }

        // Début de la soumission et des appels réseau
        setSubmitting(true);

        try {
            // Fonction sécurisée pour extraire l'ID qu'il soit un objet, un entier ou un texte
            const getSafeId = (val) => {
                if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") return null;
                if (typeof val === 'object') return val.id ? parseInt(val.id, 10) : null;
                const parsed = parseInt(val, 10);
                return isNaN(parsed) ? null : parsed;
            };

            let safeYearId = getSafeId(activeYearId);

            // ADAPTATION MAJEURE : Récupération dynamique et automatique de l'année scolaire active si non fournie
            if (!safeYearId) {
                try {
                    const yearRes = await academicYearService.getActiveYear();
                    safeYearId = getSafeId(yearRes.data?.id);
                } catch (yearErr) {
                    console.error("Impossible de récupérer l'année académique active depuis le serveur:", yearErr);
                }
            }

            // Si malgré l'appel API, l'année reste introuvable, on bloque proprement (car la BD PostgreSQL l'exige)
            if (!safeYearId) {
                const errorMsg = "Aucune année académique active n'a été trouvée dans le système. Veuillez en configurer une.";
                setFormError(errorMsg);
                toast.error(errorMsg);
                setSubmitting(false);
                return;
            }

            const safeOptionId = (activeCycle === "CEB" || !selectedOptionId) ? null : getSafeId(selectedOptionId);

            // Construction du payload GridSubjectRequestDTO sans association directe de domaine
            const payload = {
                sectionId: null, 
                optionId: safeOptionId,
                academicYearId: safeYearId, // Injection de l'ID valide ici
                courses: [
                    {
                        name: courseName.trim(),
                        domainId: null, 
                        category: category, 
                        levelHours: levelHoursMap
                    }
                ]
            };

            await courseAcademicConfigService.saveBulkGrid(payload);
            toast.success("Cours enregistré avec succès dans la grille !");
            if (onSaveSuccess) onSaveSuccess();
            onClose();

        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la grille:", error);
            
            // Extraction sécurisée du message d'erreur envoyé du Backend
            let backendErrorMessage = "Une erreur interne est survenue lors de l'enregistrement.";
            
            if (error.response?.data) {
                if (typeof error.response.data === "string") {
                    backendErrorMessage = error.response.data;
                } else if (error.response.data.message) {
                    backendErrorMessage = error.response.data.message;
                }
            }
                
            setFormError(backendErrorMessage);
            toast.error(backendErrorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-lg mx-4 overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Ajouter un nouveau cours</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configuration matricielle de la grille horaire</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {formError && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs border border-red-100 dark:border-red-900/30">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <div>{formError}</div>
                        </div>
                    )}

                    {/* Nom du cours */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nom du cours / Matière</label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Ex: Mathématiques, Histoire, Physique..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {/* Catégorie */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Catégorie de cours</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                            <option value="GENERAL">Général (Tronc Commun)</option>
                            <option value="TECHNIQUE">Technique / Optionnel</option>
                        </select>
                    </div>

                    {/* Volumes Horaires par Niveau */}
                    <div className="space-y-2.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Volumes horaires hebdomadaires par niveau</label>
                        <div className="grid grid-cols-2 gap-3">
                            {currentCycleLevelsObjects.map((lvl) => (
                                <div key={lvl.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{lvl.name}</span>
                                    <div className="flex items-center gap-1.5 w-24">
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={hoursInputs[lvl.id] || ""}
                                            onChange={(e) => handleHourChange(lvl.id, e.target.value)}
                                            placeholder="0.0"
                                            className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <span className="text-[10px] text-slate-400 font-medium">H</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase shadow-md shadow-indigo-600/10 transition-colors disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} /> Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Enregistrer le cours
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default GrilleHoraireAdd;