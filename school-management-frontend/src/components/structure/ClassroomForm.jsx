import React, { useState, useEffect } from 'react';
import { RoomService } from '../../services/roomService';
import { ClassroomService } from '../../services/classroomService';
import levelService from '../../services/levelService';
import sectionService from '../../services/sectionService';
import optionService from '../../services/optionService';
import { AlertCircle, X, Loader2, Info, CheckCircle2, ServerCrash } from 'lucide-react';

const ClassroomForm = ({ onClose, onSuccess, initialData = null }) => {
    const [data, setData] = useState({ rooms: [], levels: [], sections: [], options: [] });
    const [loading, setLoading] = useState(false);
    
    // Notification locale interne pour les erreurs formulaires ou backend
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({ 
        levelId: '', 
        sectionId: '', 
        optionId: '', 
        roomId: '', 
        division: '' 
    });

    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                const [l, s] = await Promise.all([
                    levelService.getAllLevels(),
                    sectionService.getAll()
                ]);
                setData(prev => ({ 
                    ...prev,
                    levels: l.data.filter(lvl => lvl.active),
                    sections: s.data.filter(sec => sec.active)
                }));
            } catch (err) { 
                console.error("Erreur de chargement", err); 
                setNotification({
                    type: 'error',
                    title: 'Erreur Serveur',
                    message: err.response?.data?.message || "Impossible de charger les données de configuration statiques."
                });
            }
        };
        fetchStaticData();
    }, []);

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            try {
                const params = initialData?.id ? `?excludeClassroomId=${initialData.id}` : '';
                const res = await RoomService.getAvailable(params); 
                setData(prev => ({ ...prev, rooms: res.data }));
            } catch (err) { 
                console.error("Erreur salles", err); 
            }
        };
        fetchAvailableRooms();
    }, [initialData]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                levelId: initialData.levelId || initialData.level?.id || '',
                sectionId: initialData.sectionId || initialData.section?.id || '',
                optionId: initialData.optionId || initialData.option?.id || '',
                roomId: initialData.roomId || initialData.room?.id || '',
                division: initialData.division || ''
            });

            const sId = initialData.sectionId || initialData.section?.id;
            if (sId) {
                optionService.getBySection(sId)
                    .then(res => setData(prev => ({ ...prev, options: res.data.filter(o => o.active) })));
            }
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.sectionId) {
            optionService.getBySection(formData.sectionId)
                .then(res => setData(prev => ({ ...prev, options: res.data.filter(o => o.active) })))
                .catch(() => setData(prev => ({ ...prev, options: [] })));
        } else {
            setData(prev => ({ ...prev, options: [] }));
        }
    }, [formData.sectionId]);

    const selectedLevel = data.levels.find(l => l.id === parseInt(formData.levelId));
    const isBaseLevel = selectedLevel?.name?.includes("7ème") || selectedLevel?.name?.includes("8ème") || selectedLevel?.name?.includes("7ième") || selectedLevel?.name?.includes("8ième");
    const selectedRoom = data.rooms.find(r => r.id === parseInt(formData.roomId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification(null);
        setLoading(true);

        const payload = { 
            levelId: parseInt(formData.levelId),
            roomId: parseInt(formData.roomId),
            sectionId: isBaseLevel ? null : (formData.sectionId ? parseInt(formData.sectionId) : null),
            optionId: isBaseLevel ? null : (formData.optionId ? parseInt(formData.optionId) : null),
            division: formData.division && formData.division.trim() !== "" 
                      ? formData.division.trim().toUpperCase() 
                      : null 
        };

        try {
            if (initialData?.id) {
                await ClassroomService.updateClassroom(initialData.id, payload);
                setNotification({
                    type: 'success',
                    title: 'Mise à jour réussie',
                    message: 'La classe pédagogique a été modifiée avec succès.'
                });
            } else {
                await ClassroomService.create(payload);
                setNotification({
                    type: 'success',
                    title: 'Enregistrement réussi',
                    message: 'La nouvelle classe a été ouverte et configurée.'
                });
            }
            setTimeout(() => {
                onSuccess();
            }, 1200);
        } catch (err) {
            console.error(err);
            setNotification({
                type: 'error',
                title: 'Échec de l\'action',
                message: err.response?.data?.message || err.message || "Une erreur inconnue est survenue au niveau du serveur."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0D1B3E]/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                
                {/* En-tête */}
                <div className="bg-[#0D1B3E] dark:bg-[#0F172A] p-5 text-white flex justify-between items-center border-b border-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <span className="w-2.5 h-6 bg-[#2ECC71] rounded-full"></span>
                        {initialData ? 'Modifier la Classe' : 'Ouvrir une Nouvelle Classe'}
                    </h2>
                    <button 
                        type="button"
                        onClick={onClose} 
                        disabled={loading} 
                        className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Notification d'action intégrée */}
                {notification && (
                    <div className={`p-4 mx-6 mt-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                        notification.type === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400' 
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-400'
                    }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-500" size={18} />
                        ) : (
                            <ServerCrash className="shrink-0 mt-0.5 text-rose-500" size={18} />
                        )}
                        <div>
                            <h4 className="font-bold text-sm">{notification.title}</h4>
                            <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Niveau Scolaire */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Niveau Scolaire</label>
                            <select 
                                required 
                                className="w-full bg-gray-50 dark:bg-[#334155] text-[#0D1B3E] dark:text-gray-100 border-2 border-gray-100 dark:border-slate-600 p-3 rounded-xl outline-none focus:border-[#2ECC71] dark:focus:border-[#2ECC71] transition-all font-medium text-sm"
                                value={formData.levelId} 
                                onChange={(e) => setFormData({...formData, levelId: e.target.value})}
                            >
                                <option value="">-- Choisir le niveau --</option>
                                {data.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        {/* Salle Physique */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Salle Physique</label>
                            <select 
                                required 
                                className="w-full bg-gray-50 dark:bg-[#334155] text-[#0D1B3E] dark:text-gray-100 border-2 border-gray-100 dark:border-slate-600 p-3 rounded-xl outline-none focus:border-[#2ECC71] dark:focus:border-[#2ECC71] transition-all font-medium text-sm"
                                value={formData.roomId} 
                                onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                            >
                                <option value="">-- Sélectionner la salle --</option>
                                {data.rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} (Max: {r.capacity} pl.)</option>
                                ))}
                            </select>
                            
                            {selectedRoom && (
                                <div className="mt-2 flex items-center gap-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 animate-in fade-in slide-in-from-top-1">
                                    <Info size={14} className="shrink-0" />
                                    <span className="text-[11px] font-semibold">Capacité fixée à {selectedRoom.capacity} élèves.</span>
                                </div>
                            )}
                        </div>

                        {/* Sections & Options conditionnelles */}
                        {!isBaseLevel && (
                            <>
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Section</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-[#334155] text-[#0D1B3E] dark:text-gray-100 border-2 border-gray-100 dark:border-slate-600 p-3 rounded-xl outline-none focus:border-[#2ECC71] dark:focus:border-[#2ECC71] transition-all font-medium text-sm"
                                        value={formData.sectionId} 
                                        onChange={(e) => setFormData({...formData, sectionId: e.target.value})}
                                    >
                                        <option value="">-- Tronc Commun --</option>
                                        {data.sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Option</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-[#334155] text-[#0D1B3E] dark:text-gray-100 border-2 border-gray-100 dark:border-slate-600 p-3 rounded-xl outline-none focus:border-[#2ECC71] dark:focus:border-[#2ECC71] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={formData.optionId} 
                                        disabled={!formData.sectionId} 
                                        onChange={(e) => setFormData({...formData, optionId: e.target.value})}
                                    >
                                        <option value="">-- Aucune option --</option>
                                        {data.options.map(o => <option key={o.id} value={o.id}>{o.optionName}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Division */}
                        <div className="col-span-1 sm:col-span-2 flex flex-col">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Division (Optionnel - Ex: A, B, Nord...)</label>
                            <input 
                                type="text" 
                                maxLength="10" 
                                placeholder="Ex: A (Laisser vide si non applicable)"
                                className="w-full bg-gray-50 dark:bg-[#334155] text-[#0D1B3E] dark:text-gray-100 border-2 border-gray-100 dark:border-slate-600 p-3 rounded-xl outline-none uppercase focus:border-[#2ECC71] dark:focus:border-[#2ECC71] transition-all font-medium text-sm"
                                value={formData.division} 
                                onChange={(e) => setFormData({...formData, division: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Actions de pied de page */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={loading} 
                            className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-center"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#2ECC71] hover:bg-[#27ae60] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-70 transition-all active:scale-95 text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (initialData ? 'Mettre à jour' : 'Enregistrer la Classe')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassroomForm;