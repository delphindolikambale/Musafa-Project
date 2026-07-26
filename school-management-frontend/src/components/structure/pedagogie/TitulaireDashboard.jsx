import React, { useState, useEffect, useRef } from 'react';
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
    X,
    XCircle,
    AlertTriangle,
    BellRing,
    Folder,
    Printer
} from 'lucide-react';
import titulaireService from '../../../services/pedagogieService/titulaireService';
import api from '../../../services/api';
import { websocketService } from '../../../services/websocketService';

const TitulaireDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [fetchingMatrix, setFetchingMatrix] = useState(false);
    const [activeYear, setActiveYear] = useState(null);
    const [myClassrooms, setMyClassrooms] = useState([]);
    
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(1);
    const [monitoringData, setMonitoringData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const toastTimeoutRef = useRef(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'confirm', 
        title: '',
        message: ''
    });

    const [toastState, setToastState] = useState({
        show: false,
        message: '',
        type: 'info'
    });

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch (e) {
            return {};
        }
    };
    const user = getUser();

    // Fonction pour jouer le son de notification
    const playNotificationSound = () => {
        try {
            // Assurez-vous d'avoir un fichier audio à cet emplacement dans votre dossier public
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

    useEffect(() => {
        let isMounted = true;

        const initDashboard = async () => {
            setLoading(true);
            try {
                const yearRes = await api.get('/academic-years/active');
                if (yearRes.status === 200 && yearRes.data && isMounted) {
                    const currentYear = yearRes.data;
                    setActiveYear(currentYear);

                    const teacherId = user.teacherId || user.id;
                    
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
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchMonitoring = async () => {
            if (!selectedClassroom || !activeYear) return;
            
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
    }, [selectedClassroom, selectedPeriod, activeYear, refreshTrigger]);

    useEffect(() => {
        const teacherId = user.teacherId || user.id;
        const schoolId = user.schoolId || 1; 

        if (!teacherId || !schoolId) return;

        const topic = `/topic/bulletins/titulaire/${schoolId}/${teacherId}`;

        const handleWebSocketMessage = (data) => {
            let messageAffiche = "Nouveau message concernant les bulletins.";
            if (data && data.message) {
                messageAffiche = data.message;
            } else if (typeof data === 'string') {
                messageAffiche = data;
            }

            // DÉCLENCHEMENT DU SON ET DE LA NOTIFICATION VISUELLE
            playNotificationSound();
            showToast(messageAffiche, 'info');
            setRefreshTrigger(prev => prev + 1);
        };

        websocketService.subscribeToTopic(topic, handleWebSocketMessage);

        return () => {
            websocketService.unsubscribeFromTopic(topic, handleWebSocketMessage);
        };
    }, []);

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

    const triggerGenerateBulletins = () => {
        if (!monitoringData?.readyForBulletinGeneration) return;
        
        setModalState({
            isOpen: true,
            type: 'confirm',
            title: 'Génération des Bulletins',
            message: `Êtes-vous sûr de vouloir générer et clôturer les bulletins pour la classe ${selectedClassroom.displayName} à la Période ${selectedPeriod} ? Cette action calculera les totaux et figera les cotes pour cette période.`
        });
    };

    const confirmGeneration = async () => {
        setIsGenerating(true);
        setModalState(prev => ({ ...prev, isOpen: false })); 

        try {
            await titulaireService.generateBulletins(
                selectedClassroom.id, 
                selectedPeriod, 
                activeYear.id
            );
            
            const data = await titulaireService.getMonitoring(
                selectedClassroom.id, 
                selectedPeriod, 
                activeYear.id
            );
            setMonitoringData(data);

            setModalState({
                isOpen: true,
                type: 'success',
                title: 'Génération Réussie',
                message: `Les bulletins de la classe ${selectedClassroom.displayName} pour la Période ${selectedPeriod} ont été générés avec succès.`
            });
        } catch (error) {
            console.error("Erreur lors de la génération des bulletins:", error);
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Échec de la Génération',
                message: "Un problème est survenu lors de la génération des bulletins. Veuillez vérifier que toutes les fiches sont validées ou contacter l'assistance."
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
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
                                Gérez la centralisation des notes
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

            {/* NOUVELLE INTERFACE : DOSSIER DES BULLETINS (Inspirée des visuels Préfet) */}
            {(monitoringData?.bulletinsGenerated || monitoringData?.bulletinsReady || monitoringData?.hasBulletins) && selectedClassroom && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 px-2">
                        <Folder className="text-blue-500" size={24} /> Archives & Dossiers
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Carte Dossier structurée comme sur l'interface Préfet */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative hover:shadow-md transition-shadow group flex flex-col justify-between min-h-[220px]">
                            
                            <div className="absolute top-6 right-6 bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase px-3 py-1.5 rounded-lg tracking-wider border border-slate-100 dark:border-slate-700">
                                DOSSIER
                            </div>

                            <div>
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Folder size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                                    Bulletins : {selectedClassroom.displayName}
                                </h3>
                                <div className="flex items-center gap-2 mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                                    <FileText size={16} className="text-slate-400" />
                                    <span>Période {selectedPeriod} clôturée</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={() => navigate(`/enseignant/titulaire/bulletins/${selectedClassroom.id}`)}
                                    className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase transition-colors"
                                >
                                    <Printer size={16} /> Imprimer / Ouvrir
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* TABLEAU DE SUIVI DES FICHES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative min-h-[400px]">
                
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="text-emerald-500" size={24} /> 
                        État d'avancement des fiches de cotes
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <button 
                            onClick={triggerGenerateBulletins}
                            disabled={!monitoringData?.readyForBulletinGeneration || isGenerating}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-lg ${
                                monitoringData?.readyForBulletinGeneration && !isGenerating
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/20 hover:scale-105' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : (monitoringData?.readyForBulletinGeneration ? <PlayCircle size={18} /> : <AlertCircle size={18} />)}
                            Générer les Bulletins (P{selectedPeriod})
                        </button>
                    </div>
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

            {/* MODALE DE CONFIRMATION DE GÉNÉRATION */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        
                        <div className={`p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 ${
                            modalState.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                            modalState.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 
                            'bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                            {modalState.type === 'confirm' && <AlertTriangle className="text-blue-600 dark:text-blue-400" size={24} />}
                            {modalState.type === 'success' && <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />}
                            {modalState.type === 'error' && <XCircle className="text-red-600 dark:text-red-400" size={24} />}
                            
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                {modalState.title}
                            </h3>
                            
                            <button onClick={closeModal} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                {modalState.message}
                            </p>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/60 flex justify-end gap-3">
                            {modalState.type === 'confirm' ? (
                                <>
                                    <button 
                                        onClick={closeModal}
                                        className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        onClick={confirmGeneration}
                                        className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                                    >
                                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                                        Oui, Générer
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl shadow-sm transition-colors"
                                >
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TitulaireDashboard;