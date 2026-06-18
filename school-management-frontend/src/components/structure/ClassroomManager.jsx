import React, { useState, useEffect } from 'react';
import { ClassroomService } from '../../services/classroomService';
import academicService from '../../services/academicYearService'; 
import ClassroomForm from './ClassroomForm';
import RoomManager from './RoomManager';
import { 
    Search, Edit3, Trash2, Plus, Users, MapPin, School, 
    Printer, AlertTriangle, Moon, Sun, Info, HelpCircle, 
    CheckCircle, XCircle, RefreshCw 
} from 'lucide-react';

const ClassroomManager = () => {
    const [activeTab, setActiveTab] = useState('classes');
    const [classrooms, setClassrooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [activeYear, setActiveYear] = useState(null); 
    
    // Mode Sombre / Clair
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') || false;
    });

    // Boîte de dialogue informative personnalisée globale
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        type: 'info', // 'info' | 'success' | 'error' | 'confirm'
        title: '',
        message: '',
        onConfirm: null,
        loading: false
    });

    // Gestion du thème dark/light
    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        }
    };

    // Déclencheur boîte de dialogue personnalisée
    const showDialog = (type, title, message, onConfirm = null) => {
        setDialogConfig({
            isOpen: true,
            type,
            title,
            message,
            onConfirm,
            loading: false
        });
    };

    const closeDialog = () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                const yearRes = await academicService.getActiveYear();
                const yearData = yearRes.data;
                setActiveYear(yearData);
                loadClassrooms(yearData?.id);
            } catch (error) {
                console.error("Erreur initialisation année active:", error);
                loadClassrooms(); 
                showDialog('error', 'Erreur de Synchronisation', "Impossible de charger l'année académique active.");
            }
        };

        if (activeTab === 'classes') {
            initialize();
        }
    }, [activeTab]);

    const loadClassrooms = async (yearId = null) => {
        try {
            const response = await ClassroomService.getAll(yearId || activeYear?.id);
            setClassrooms(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des classes pédagogiques:", error);
            showDialog('error', 'Récupération impossible', error.response?.data?.message || "Erreur de chargement des classes depuis le serveur distant.");
        }
    };

    const handlePrint = () => { window.print(); };

    const handleToggle = async (id) => {
        try {
            await ClassroomService.toggleStatus(id);
            loadClassrooms();
            showDialog('success', 'Statut Mis à Jour', 'Le statut opérationnel de la classe a été modifié.');
        } catch (error) {
            showDialog('error', 'Action Interrompue', error.response?.data?.message || "Erreur réseau lors de la modification du statut.");
        }
    };

    const handleDelete = (id) => {
        showDialog(
            'confirm',
            'Demande de Suppression',
            'Êtes-vous absolument sûr de vouloir supprimer cette classe définitivement ? Cette action videra les affectations liées.',
            async () => {
                setDialogConfig(prev => ({ ...prev, loading: true }));
                try {
                    await ClassroomService.delete(id);
                    loadClassrooms();
                    closeDialog();
                    // Ré-ouvrir en succès bref
                    setTimeout(() => {
                        showDialog('success', 'Classe supprimée', 'La suppression définitive a été exécutée avec succès.');
                    }, 300);
                } catch (error) {
                    closeDialog();
                    setTimeout(() => {
                        showDialog('error', 'Échec de Suppression', error.response?.data?.message || "Le backend a refusé la suppression de la classe.");
                    }, 300);
                }
            }
        );
    };

    const handleEdit = (cls) => {
        setEditingClass(cls);
        setIsModalOpen(true);
    };

    // --- ALGORITHME DE TRI PÉDAGOGIQUE ET STRUCTURÉ DES CLASSES ---
    const sortClassrooms = (list) => {
        return [...list].sort((a, b) => {
            const nameA = a.displayName ? a.displayName.toLowerCase().trim() : '';
            const nameB = b.displayName ? b.displayName.toLowerCase().trim() : '';

            // Détection du type (Éducation de Base vs Humanités/Secondaire)
            const isBaseA = nameA.includes('7è') || nameA.includes('7i') || nameA.includes('8è') || nameA.includes('8i');
            const isBaseB = nameB.includes('7è') || nameB.includes('7i') || nameB.includes('8è') || nameB.includes('8i');

            // RÈGLE 1 : Éducation de Base d'abord
            if (isBaseA && !isBaseB) return -1;
            if (!isBaseA && isBaseB) return 1;

            // RÈGLE 2 : Si les deux sont en Éducation de base, trier par niveau (7ème avant 8ème)
            if (isBaseA && isBaseB) {
                const numA = nameA.includes('7') ? 7 : 8;
                const numB = nameB.includes('7') ? 7 : 8;
                if (numA !== numB) return numA - numB;
            }

            // RÈGLE 3 : Si ce sont des humanités (1ère à 4ème)
            const humLevelA = nameA.match(/(\d+)\s*(è|e|i)/);
            const humLevelB = nameB.match(/(\d+)\s*(è|e|i)/);
            
            if (humLevelA && humLevelB && !isBaseA && !isBaseB) {
                const valA = parseInt(humLevelA[1]);
                const valB = parseInt(humLevelB[1]);
                if (valA !== valB) return valA - valB;
            }

            // RÈGLE 4 : Tri subsidiaire par ordre alphabétique complet (Options, Divisions)
            return nameA.localeCompare(nameB);
        });
    };

    const filteredClasses = sortClassrooms(
        classrooms.filter(c => 
            c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getProgressColor = (current, total) => {
        if (!total || total === 0) return 'bg-gray-200';
        const percentage = (current / total) * 100;
        if (percentage >= 100) return 'bg-rose-500';
        if (percentage >= 85) return 'bg-amber-500';
        return 'bg-[#2ECC71]';
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-[#0F172A] min-h-screen text-[#0D1B3E] dark:text-gray-100 transition-colors duration-200">
            <div className="print:hidden">
                
                {/* Barre Supérieure d'outils généraux */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#0D1B3E] text-white rounded-xl dark:bg-slate-800">
                            <School size={22}/>
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight">Complexe Scolaire Musafa</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Panneau de Contrôle Pédagogique</p>
                        </div>
                    </div>
                    
                    {/* Sélecteur de Thème */}
                    <button 
                        onClick={toggleTheme}
                        className="p-3 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-amber-400 rounded-xl hover:scale-105 transition-all shadow-sm"
                        title="Basculer le mode d'affichage"
                    >
                        {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
                    </button>
                </div>

                {/* Onglets de Navigation */}
                <div className="flex space-x-2 sm:space-x-6 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('classes')}
                        className={`pb-3 px-3 sm:px-6 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'classes' ? 'border-b-4 border-[#2ECC71] text-[#0D1B3E] dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-[#1E40AF]'}`}>
                        <School size={16} /> Classes Pédagogiques
                    </button>
                    <button onClick={() => setActiveTab('salles')}
                        className={`pb-3 px-3 sm:px-6 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'salles' ? 'border-b-4 border-[#1E40AF] text-[#0D1B3E] dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-[#1E40AF]'}`}>
                        <MapPin size={16} /> Salles Physiques
                    </button>
                </div>

                {activeTab === 'classes' ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        
                        {/* Indicateur d'Année Académique */}
                        {activeYear && (
                            <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full w-fit uppercase tracking-widest border border-blue-100 dark:border-blue-900/40">
                                Session En Cours : {activeYear.name}
                            </div>
                        )}

                        {/* Barre d'action & Recherche (Responsive corrigé) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            
                            {/* Input de Recherche */}
                            <div className="relative lg:col-span-6 xl:col-span-7 w-full">
                                <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher une classe (Ex: 7ème, Commerciale, Local...)" 
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-100 dark:border-gray-700 focus:border-[#1E40AF] dark:focus:border-blue-500 outline-none transition-all text-[#0D1B3E] dark:text-gray-100 text-sm"
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            
                            {/* Bloc boutons - Largeur optimisée pour éviter le débordement */}
                            <div className="grid grid-cols-2 lg:col-span-6 xl:col-span-5 gap-3 w-full">
                                <button 
                                    onClick={handlePrint} 
                                    className="bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 hover:border-blue-600 text-gray-600 dark:text-gray-300 px-3 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
                                Mention="Imprimer">
                                    <Printer size={16} /> Imprimer
                                </button>
                                <button 
                                    onClick={() => { setEditingClass(null); setIsModalOpen(true); }} 
                                    className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-3 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-green-100 dark:shadow-none transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap min-w-max"
                                >
                                    <Plus size={16} className="shrink-0" /> <span>Ouvrir une Nouvelle Classe</span>
                                </button>
                            </div>
                        </div>

                        {/* Grille de Cartes Organisée par Tri Éducatif */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClasses.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white dark:bg-[#1E293B] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 italic text-gray-400">
                                    Aucune classe pédagogique disponible ou trouvée.
                                </div>
                            ) : (
                                filteredClasses.map(cls => {
                                    const currentCount = cls.currentStudents || 0;
                                    const capacity = cls.capacity || 0;
                                    const isFull = currentCount >= capacity;

                                    return (
                                        <div 
                                            key={cls.id} 
                                            className="bg-white dark:bg-[#1E293B] rounded-2xl border-b-4 border-[#1E40AF] dark:border-blue-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all group overflow-hidden border-x border-t border-gray-100 dark:border-gray-800 flex flex-col justify-between"
                                        >
                                            {/* Haut de la Carte */}
                                            <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-start gap-2">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                                                        {cls.displayName?.includes('7') || cls.displayName?.includes('8') ? 'Éducation de Base' : 'Humanités Secondary'}
                                                    </span>
                                                    <h3 className="font-black text-[#0D1B3E] dark:text-gray-100 text-lg uppercase leading-tight group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors mt-0.5">
                                                        {cls.displayName}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold uppercase">
                                                        <span className={`w-2 h-2 rounded-full ${cls.active ? 'bg-[#2ECC71]' : 'bg-rose-500'}`}></span>
                                                        <span className={cls.active ? 'text-[#2ECC71]' : 'text-rose-500'}>
                                                            {cls.active ? 'Opérationnel' : 'Désactivé'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`p-2.5 rounded-xl shrink-0 ${isFull ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' : 'bg-blue-50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-400'}`}>
                                                    <Users size={18} />
                                                </div>
                                            </div>

                                            {/* Corps de la Carte */}
                                            <div className="p-5 space-y-4 flex-grow">
                                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                    <MapPin size={15} className="text-gray-400 shrink-0"/>
                                                    <span>Local : <span className="text-[#0D1B3E] dark:text-gray-100 font-bold">{cls.roomName}</span></span>
                                                </div>
                                                
                                                {/* Jauge d'occupation */}
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center text-xs font-bold">
                                                        <span className="text-gray-400 dark:text-gray-500 uppercase text-[9px] tracking-wider">Effectif inscrit</span>
                                                        <span className={isFull ? 'text-rose-600 font-extrabold' : 'text-[#0D1B3E] dark:text-gray-200'}>
                                                            {currentCount} / {capacity} Élèves
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ease-out ${getProgressColor(currentCount, capacity)}`}
                                                            style={{ width: `${Math.min((currentCount / (capacity || 1)) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    {isFull && capacity > 0 && (
                                                        <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 uppercase animate-pulse pt-0.5">
                                                            <AlertTriangle size={11}/> Capacité maximale atteinte
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions de la Carte */}
                                            <div className="p-4 bg-gray-50 dark:bg-[#1E293B]/40 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800">
                                                <button 
                                                    onClick={() => handleEdit(cls)} 
                                                    className="flex-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#0D1B3E] dark:text-gray-200 hover:border-[#1E40AF] dark:hover:border-blue-500 transition-all shadow-sm"
                                                >
                                                    <Edit3 size={14}/> Modifier
                                                </button>
                                                <button 
                                                    onClick={() => handleToggle(cls.id)} 
                                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${cls.active ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/20' : 'text-[#2ECC71] bg-emerald-50 dark:bg-emerald-950/20'}`}
                                                >
                                                    {cls.active ? 'Désactiver' : 'Activer'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cls.id)} 
                                                    className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                    title="Supprimer définitivement"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
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

            {/* Fichier de Style Impression Clean & Officiel */}
            <div className="hidden print:block bg-white text-black p-2">
                <div className="text-center border-b-4 border-black pb-3 mb-6">
                    <h1 className="text-2xl font-black tracking-tight">COMPLEXE SCOLAIRE MUSAFA</h1>
                    <p className="uppercase text-xs font-bold text-gray-700 tracking-widest mt-1">
                        Répertoire Officiel des Classes Pédagogiques {activeYear ? `(${activeYear.name})` : ''}
                    </p>
                </div>
                <table className="w-full border-collapse border-2 border-black text-[11px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-center font-bold">N°</th>
                            <th className="border border-black p-2 text-left">DÉSIGNATION CLASSE</th>
                            <th className="border border-black p-2 text-left">SALLE PHYSIQUE</th>
                            <th className="border border-black p-2 text-center">EFFECTIF INSCRIT</th>
                            <th className="border border-black p-2 text-center">CAPACITÉ MAX</th>
                            <th className="border border-black p-2 text-center">PLACES DISPONIBLES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.map((cls, index) => (
                            <tr key={cls.id} className="odd:bg-gray-50/50">
                                <td className="border border-black p-2 text-center font-bold">{index + 1}</td>
                                <td className="border border-black p-2 font-bold uppercase">{cls.displayName}</td>
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

            {/* Boîte de Dialogue Informative Intelligente & Générique */}
            {dialogConfig.isOpen && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-200">
                        
                        {/* Icônes adaptatives */}
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                            {dialogConfig.type === 'success' && <CheckCircle className="text-emerald-500 h-12 w-12" />}
                            {dialogConfig.type === 'error' && <XCircle className="text-rose-500 h-12 w-12" />}
                            {dialogConfig.type === 'info' && <Info className="text-blue-500 h-12 w-12" />}
                            {dialogConfig.type === 'confirm' && <HelpCircle className="text-amber-500 h-12 w-12" />}
                        </div>

                        <h3 className="text-lg font-black text-[#0D1B3E] dark:text-gray-100 uppercase tracking-tight">
                            {dialogConfig.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                            {dialogConfig.message}
                        </p>

                        {/* Pied d'action dynamique */}
                        <div className="mt-6 flex justify-center gap-3">
                            {dialogConfig.type === 'confirm' ? (
                                <>
                                    <button
                                        type="button"
                                        disabled={dialogConfig.loading}
                                        onClick={closeDialog}
                                        className="px-4 py-2 bg-gray-100 dark:bg-[#334155] text-gray-500 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        disabled={dialogConfig.loading}
                                        onClick={dialogConfig.onConfirm}
                                        className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
                                    >
                                        {dialogConfig.loading ? <RefreshCw className="animate-spin" size={12}/> : 'Confirmer'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="px-6 py-2 bg-[#0D1B3E] dark:bg-blue-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    D'accord
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Formulaire Modal de modification / insertion */}
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