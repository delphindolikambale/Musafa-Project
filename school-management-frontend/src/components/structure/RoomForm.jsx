import React, { useState, useEffect } from 'react';
import { RoomService } from '../../services/roomService';
import { Loader2, X, AlertCircle } from 'lucide-react';

const RoomForm = ({ onClose, onSuccess, initialData = null }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const [formData, setFormData] = useState({ name: '', capacity: 1, building: '', active: true });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                capacity: initialData.capacity,
                building: initialData.building || '',
                active: initialData.active
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData) {
                await RoomService.update(initialData.id, formData);
            } else {
                await RoomService.create(formData);
            }
            onSuccess();
        } catch (err) {
            // ✅ RÉCUPÉRATION DU MESSAGE MÉTIER (ex: "Le nom CFR3 est déjà utilisé")
            const message = err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-[#0D1B3E]">
                        {initialData ? 'Modifier la Salle' : 'Nouvelle Salle Physique'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* ✅ ZONE D'ERREUR DÉTAILLÉE */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-xs uppercase font-bold text-red-600">Action impossible</p>
                                <p className="text-sm text-red-800 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la salle</label>
                        <input 
                            type="text" required
                            className={`w-full border rounded-lg p-2.5 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                            value={formData.name}
                            onChange={(e) => {
                                if(error) setError(null);
                                setFormData({...formData, name: e.target.value});
                            }}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Capacité</label>
                            <input 
                                type="number" min="1" required
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bâtiment</label>
                            <input 
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.building}
                                onChange={(e) => setFormData({...formData, building: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
                        >
                            {loading && <Loader2 className="animate-spin w-4 h-4" />}
                            {initialData ? 'Enregistrer les modifications' : 'Créer la salle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomForm;