import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    Calendar, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    FileText, 
    Loader2, 
    PlayCircle,
    BookOpen,
    Eye,
    ChevronRight
} from 'lucide-react';
import titulaireService from '../../../services/pedagogieService/titulaireService';
import api from '../../../services/api';

const TitulaireDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [fetchingMatrix, setFetchingMatrix] = useState(false);
    const [activeYear, setActiveYear] = useState(null);
    const [myClassrooms, setMyClassrooms] = useState([]);
    
    // Filtres sélectionnés
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(1);
    
    // Données de suivi (La matrice)
    const [monitoringData, setMonitoringData] = useState(null);

    // Utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // 1. Initialisation : Charger l'année active et les classes du titulaire
    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            try {
                // Récupérer l'année active
                const yearRes = await api.get('/academic-years/active');
                if (yearRes.status === 200 && yearRes.data) {
                    const currentYear = yearRes.data;
                    setActiveYear(currentYear);

                    // CORRECTION : Alignement avec App.jsx pour cibler l'ID Enseignant réel
                    const teacherId = user.teacherId || user.id;
                    
                    if (teacherId) {
                        const classesRes = await titulaireService.getMyClassrooms(teacherId, currentYear.id);
                        setMyClassrooms(classesRes || []);
                        
                        if (classesRes && classesRes.length > 0) {
                            setSelectedClassroom(classesRes[0]); // Sélection par défaut de la première classe trouvée
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur d'initialisation de l'espace titulaire:", error);
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, []);

    // 2. Recharger la matrice lorsque la classe ou la période change
    useEffect(() => {
        const fetchMonitoring = async () => {
            if (!selectedClassroom || !activeYear) return;
            
            setFetchingMatrix(true);
            try {
                const data = await titulaireService.getMonitoring(
                    selectedClassroom.id, 
                    selectedPeriod, 
                    activeYear.id
                );
                setMonitoringData(data);
            } catch (error) {
                console.error("Erreur lors du chargement du suivi:", error);
                setMonitoringData(null);
            } finally {
                setFetchingMatrix(false);
            }
        };

        fetchMonitoring();
    }, [selectedClassroom, selectedPeriod, activeYear]);

    // Formatage visuel des statuts
    const getStatusBadge = (status) => {
        switch (status) {
            case 'VALIDATED_BY_PROVISEUR':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-black uppercase">
                        <Clock size={14} /> Reçu (À Valider)
                    </span>
                );
            case 'VALIDATED_BY_TITULAIRE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-black uppercase">
                        <CheckCircle size={14} /> Validé au Bulletin
                    </span>
                );
            case 'EN_ATTENTE_VISA':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-black uppercase">
                        <Clock size={14} /> Chez le Proviseur
                    </span>
                );
            default: // DRAFT ou autre
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-black uppercase">
                        <AlertCircle size={14} /> Non soumis
                    </span>
                );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "---";
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const handleGenerateBulletins = () => {
        if (!monitoringData?.readyForBulletinGeneration) return;
        
        // Logique future : Appel au backend pour générer et clôturer les bulletins
        alert(`Génération des bulletins en cours pour la classe ${selectedClassroom.displayName} (Période ${selectedPeriod})...\n\nCette action sera connectée au futur BulletinService.`);
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-600 mb-4 mx-auto" size={48} />
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Vérification de vos classes...</p>
                </div>
            </div>
        );
    }

    // Vue si l'enseignant n'est titulaire d'aucune classe
    if (myClassrooms.length === 0) {
        return (
            <div className="p-6 h-[80vh] flex items-center justify-center">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-sm border border-slate-100 dark:border-slate-800 text-center max-w-lg">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Accès Restreint</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Vous n'êtes actuellement désigné(e) comme titulaire d'aucune classe pour l'année scolaire active. 
                        Veuillez contacter le Proviseur si cela est une erreur.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* EN-TÊTE ET FILTRES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Supervision Titulaire</h1>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Gérez la centralisation des notes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barre de filtres */}
                <div className="flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Classe :</span>
                        {myClassrooms.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClassroom(cls)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                                    selectedClassroom?.id === cls.id 
                                        ? 'bg-emerald-600 text-white shadow-md' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                                } border border-transparent dark:border-slate-700`}
                            >
                                {cls.displayName}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <Calendar size={14} /> Période :
                        </span>
                        {[1, 2, 3, 4].map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedPeriod(p)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                                    selectedPeriod === p 
                                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                } border border-transparent dark:border-slate-700`}
                            >
                                P{p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MATRICE DE SUIVI */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative min-h-[400px]">
                
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="text-emerald-500" size={24} /> 
                        État d'avancement des fiches de cotes
                    </h3>

                    {/* Bouton d'action principal conditionné par le backend */}
                    <button 
                        onClick={handleGenerateBulletins}
                        disabled={!monitoringData?.readyForBulletinGeneration}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-lg ${
                            monitoringData?.readyForBulletinGeneration 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/20 hover:scale-105' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {monitoringData?.readyForBulletinGeneration ? <PlayCircle size={18} /> : <AlertCircle size={18} />}
                        Générer les Bulletins (P{selectedPeriod})
                    </button>
                </div>

                {fetchingMatrix ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-emerald-600" size={40} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {monitoringData && monitoringData.subjects && monitoringData.subjects.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">N°</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Matière</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Enseignant</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Statut Fiche</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Date Validation</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monitoringData.subjects.map((subject, index) => (
                                        <tr key={subject.teacherAssignmentId} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-4 text-sm font-bold text-slate-500">{index + 1}</td>
                                            <td className="py-4 px-4 text-sm font-black text-slate-700 dark:text-slate-200">{subject.subjectName}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-slate-500 dark:text-slate-400">{subject.teacherName}</td>
                                            <td className="py-4 px-4 text-center">{getStatusBadge(subject.status)}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-slate-400 text-right">
                                                {formatDate(subject.validationDate || subject.submissionDate)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {subject.status === 'VALIDATED_BY_PROVISEUR' ? (
                                                    <button 
                                                        onClick={() => navigate(`/enseignant/titulaire/validation-fiche/${subject.teacherAssignmentId}/${selectedPeriod}`)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-black uppercase transition-colors"
                                                    >
                                                        <Eye size={14} /> Examiner & Valider
                                                    </button>
                                                ) : subject.status === 'VALIDATED_BY_TITULAIRE' ? (
                                                    <button 
                                                        onClick={() => navigate(`/enseignant/titulaire/validation-fiche/${subject.teacherAssignmentId}/${selectedPeriod}`)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase transition-colors"
                                                    >
                                                        <FileText size={14} /> Consulter
                                                    </button>
                                                ) : (
                                                    <button 
                                                        disabled
                                                        className="inline-flex items-center gap-1 px-4 py-2 bg-slate-50 text-slate-400 dark:bg-slate-800/30 dark:text-slate-600 rounded-xl text-xs font-black uppercase cursor-not-allowed"
                                                    >
                                                        Indisponible
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <BookOpen size={48} className="text-slate-300 mb-4" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Aucune matière configurée pour cette classe</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TitulaireDashboard;