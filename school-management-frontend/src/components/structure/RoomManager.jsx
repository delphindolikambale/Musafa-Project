import React, { useState, useEffect } from 'react';
import { RoomService } from '../../services/roomService';
import RoomForm from './RoomForm'; 
import { Edit, Trash2, Power, Plus, Loader2, Printer, AlertTriangle } from 'lucide-react';

const RoomManager = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    
    // États pour la capture et gestion des erreurs globale
    const [globalError, setGlobalError] = useState(null);
    
    // États pour la boîte de dialogue stylisée de suppression
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, roomId: null, roomName: '' });

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        setLoading(true);
        setGlobalError(null);
        try {
            const response = await RoomService.getAll();
            setRooms(response.data || []);
        } catch (error) {
            console.error("Erreur chargement:", error);
            setGlobalError("Impossible de récupérer la liste des infrastructures. Veuillez vérifier la connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleToggleStatus = async (roomId) => {
        setActionLoading(roomId);
        setGlobalError(null);
        try {
            await RoomService.toggleStatus(roomId); 
            setRooms(prevRooms => prevRooms.map(room => 
                room.id === roomId ? { ...room, active: !room.active } : room
            ));
        } catch (error) {
            const msg = error.response?.data?.message || "Impossible de modifier le statut opérationnel de la salle.";
            setGlobalError(msg);
        } finally {
            setActionLoading(null);
        }
    };

    const openDeleteConfirmation = (id, name) => {
        setDeleteModal({ isOpen: true, roomId: id, roomName: name });
    };

    const closeDeleteConfirmation = () => {
        setDeleteModal({ isOpen: false, roomId: null, roomName: '' });
    };

    const confirmDelete = async () => {
        const id = deleteModal.roomId;
        setGlobalError(null);
        try {
            await RoomService.delete(id);
            setRooms(rooms.filter(r => r.id !== id));
            closeDeleteConfirmation();
        } catch (error) {
            const msg = error.response?.data?.message || "Une erreur est survenue lors de l'exécution de la suppression.";
            setGlobalError(msg);
            closeDeleteConfirmation();
        }
    };

    if (loading && rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 dark:bg-[#0F172A] min-h-[50vh]">
                <Loader2 className="animate-spin text-blue-600 dark:text-blue-500 mb-4" size={40} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Chargement des infrastructures...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
            {/* --- INTERFACE ÉCRAN --- */}
            <div className="screen-content max-w-7xl mx-auto">
                
                {/* En-tête de la page */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0D1B3E] dark:text-white">Gestion des Salles Physiques</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configuration des bâtiments et capacités d'accueil</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button 
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm flex items-center justify-center gap-2 transition font-medium"
                        >
                            <Printer size={18} /> <span className="hidden xs:inline">Imprimer la liste</span>
                        </button>
                        <button 
                            onClick={() => { setSelectedRoom(null); setIsModalOpen(true); }} 
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded shadow flex items-center justify-center gap-2 transition font-bold"
                        >
                            <Plus size={18} /> Nouvelle Salle
                        </button>
                    </div>
                </div>

                {/* Notifications globales d'erreurs capturées */}
                {globalError && (
                    <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-lg flex items-start gap-3 animate-in fade-in">
                        <AlertTriangle className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-400">Erreur système détectée</p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{globalError}</p>
                        </div>
                        <button onClick={() => setGlobalError(null)} className="text-red-500 hover:text-red-700 dark:text-red-400 font-bold text-xs px-2 py-1 bg-red-100 dark:bg-red-950/50 rounded">
                            Masquer
                        </button>
                    </div>
                )}

                {/* Tableau Responsive des infrastructures */}
                <div className="bg-white dark:bg-[#1E293B] shadow-md rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="w-full overflow-x-auto scrolling-touch">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            {/* En-tête stylisé avec un dégradé délimité */}
                            <thead>
                                <tr className="bg-gradient-to-r from-[#0D1B3E] to-blue-700 text-white font-semibold">
                                    <th className="p-4 rounded-tl-xl border-b border-gray-200 dark:border-gray-700">Nom de la salle</th>
                                    <th className="p-4 border-b border-gray-200 dark:border-gray-700">Bâtiment</th>
                                    <th className="p-4 border-b border-gray-200 dark:border-gray-700">Capacité</th>
                                    <th className="p-4 border-b border-gray-200 dark:border-gray-700">Statut</th>
                                    <th className="p-4 text-right rounded-tr-xl border-b border-gray-200 dark:border-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Aucune infrastructure physique enregistrée pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition duration-150">
                                            <td className="p-4 font-bold text-gray-900 dark:text-white uppercase tracking-wide">{room.name}</td>
                                            <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">{room.building || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-black tracking-wider">
                                                    {room.capacity} places
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                                                    room.active 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
                                                }`}>
                                                    {room.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 flex justify-end gap-2 sm:gap-3">
                                                <button 
                                                    disabled={actionLoading === room.id}
                                                    onClick={() => handleToggleStatus(room.id)}
                                                    title={room.active ? "Désactiver la salle" : "Activer la salle"}
                                                    className={`p-1.5 rounded-lg border transition-all ${
                                                        actionLoading === room.id ? 'opacity-50 cursor-not-allowed' :
                                                        room.active 
                                                            ? 'text-orange-600 border-orange-100 dark:border-orange-950 hover:bg-orange-50 dark:hover:bg-orange-950/30' 
                                                            : 'text-green-600 border-green-100 dark:border-green-950 hover:bg-green-50 dark:hover:bg-green-950/30'
                                                    }`}
                                                >
                                                    {actionLoading === room.id ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedRoom(room); setIsModalOpen(true); }} 
                                                    title="Modifier l'infrastructure"
                                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteConfirmation(room.id, room.name)} 
                                                    title="Supprimer la salle"
                                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-100 dark:hover:border-red-900 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- DOCUMENT D'IMPRESSION --- */}
            <div className="print-only">
                <div className="flex justify-between items-start border-b-4 border-blue-900 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-blue-900">MUSAFA SYSTEM</h1>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Complexe Scolaire de Référence</p>
                        <p className="text-xs text-gray-500 italic">"L'excellence au service de l'éducation"</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold uppercase underline">Liste des Salles Physiques</h2>
                        <p className="text-sm mt-1">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border-2 border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left">Nom de la Salle</th>
                            <th className="border border-black p-2 text-left">Bâtiment</th>
                            <th className="border border-black p-2 text-center">Capacité</th>
                            <th className="border border-black p-2 text-center">État</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id}>
                                <td className="border border-black p-2 font-bold uppercase">{room.name}</td>
                                <td className="border border-black p-2 uppercase">{room.building || 'Non spécifié'}</td>
                                <td className="border border-black p-2 text-center font-bold">{room.capacity} places</td>
                                <td className="border border-black p-2 text-center uppercase">
                                    {room.active ? 'OPÉRATIONNELLE' : 'INDISPONIBLE'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-20 flex justify-between px-10">
                    <div className="text-center">
                        <p className="font-bold underline mb-16 uppercase text-sm">Le Secrétaire Administratif</p>
                        <p className="text-[10px] text-gray-400 font-normal">(Signature et Sceau)</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold underline mb-16 uppercase text-sm">Le Préfet des Études</p>
                        <p className="text-[10px] text-gray-400 font-normal">(Signature et Sceau)</p>
                    </div>
                </div>
            </div>
            
            {/* --- MODAL FORMULAIRE AJOUT/EDITION --- */}
            {isModalOpen && (
                <RoomForm 
                    initialData={selectedRoom}
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { loadRooms(); setIsModalOpen(false); }} 
                />
            )}

            {/* --- BOÎTE DE DIALOGUE DE CONFIRMATION DE SUPPRESSION ALIGNÉE --- */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full mb-4">
                                <AlertTriangle size={30} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Voulez-vous vraiment supprimer définitivement la salle physique <strong className="text-red-600 dark:text-red-400 uppercase">{deleteModal.roomName}</strong> ? Cette action est irréversible.
                            </p>
                            <div className="flex justify-center gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={closeDeleteConfirmation}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;