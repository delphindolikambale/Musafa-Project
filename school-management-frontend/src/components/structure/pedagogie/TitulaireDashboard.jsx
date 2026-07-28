import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ShieldCheck, 
    Calendar, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    FileText, 
    Loader2, 
    BookOpen,
    Eye,
    X,
    BellRing,
    Folder,
    Printer
} from 'lucide-react';
import titulaireService from '../../../services/pedagogieService/titulaireService';
import api from '../../../services/api';
import { websocketService } from '../../../services/websocketService';

const TitulaireDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // États de chargement et de données globales
    const [loading, setLoading] = useState(true);
    const [fetchingMatrix, setFetchingMatrix] = useState(false);
    const [fetchingFolders, setFetchingFolders] = useState(false);
    
    const [activeYear, setActiveYear] = useState(null);
    const [myClassrooms, setMyClassrooms] = useState([]);
    const [bulletinFolders, setBulletinFolders] = useState([]);
    
    // États de sélection
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(1);
    
    // Données de suivi (fiches)
    const [monitoringData, setMonitoringData] = useState(null);
    
    // Déclencheur pour rafraîchir les données via WebSocket
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const toastTimeoutRef = useRef(null);
    const [toastState, setToastState] = useState({
        show: false,
        message: '',
        type: 'info'
    });

    // Sécurisation de la récupération des données utilisateur
    const getUser = () => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : {};
        } catch (e) {
            console.error("Erreur de lecture du localStorage:", e);
            return {};
        }
    };
    
    const user = getUser();
    const teacherId = user.teacherId || user.id;
    const schoolId = user.schoolId || 1;

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.warn("L'autoplay audio a été bloqué par le navigateur:", e));
        } catch (error) {
            console.error("Erreur lors de la lecture du son :", error);
        }
    };

    const showToast = (message, type = 'info', duration = 6000) => {
        setToastState({ show: true, message, type });
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
            setToastState(prev => ({ ...prev, show: false }));
        }, duration);
    };

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    // 1. Initialisation : Récupération de l'année active et des classes du titulaire
    useEffect(() => {
        let isMounted = true;

        const initDashboard = async () => {
            setLoading(true);
            try {
                const yearRes = await api.get('/academic-years/active');
                if (yearRes.status === 200 && yearRes.data && isMounted) {
                    const currentYear = yearRes.data;
                    setActiveYear(currentYear);
                    
                    if (teacherId) {
                        const classesRes = await titulaireService.getMyClassrooms(teacherId, currentYear.id);
                        if (isMounted) {
                            setMyClassrooms(classesRes || []);
                            if (classesRes && classesRes.length > 0) {
                                setSelectedClassroom(classesRes[0]);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur d'initialisation de l'espace titulaire:", error);
                if (isMounted) showToast("Impossible de charger les données initiales.", "error");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initDashboard();
        return () => { isMounted = false; };
    }, [teacherId]);

    // 2. Récupération des DOSSIERS DE BULLETINS
    // Utilisation de activeYear?.id au lieu de activeYear pour éviter des re-rendus inutiles
    useEffect(() => {
        let isMounted = true;

        const fetchFolders = async () => {
            if (!activeYear?.id || !teacherId || !schoolId) return;
            
            setFetchingFolders(true);
            try {
                const foldersRes = await titulaireService.getBulletinFolders(teacherId, activeYear.id, schoolId);
                if (isMounted) {
                    setBulletinFolders(foldersRes || []);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des dossiers:", error);
                if (isMounted) showToast("Erreur lors de la récupération des dossiers de bulletins.", "error");
            } finally {
                if (isMounted) setFetchingFolders(false);
            }
        };

        fetchFolders();
        return () => { isMounted = false; };
    }, [activeYear?.id, teacherId, schoolId, refreshTrigger]);

    // 3. Récupération de la MATRICE DE SUIVI des fiches de cotes
    useEffect(() => {
        let isMounted = true;

        const fetchMonitoring = async () => {
            if (!selectedClassroom?.id || !activeYear?.id) return;
            
            setFetchingMatrix(true);
            try {
                const data = await titulaireService.getMonitoring(
                    selectedClassroom.id, 
                    selectedPeriod, 
                    activeYear.id
                );
                if (isMounted) setMonitoringData(data);
            } catch (error) {
                console.error("Erreur lors du chargement du suivi:", error);
                if (isMounted) {
                    setMonitoringData(null);
                    showToast("Erreur lors de la récupération de la matrice de suivi.", "error");
                }
            } finally {
                if (isMounted) setFetchingMatrix(false);
            }
        };

        fetchMonitoring();
        return () => { isMounted = false; };
    }, [selectedClassroom?.id, selectedPeriod, activeYear?.id, refreshTrigger]);

    // 4. Configuration WebSocket pour le rafraîchissement en temps réel
    useEffect(() => {
        if (!teacherId || !schoolId) return;

        const topic = `/topic/bulletins/titulaire/${schoolId}/${teacherId}`;

        const handleWebSocketMessage = (data) => {
            let messageAffiche = "Nouveau message concernant les bulletins.";
            if (data && data.message) {
                messageAffiche = data.message;
            } else if (typeof data === 'string') {
                messageAffiche = data;
            }

            playNotificationSound();
            showToast(messageAffiche, 'info');
            setRefreshTrigger(prev => prev + 1);
        };

        websocketService.subscribeToTopic(topic, handleWebSocketMessage);

        return () => {
            websocketService.unsubscribeFromTopic(topic, handleWebSocketMessage);
        };
    }, [teacherId, schoolId]);

    // 5. Gestion du state de navigation
    useEffect(() => {
        if (location.state && location.state.action === 'bulletins_generated') {
            showToast("Nouveaux bulletins générés. Actualisation en cours...", "info");
            setRefreshTrigger(prev => prev + 1);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // Utilitaires d'affichage
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
            default:
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

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-600 mb-4 mx-auto" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Vérification de vos classes...</p>
                </div>
            </div>
        );
    }

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
                    </p>
                </div>
            </div>
        );
    }

    const currentClassroomFolders = bulletinFolders
        .filter(f => f.classroomId === selectedClassroom?.id)
        .sort((a, b) => a.period - b.period);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* NOTIFICATION VISUELLE (TOAST) */}
            {toastState.show && (
                <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className={`bg-white dark:bg-slate-800 border-l-4 shadow-xl rounded-xl p-4 flex items-start gap-4 w-80 ${
                        toastState.type === 'error' ? 'border-red-500' : 'border-blue-500'
                    }`}>
                        <div className={`p-2.5 rounded-full shrink-0 ${
                            toastState.type === 'error' 
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                        }`}>
                            {toastState.type === 'error' ? <AlertCircle size={20} /> : <BellRing size={20} className="animate-pulse" />}
                        </div>
                        <div className="flex-1 mt-0.5">
                            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1">
                                {toastState.type === 'error' ? 'Erreur Système' : 'Notification Fiches'}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                {toastState.message}
                            </p>
                        </div>
                        <button 
                            onClick={() => setToastState({show: false, message: '', type: 'info'})} 
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-0.5"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

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
                                Validation des fiches et gestion des dossiers
                            </p>
                        </div>
                    </div>
                </div>

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
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                                } border border-transparent`}
                            >
                                {cls.displayName || cls.name}
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
                                        ? 'bg-slate-800 text-white shadow-md' 
                                        : 'bg-white text-slate-600 hover:bg-slate-200'
                                } border border-transparent`}
                            >
                                P{p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* INTERFACE : DOSSIERS DES BULLETINS */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 px-2">
                    <Folder className="text-blue-500" size={24} /> 
                    Dossiers de Bulletins Disponibles
                    {fetchingFolders && <Loader2 className="animate-spin text-blue-500 ml-2" size={16} />}
                </h2>
                
                {currentClassroomFolders.length > 0 && selectedClassroom ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentClassroomFolders.map(folder => (
                            <div key={folder.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative hover:shadow-md transition-shadow group flex flex-col justify-between min-h-[220px]">
                                
                                <div className="absolute top-6 right-6 bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase px-3 py-1.5 rounded-lg tracking-wider border border-slate-100 dark:border-slate-700">
                                    DOSSIER OFFICIEL
                                </div>

                                <div>
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Folder size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                                        Bulletins : {folder.classroomName || selectedClassroom.displayName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                                        <FileText size={16} className="text-slate-400" />
                                        <span>Période {folder.period} • Généré par le Proviseur</span>
                                    </div>
                                    {folder.date && (
                                        <div className="mt-1 text-xs text-slate-400 font-medium">
                                            Le {formatDate(folder.date)}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button 
                                        onClick={() => navigate(`/enseignant/titulaire/bulletins/${folder.classroomId}`, { state: { period: folder.period, folderId: folder.id } })}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase transition-colors"
                                    >
                                        <Printer size={16} /> Consulter / Imprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-70">
                        <Folder size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">
                            Aucun dossier de bulletins généré pour cette classe
                        </p>
                        <p className="text-slate-400 text-xs mt-2 max-w-md">
                            Une fois que vous aurez validé toutes les fiches, le Proviseur pourra générer le dossier des bulletins. Il apparaîtra automatiquement ici.
                        </p>
                    </div>
                )}
            </div>

            {/* TABLEAU DE SUIVI DES FICHES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative min-h-[400px]">
                
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="text-emerald-500" size={24} /> 
                        État d'avancement des fiches de cotes (P{selectedPeriod})
                    </h3>
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
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Date Soumission</th>
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