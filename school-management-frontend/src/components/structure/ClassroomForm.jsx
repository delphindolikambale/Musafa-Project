import React, { useState, useEffect } from 'react';
import { RoomService } from '../../services/roomService';
import { ClassroomService } from '../../services/classroomService';
import levelService from '../../services/levelService';
import sectionService from '../../services/sectionService';
import optionService from '../../services/optionService';
import { AlertCircle, X, Loader2, Info } from 'lucide-react';

const ClassroomForm = ({ onClose, onSuccess, initialData = null }) => {
    const [data, setData] = useState({ rooms: [], levels: [], sections: [], options: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
            } catch (err) { console.error("Erreur de chargement", err); }
        };
        fetchStaticData();
    }, []);

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            try {
                const params = initialData?.id ? `?excludeClassroomId=${initialData.id}` : '';
                const res = await RoomService.getAvailable(params); 
                setData(prev => ({ ...prev, rooms: res.data }));
            } catch (err) { console.error("Erreur salles", err); }
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
    const isBaseLevel = selectedLevel?.name?.includes("7ème") || selectedLevel?.name?.includes("8ème");
    const selectedRoom = data.rooms.find(r => r.id === parseInt(formData.roomId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
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
            } else {
                await ClassroomService.create(payload);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0D1B3E]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#0D1B3E] p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-2 h-6 bg-[#2ECC71] rounded-full"></span>
                        {initialData ? 'Modifier la Classe' : 'Ouvrir une Nouvelle Classe'}
                    </h2>
                    <button onClick={onClose} disabled={loading} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3">
                            <AlertCircle className="text-red-500 shrink-0" />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="text-sm font-semibold text-gray-700">Niveau Scolaire</label>
                            <select required className="w-full mt-1 border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-[#2ECC71] transition-all"
                                value={formData.levelId} onChange={(e) => setFormData({...formData, levelId: e.target.value})}>
                                <option value="">-- Choisir --</option>
                                {data.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="text-sm font-semibold text-gray-700">Salle Physique</label>
                            <select required className="w-full mt-1 border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-[#2ECC71] transition-all"
                                value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: e.target.value})}>
                                <option value="">-- Sélectionner --</option>
                                {data.rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} (Capacité: {r.capacity})</option>
                                ))}
                            </select>
                            {selectedRoom && (
                                <div className="mt-2 flex items-center gap-1.5 text-[#1E40AF] bg-blue-50 p-2 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-1">
                                    <Info size={14} />
                                    <span className="text-[11px] font-bold">Capacité fixée à {selectedRoom.capacity} élèves.</span>
                                </div>
                            )}
                        </div>

                        {!isBaseLevel && (
                            <>
                                <div className="col-span-1">
                                    <label className="text-sm font-semibold text-gray-700">Section</label>
                                    <select className="w-full mt-1 border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-[#2ECC71] transition-all"
                                        value={formData.sectionId} onChange={(e) => setFormData({...formData, sectionId: e.target.value})}>
                                        <option value="">-- Tronc Commun --</option>
                                        {data.sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-sm font-semibold text-gray-700">Option</label>
                                    <select className="w-full mt-1 border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-[#2ECC71] transition-all"
                                        value={formData.optionId} disabled={!formData.sectionId} onChange={(e) => setFormData({...formData, optionId: e.target.value})}>
                                        <option value="">-- Aucune --</option>
                                        {data.options.map(o => <option key={o.id} value={o.id}>{o.optionName}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Division (Optionnel - Ex: A, B...)</label>
                            <input type="text" maxLength="2" placeholder="Laisser vide si non applicable"
                                className="w-full mt-1 border-2 border-gray-100 p-2.5 rounded-xl outline-none uppercase focus:border-[#2ECC71] transition-all"
                                value={formData.division} onChange={(e) => setFormData({...formData, division: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2 text-gray-400 font-medium hover:text-gray-600 transition-colors">Annuler</button>
                        <button type="submit" disabled={loading}
                            className="bg-[#2ECC71] hover:bg-[#27ae60] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-70 transition-all active:scale-95">
                            {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Mettre à jour' : 'Enregistrer la Classe')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassroomForm;