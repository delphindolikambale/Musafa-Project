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
            const message = err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement de la salle.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1E293B] rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                
                {/* En-tête Modal */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1E293B]">
                    <h2 className="text-xl font-bold text-[#0D1B3E] dark:text-white">
                        {initialData ? 'Modifier la Salle' : 'Nouvelle Salle Physique'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Zone d'erreur métier */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4 rounded flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-xs uppercase font-bold text-red-600 dark:text-red-400">Action impossible</p>
                                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Nom de la salle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Nom de la salle
                        </label>
                        <input 
                            type="text" 
                            required
                            className={`w-full border rounded-lg p-2.5 outline-none transition-all dark:bg-[#0F172A] dark:text-white ${
                                error 
                                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                                    : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600'
                            }`}
                            value={formData.name}
                            onChange={(e) => {
                                if(error) setError(null);
                                setFormData({...formData, name: e.target.value});
                            }}
                        />
                    </div>
                    
                    {/* Capacité & Bâtiment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Capacité
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                required
                                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Bâtiment
                            </label>
                            <input 
                                type="text"
                                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.building}
                                onChange={(e) => setFormData({...formData, building: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Statut Optionnel */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="active-checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500"
                            checked={formData.active}
                            onChange={(e) => setFormData({...formData, active: e.target.checked})}
                        />
                        <label htmlFor="active-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            Salle opérationnelle et disponible immédiatement
                        </label>
                    </div>

                    {/* Actions de bas de formulaire */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
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