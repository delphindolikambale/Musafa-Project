import React, { useState, useEffect } from 'react';
import { ClassroomService } from '../../services/classroomService';
import academicService from '../../services/academicYearService'; // Ajout de l'import
import ClassroomForm from './ClassroomForm';
import RoomManager from './RoomManager';
import { Search, Edit3, Trash2, Plus, Users, MapPin, School, Printer, AlertTriangle } from 'lucide-react';

const ClassroomManager = () => {
    const [activeTab, setActiveTab] = useState('classes');
    const [classrooms, setClassrooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [activeYear, setActiveYear] = useState(null); // État pour l'année

    // 1. D'abord on récupère l'année active, puis les classes
    useEffect(() => {
        const initialize = async () => {
            try {
                const yearRes = await academicService.getActiveYear();
                const yearData = yearRes.data;
                setActiveYear(yearData);
                loadClassrooms(yearData?.id);
            } catch (error) {
                console.error("Erreur initialisation année active:", error);
                loadClassrooms(); // Fallback sans année
            }
        };

        if (activeTab === 'classes') {
            initialize();
        }
    }, [activeTab]);

    const loadClassrooms = async (yearId = null) => {
        try {
            // On utilise l'ID de l'année active pour le filtrage backend
            const response = await ClassroomService.getAll(yearId || activeYear?.id);
            setClassrooms(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des classes pédagogiques:", error);
        }
    };

    const handlePrint = () => { window.print(); };

    const handleToggle = async (id) => {
        try {
            await ClassroomService.toggleStatus(id);
            loadClassrooms();
        } catch (error) {
            alert("Erreur lors de la mise à jour du statut opérationnel.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe définitivement ?")) {
            try {
                await ClassroomService.delete(id);
                loadClassrooms();
            } catch (error) {
                alert("Erreur lors de la suppression de la classe.");
            }
        }
    };

    const handleEdit = (cls) => {
        setEditingClass(cls);
        setIsModalOpen(true);
    };

    const filteredClasses = classrooms.filter(c => 
        c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getProgressColor = (current, total) => {
        if (!total || total === 0) return 'bg-gray-200';
        const percentage = (current / total) * 100;
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 85) return 'bg-orange-500';
        return 'bg-[#2ECC71]';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="print:hidden">
                <div className="flex space-x-6 mb-8 border-b-2 border-gray-200">
                    <button onClick={() => setActiveTab('classes')}
                        className={`pb-3 px-6 font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'classes' ? 'border-b-4 border-[#2ECC71] text-[#0D1B3E]' : 'text-gray-400 hover:text-[#1E40AF]'}`}>
                        <School size={18} /> Classes Pédagogiques
                    </button>
                    <button onClick={() => setActiveTab('salles')}
                        className={`pb-3 px-6 font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'salles' ? 'border-b-4 border-[#1E40AF] text-[#0D1B3E]' : 'text-gray-400 hover:text-[#1E40AF]'}`}>
                        <MapPin size={18} /> Salles Physiques
                    </button>
                </div>

                {activeTab === 'classes' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Bannière Année Active pour information sans casser l'UI */}
                        {activeYear && (
                            <div className="px-4 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full w-fit uppercase tracking-widest border border-blue-100">
                                Session : {activeYear.name}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="relative w-full max-w-lg">
                                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                                <input type="text" placeholder="Rechercher une classe..." 
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-50 focus:border-[#1E40AF] outline-none transition-all text-[#0D1B3E]"
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={handlePrint} className="flex-1 md:flex-none bg-white border-2 border-gray-100 hover:border-blue-600 text-gray-600 hover:text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
                                    <Printer size={20} /> Imprimer
                                </button>
                                <button onClick={() => { setEditingClass(null); setIsModalOpen(true); }} className="flex-1 md:flex-none bg-[#2ECC71] hover:bg-[#27AE60] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95">
                                    <Plus size={20} /> Ouvrir une Classe
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClasses.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 italic text-gray-400">
                                    Aucun résultat trouvé.
                                </div>
                            ) : (
                                filteredClasses.map(cls => {
                                    const currentCount = cls.currentStudents || 0;
                                    const capacity = cls.capacity || 0;
                                    const isFull = currentCount >= capacity;

                                    return (
                                        <div key={cls.id} className="bg-white rounded-2xl border-b-4 border-[#1E40AF] shadow-sm hover:shadow-xl transition-all group overflow-hidden border-x border-t border-gray-100">
                                            <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-black text-[#0D1B3E] text-lg uppercase leading-tight group-hover:text-[#1E40AF] transition-colors">{cls.displayName}</h3>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase">
                                                        <span className={`w-2 h-2 rounded-full ${cls.active ? 'bg-[#2ECC71]' : 'bg-red-500'}`}></span>
                                                        <span className={cls.active ? 'text-[#2ECC71]' : 'text-red-500'}>{cls.active ? 'Opérationnel' : 'Hors-ligne'}</span>
                                                    </div>
                                                </div>
                                                <div className={`p-2.5 rounded-xl ${isFull ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#1E40AF]'}`}>
                                                    <Users size={20} />
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                                                    <MapPin size={16} className="text-gray-400"/>
                                                    <span>Local : <span className="text-[#0D1B3E]">{cls.roomName}</span></span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-gray-500 uppercase text-[10px]">Taux d'occupation</span>
                                                        <span className={isFull ? 'text-red-600' : 'text-[#0D1B3E]'}>
                                                            {currentCount} / {capacity} élèves
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                        <div className={`h-full transition-all duration-700 ease-out ${getProgressColor(currentCount, capacity)}`}
                                                            style={{ width: `${Math.min((currentCount / (capacity || 1)) * 100, 100)}%` }}></div>
                                                    </div>
                                                    {isFull && capacity > 0 && (
                                                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 uppercase animate-pulse">
                                                            <AlertTriangle size={12}/> Capacité maximale atteinte
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50/50 flex items-center gap-2 border-t border-gray-50">
                                                <button onClick={() => handleEdit(cls)} className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[#0D1B3E] hover:border-[#1E40AF] transition-all"><Edit3 size={16}/> Modifier</button>
                                                <button onClick={() => handleToggle(cls.id)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${cls.active ? 'text-red-500 bg-red-50' : 'text-[#2ECC71] bg-green-50'}`}>{cls.active ? 'Désactiver' : 'Activer'}</button>
                                                <button onClick={() => handleDelete(cls.id)} className="p-2.5 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <RoomManager />
                )}
            </div>

            {/* Version Impression */}
            <div className="hidden print:block">
                <div className="text-center border-b-4 border-blue-900 pb-4 mb-8">
                    <h1 className="text-3xl font-black text-blue-900">COMPLEXE SCOLAIRE MUSAFA</h1>
                    <p className="uppercase text-sm font-bold text-gray-600 tracking-widest">Répertoire Officiel des Classes Pédagogiques {activeYear ? `(${activeYear.name})` : ''}</p>
                </div>
                <table className="w-full border-collapse border-2 border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-3 text-center">N°</th>
                            <th className="border border-black p-3 text-left">DÉSIGNATION</th>
                            <th className="border border-black p-3 text-left">SALLE</th>
                            <th className="border border-black p-3 text-center">EFFECTIF ACTUEL</th>
                            <th className="border border-black p-3 text-center">CAPACITÉ MAX</th>
                            <th className="border border-black p-3 text-center">DISPONIBILITÉ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.map((cls, index) => (
                            <tr key={cls.id}>
                                <td className="border border-black p-2 text-center font-bold">{index + 1}</td>
                                <td className="border border-black p-2 font-black uppercase">{cls.displayName}</td>
                                <td className="border border-black p-2 uppercase">{cls.roomName}</td>
                                <td className="border border-black p-2 text-center font-bold">{cls.currentStudents || 0}</td>
                                <td className="border border-black p-2 text-center">{cls.capacity}</td>
                                <td className="border border-black p-2 text-center font-bold">
                                    {Math.max(0, (cls.capacity || 0) - (cls.currentStudents || 0))} places
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ClassroomForm 
                    initialData={editingClass}
                    onClose={() => { setIsModalOpen(false); setEditingClass(null); }} 
                    onSuccess={() => { loadClassrooms(); setIsModalOpen(false); setEditingClass(null); }} 
                />
            )}
        </div>
    );
};

export default ClassroomManager;