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
// ✅ NOUVEAU (Correct)
import BulletinApercuContainer from '../admin/BulletinApercuContainer';

const StudentBulletinView = () => {
    const { classroomId, studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Nouveaux états restructurés pour correspondre aux props de BulletinApercuContainer
    const [studentInfo, setStudentInfo] = useState(null);
    const [bulletinData, setBulletinData] = useState(null);
    const [headerData, setHeaderData] = useState(null);

    // Structure par défaut des branches (CTEB RDC) pour le fallback
    const defaultBranches = [
        { name: "DOMAINE DES SCIENCES", isHeader: true },
        { name: "Sous-domaine des Mathématiques", isSubHeader: true },
        { name: "Mathématiques", max1Sem: 40, p1: "", p2: "", tot1Sem: "", max2Sem: 40, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Sous-domaine des Sciences Physiques & SVT", isSubHeader: true },
        { name: "SVT", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Physique", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Technologie, Info & Roulage", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        
        { name: "DOMAINE DES LANGUES", isHeader: true },
        { name: "Français", max1Sem: 50, p1: "", p2: "", tot1Sem: "", max2Sem: 50, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Anglais", max1Sem: 30, p1: "", p2: "", tot1Sem: "", max2Sem: 30, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Langues Nationales (Swahili/Lingala)", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },

        { name: "DOMAINE DES SCIENCES HUMAINES", isHeader: true },
        { name: "Histoire", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Géographie", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" },
        { name: "Educ. à la Citoyenneté", max1Sem: 20, p1: "", p2: "", tot1Sem: "", max2Sem: 20, p3: "", p4: "", tot2Sem: "", totalGeneral: "" }
    ];

    useEffect(() => {
        const fetchStudentAndBulletin = async () => {
            // Blocage si l'ID est invalide
            if (!studentId || studentId === 'undefined' || studentId === 'null') {
                setError("L'identifiant de l'élève est manquant ou invalide. Veuillez retourner à la liste de la classe.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await api.get(`/bulletins/titulaire/folders/${classroomId}/students/${studentId}/bulletin`);
                
                if (response.status !== 200) {
                    throw new Error("Impossible de récupérer les données du bulletin sur le serveur.");
                }

                // Gérer le cas où Axios encapsule la réponse dans `data.data`
                const payload = response.data?.data || response.data;
                
                // Extraction robuste multi-clés au cas où le backend nomme différemment
                const extractedStudent = payload?.studentInfo || payload?.student || payload?.eleve;
                const extractedHeader = payload?.header || payload?.ecoleInfo || payload?.ecole;
                const extractedBulletin = payload?.bulletinData || payload?.bulletin;
                const extractedBranches = payload?.branches || extractedBulletin?.branches;

                // VÉRIFICATION CRUCIALE : Si les données vitales sont vides (malgré un code 200),
                // on force une erreur pour déclencher le catch et afficher vos données de test.
                if (!extractedStudent || Object.keys(extractedStudent).length === 0) {
                    throw new Error("Le serveur a répondu, mais les données de l'élève sont vides ou mal formatées. Passage en mode aperçu (fallback).");
                }
                
                // Mappage des données sécurisé
                setStudentInfo(extractedStudent);
                setHeaderData(extractedHeader || {});
                setBulletinData(extractedBulletin || { 
                    formatType: payload?.formatType || 'CTEB', 
                    branches: extractedBranches || []
                });
                
            } catch (err) {
                console.warn("API Error ou Données vides, utilisation du Fallback:", err);
                setError(err.message || "Erreur de connexion");
                
                // Fallback de développement structuré pour le BulletinApercuContainer
                setStudentInfo({
                    fullName: "EZRA KIBATI KAMBALE",
                    sexe: "M",
                    lieuNaiss: "BENI",
                    dateNaiss: "12/05/2010",
                    classe: "7ÈME ANNÉE (A)",
                    numPerm: "82736451001234",
                    nombreEleves: 45
                });
                
                setHeaderData({
                    ecole: "COMPLEXE SCOLAIRE MUSAFA",
                    codeEcole: "6100021",
                    province: "NORD-KIVU II",
                    ville: "BENI",
                    commune: "BUNGULU",
                    watermarkLogoPath: null
                });

                setBulletinData({
                    formatType: 'CTEB',
                    branches: defaultBranches
                });
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
        window.open(`/api/bulletins/titulaire/download/${studentId}`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* EN-TÊTE D'ACTION (Masqué lors de l'impression) */}
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
                            Aperçu du Bulletin • {studentInfo?.fullName || "Chargement..."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                    >
                        <Printer size={16} /> Imprimer (A4)
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase transition-colors"
                    >
                        <Download size={16} /> PDF Réceptionné
                    </button>
                </div>
            </div>

            {/* MESSAGE D'ALERTE EN CAS D'ERREUR */}
            {error && (
                <div className="print:hidden bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-sm">
                    <AlertCircle size={20} className="text-amber-600 shrink-0" />
                    <div>
                        <span className="font-bold">Information système :</span> {error}
                    </div>
                </div>
            )}

            {/* ZONE D'APERÇU DU BULLETIN CENTRALISÉ */}
            <div className="flex justify-center overflow-x-auto pb-10 print:p-0 print:m-0 print:block">
                {loading ? (
                    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Génération du bulletin en cours...</p>
                    </div>
                ) : (
                    <BulletinApercuContainer 
                        bulletinData={bulletinData} 
                        studentInfo={studentInfo} 
                        header={headerData} 
                    />
                )}
            </div>
        </div>
    );
};

export default StudentBulletinView;