import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, 
    Printer, 
    Download,
    FileText,
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '../../../services/api';
import BulletinApercuContainer from '../admin/BulletinApercuContainer';

const StudentBulletinView = () => {
    const { classroomId, studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États stricts : aucune donnée par défaut n'est tolérée
    const [studentInfo, setStudentInfo] = useState(null);
    const [bulletinData, setBulletinData] = useState(null);
    const [headerData, setHeaderData] = useState(null);

    useEffect(() => {
        const fetchStudentAndBulletin = async () => {
            // Blocage strict si l'ID est invalide
            if (!studentId || studentId === 'undefined' || studentId === 'null') {
                setError("L'identifiant de l'élève est manquant ou invalide. Veuillez retourner à la liste de la classe.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // ADAPTATION : Utilisation du nouvel endpoint REST
                const response = await api.get(`/bulletins/titulaire/classes/${classroomId}/students/${studentId}/bulletin`);
                
                if (response.status !== 200) {
                    throw new Error("Impossible de récupérer les données du bulletin sur le serveur.");
                }

                // Extraction de la réponse (Supporte l'encapsulation Axios data.data)
                const payload = response.data?.data || response.data;
                
                // ✅ ADAPTATION MAJEURE : Scan en profondeur et multi-clés pour résoudre l'incohérence Titulaire vs Proviseur
                // Garantit que même si le backend place le header/student dans un sous-objet 'bulletinData', React le capte.
                const extractedStudent = payload?.studentInfo || payload?.student || payload?.eleve || payload?.bulletinData?.studentInfo || payload?.bulletinData?.student;
                const extractedHeader = payload?.header || payload?.bulletinHeader || payload?.ecoleInfo || payload?.ecole || payload?.bulletinData?.header || payload?.bulletinData?.bulletinHeader;
                
                const extractedBulletin = payload?.bulletinData || payload?.bulletin || (payload?.formatType ? payload : null);
                const extractedBranches = payload?.branches || extractedBulletin?.branches;

                // VÉRIFICATION CRUCIALE : Si les données vitales sont vides, on bloque l'affichage.
                // AUCUN FALLBACK (Mock) NE SERA EXÉCUTÉ.
                if (!extractedStudent || Object.keys(extractedStudent).length === 0) {
                    throw new Error("Aucune donnée d'élève trouvée en base de données. Le bulletin ne peut pas être généré.");
                }
                
                // ✅ ADAPTATION : Normalisation de l'objet Élève avec support strict du nationalId récupéré du backend
                const normalizedStudent = {
                    ...extractedStudent,
                    classLevel: extractedStudent?.classLevel || extractedStudent?.classroom?.name || payload?.classroom?.name || payload?.bulletinData?.classLevel || "",
                    schoolYear: extractedStudent?.schoolYear || extractedStudent?.academicYear?.name || payload?.academicYear?.name || payload?.bulletinData?.schoolYear || "",
                    nationalId: extractedStudent?.nationalId || extractedStudent?.idNat || extractedStudent?.national_id || "",
                    permanentNumber: extractedStudent?.permanentNumber || extractedStudent?.matricule || "",
                    fullName: extractedStudent?.fullName || `${extractedStudent?.lastName || ""} ${extractedStudent?.postName || ""} ${extractedStudent?.firstName || ""}`.trim()
                };
                
                // Mappage des données dynamiques réelles
                setStudentInfo(normalizedStudent);
                setHeaderData(extractedHeader || {});
                setBulletinData(extractedBulletin ? { 
                    ...extractedBulletin,
                    formatType: extractedBulletin?.formatType || payload?.formatType, 
                    branches: extractedBranches || []
                } : {
                    formatType: payload?.formatType,
                    branches: extractedBranches || []
                });
                
            } catch (err) {
                console.error("API Error - Échec de la récupération des données réelles:", err);
                setError(err.message || "Erreur de connexion avec le serveur. Aucune donnée à afficher.");
                // Réinitialisation stricte pour éviter l'affichage de composants fantômes
                setStudentInfo(null);
                setHeaderData(null);
                setBulletinData(null);
            } finally {
                setLoading(false);
            }
        };

        if (classroomId && studentId) {
            fetchStudentAndBulletin();
        }
    }, [classroomId, studentId]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        if (!studentId || studentId === 'undefined') {
            alert("Impossible de télécharger le document : L'identifiant de l'élève est invalide.");
            return;
        }
        
        const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, "") : "http://localhost:8080/api";
        window.open(`${baseUrl}/bulletins/titulaire/download/${studentId}`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* EN-TÊTE D'ACTION */}
            <div className="print:hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/enseignant/titulaire/bulletins/${classroomId}`)}
                        className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="text-blue-600" size={24} />
                            Dossier Personnel
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                            Aperçu du Bulletin • {studentInfo ? (studentInfo.fullName) : (loading ? "Chargement..." : "Non disponible")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        disabled={loading || error || !bulletinData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                    >
                        <Printer size={16} /> Imprimer (A4)
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={loading || error || !bulletinData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase transition-colors"
                    >
                        <Download size={16} /> PDF Réceptionné
                    </button>
                </div>
            </div>

            {/* MESSAGE D'ALERTE EN CAS D'ERREUR */}
            {error && (
                <div className="print:hidden bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 text-sm">
                    <AlertCircle size={20} className="text-red-600 shrink-0" />
                    <div>
                        <span className="font-bold">Information système :</span> {error}
                    </div>
                </div>
            )}

            {/* ZONE D'APERÇU DU BULLETIN CENTRALISÉ */}
            {!error && (
                <div className="flex justify-center overflow-x-auto pb-10 print:p-0 print:m-0 print:block">
                    {loading ? (
                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Extraction des données en cours...</p>
                        </div>
                    ) : (
                        bulletinData && studentInfo && (
                            <BulletinApercuContainer 
                                bulletinData={bulletinData} 
                                studentInfo={studentInfo} 
                                header={headerData} 
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentBulletinView;