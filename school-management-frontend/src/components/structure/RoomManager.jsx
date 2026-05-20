import React, { useState, useEffect } from 'react';
import { RoomService } from '../../services/roomService';
import RoomForm from './RoomForm'; 
// Correction de l'import : Assurez-vous qu'aucun "lucide-center" n'existe ici
import { Edit, Trash2, Power, Plus, Loader2, Printer } from 'lucide-react';

const RoomManager = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const response = await RoomService.getAll();
            setRooms(response.data);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleToggleStatus = async (roomId) => {
        setActionLoading(roomId);
        try {
            await RoomService.toggleStatus(roomId); 
            setRooms(prevRooms => prevRooms.map(room => 
                room.id === roomId ? { ...room, active: !room.active } : room
            ));
        } catch (error) {
            const msg = error.response?.data?.message || "Impossible de changer le statut.";
            alert(`Erreur : ${msg}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette salle ?")) {
            try {
                await RoomService.delete(id);
                setRooms(rooms.filter(r => r.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || "Erreur lors de la suppression.");
            }
        }
    };

    if (loading && rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Chargement des infrastructures...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* --- INTERFACE ÉCRAN (Encapsulée pour être cachée proprement) --- */}
            <div className="screen-content">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#0D1B3E]">Gestion des Salles Physiques</h1>
                    <div className="flex gap-3">
                        <button 
                            onClick={handlePrint}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm flex items-center gap-2 transition font-medium"
                        >
                            <Printer size={18} /> Imprimer la liste
                        </button>
                        <button 
                            onClick={() => { setSelectedRoom(null); setIsModalOpen(true); }} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition"
                        >
                            <Plus size={18} /> Nouvelle Salle
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-gray-700 font-semibold">
                                <th className="p-4">Nom de la salle</th>
                                <th className="p-4">Bâtiment</th>
                                <th className="p-4">Capacité</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{room.name}</td>
                                    <td className="p-4 text-gray-600">{room.building || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {room.capacity} places
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${room.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {room.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-3">
                                        <button 
                                            disabled={actionLoading === room.id}
                                            onClick={() => handleToggleStatus(room.id)}
                                            className={`p-1.5 rounded-lg border transition-all ${
                                                actionLoading === room.id ? 'opacity-50 cursor-not-allowed' :
                                                room.active ? 'text-orange-600 border-orange-100 hover:bg-orange-50' : 'text-green-600 border-green-100 hover:bg-green-50'
                                            }`}
                                        >
                                            {actionLoading === room.id ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedRoom(room); setIsModalOpen(true); }} 
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(room.id)} 
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- DOCUMENT D'IMPRESSION (Toujours présent dans le DOM, géré par index.css) --- */}
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
            
            {isModalOpen && (
                <RoomForm 
                    initialData={selectedRoom}
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { loadRooms(); setIsModalOpen(false); }} 
                />
            )}
        </div>
    );
};

export default RoomManager;