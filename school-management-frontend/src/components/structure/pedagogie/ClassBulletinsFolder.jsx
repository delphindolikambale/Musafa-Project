import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FolderOpen, 
    ArrowLeft, 
    Search, 
    FileText, 
    CheckCircle, 
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '../../../services/api';

const ClassBulletinsFolder = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [classroomName, setClassroomName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [wsConnected, setWsConnected] = useState(false);

    // Encapsulation dans useCallback pour pouvoir l'appeler depuis le WebSocket
    const fetchBulletinsData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Récupération du nom et détails de la classe de manière dynamique
            const classroomRes = await api.get(`/classrooms/${classroomId}`);
            if (classroomRes.status === 200 && classroomRes.data) {
                setClassroomName(classroomRes.data.displayName || classroomRes.data.name || "Classe");
            }

            // 2. Récupération des élèves ayant des bulletins générés pour cette classe (Correction de la route backend)
            const response = await api.get(`/bulletins/titulaire/folders/${classroomId}/students`);
            if (response.status === 200 && response.data) {
                setStudents(response.data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du dossier des bulletins :", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [classroomId]);

    // Chargement initial
    useEffect(() => {
        if (classroomId) {
            fetchBulletinsData();
        }
    }, [classroomId, fetchBulletinsData]);

    // Connexion WebSocket pour la réception en temps réel depuis le Proviseur
    useEffect(() => {
        if (!classroomId) return;

        // Ajustez l'URL selon la configuration exacte de votre backend Spring Boot
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//localhost:8080/ws/bulletins`; 
        let ws;

        const connectWebSocket = () => {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket connecté pour les notifications du Proviseur.");
                setWsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Logique : Si le Proviseur envoie les bulletins et que ça concerne cette classe
                    if (data.type === 'BULLETINS_DISPATCHED' && String(data.classroomId) === String(classroomId)) {
                        console.log("Bulletins reçus ! Mise à jour automatique du dossier...");
                        fetchBulletinsData();
                    }
                } catch (error) {
                    console.error("Erreur de parsing des données WebSocket:", error);
                }
            };

            ws.onclose = () => {
                console.log("WebSocket déconnecté. Tentative de reconnexion...");
                setWsConnected(false);
                // Reconnexion automatique après 5 secondes en cas de coupure réseau
                setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [classroomId, fetchBulletinsData]);

    const filteredStudents = students.filter(student => 
        `${student.firstName} ${student.lastName} ${student.surname || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFullName = (student) => `${student.lastName} ${student.firstName} ${student.surname || ''}`.trim();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* EN-TÊTE */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/enseignant/titulaire')}
                            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                            <FolderOpen size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                Dossier des Bulletins
                                {wsConnected && (
                                    <span className="relative flex h-3 w-3" title="Connexion en temps réel active">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Classe : {loading && students.length === 0 ? 'Chargement...' : classroomName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 md:max-w-xs">
                        <Search className="text-slate-400 ml-2" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un élève..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 w-full placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* ALERTE DE RECEPTION AUTOMATIQUE */}
                {!loading && students.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase">Réception Réussie</p>
                            <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-500 mt-1">
                                Les bulletins de la classe "{classroomName}" ont été validés et transmis par le Proviseur. Ils sont maintenant à votre disposition pour consultation et impression.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* LISTE DES BULLETINS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
                {loading && students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Ouverture du dossier...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <AlertCircle size={48} className="text-slate-400 mb-4" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm text-center">
                            En attente de réception<br/>
                            <span className="text-xs font-medium">Les bulletins apparaîtront ici automatiquement une fois envoyés par le Proviseur.</span>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/50 dark:hover:bg-blue-900/20 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/50 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{getFullName(student)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Prêt pour consultation
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`/enseignant/titulaire/bulletins/${classroomId}/etudiant/${student.id}`)}
                                        className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-all opacity-0 group-hover:opacity-100"
                                        title="Voir le bulletin"
                                    >
                                        <FolderOpen size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassBulletinsFolder;