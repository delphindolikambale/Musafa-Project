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

const StudentBulletinView = () => {
    const { classroomId, studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [bulletinBranches, setBulletinBranches] = useState([]);

    // Structure par défaut des branches (CTEB RDC) pour éviter un affichage vide si l'API est en cours de configuration
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
            try {
                setLoading(true);
                setError(null);
                
                // Appel API pour récupérer les données de l'élève et ses notes
                const response = await fetch(`/api/classrooms/${classroomId}/students/${studentId}/bulletin`);
                
                if (!response.ok) {
                    throw new Error("Impossible de récupérer les données du bulletin sur le serveur.");
                }
                
                const data = await response.json();
                
                setStudentData(data.student);
                setBulletinBranches(data.branches || defaultBranches);
            } catch (err) {
                console.error("Erreur API:", err);
                setError(err.message);
                
                // Fallback de développement pour ne pas bloquer l'interface
                setStudentData({
                    fullName: "EZRA KIBATI KAMBALE",
                    sexe: "M",
                    lieuNaiss: "BENI",
                    dateNaiss: "12/05/2010",
                    classe: "7ÈME ANNÉE (A)",
                    numPerm: "82736451001234",
                    ecole: "COMPLEXE SCOLAIRE MUSAFA",
                    codeEcole: "6100021",
                    province: "NORD-KIVU II",
                    ville: "BENI",
                    commune: "BUNGULU"
                });
                setBulletinBranches(defaultBranches);
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

    // Déclenche le téléchargement du fichier PDF pré-généré dans le dossier du serveur
    const handleDownloadPDF = () => {
        if (!studentId) return;
        // Point d'accès de votre API Spring Boot qui renvoie le fichier physique du dossier créé
        window.open(`/api/bulletins/download/${studentId}`, '_blank');
    };

    // Calcul du nombre de lignes vides pour forcer le tableau à occuper toute la hauteur A4
    const activeBranches = bulletinBranches.length > 0 ? bulletinBranches : defaultBranches;
    const standardRowCount = 18; // Seuil optimal pour l'espace A4 restant
    const paddingRowsCount = Math.max(0, standardRowCount - activeBranches.length);

    // Sécurisation du découpage des chaînes pour les grilles d'identifiants
    const codeEcoleChars = studentData?.codeEcole ? studentData.codeEcole.split('') : [];
    const numPermChars = studentData?.numPerm ? studentData.numPerm.split('') : [];

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
                            Aperçu du Bulletin • {studentData?.fullName || "Chargement..."}
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

            {/* MESSAGE D'ALERTE EN CAS D'ERREUR DE CONNEXION API */}
            {error && (
                <div className="print:hidden bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-sm">
                    <AlertCircle size={20} className="text-amber-600 shrink-0" />
                    <div>
                        <span className="font-bold">Mode d'aperçu hors-ligne :</span> Affichage de données démo locales. L'API backend est injoignable.
                    </div>
                </div>
            )}

            {/* ZONE D'APERÇU DU BULLETIN (Format A4) */}
            <div className="flex justify-center overflow-x-auto pb-10 print:p-0 print:m-0 print:block">
                
                {loading ? (
                    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Génération du bulletin en cours...</p>
                    </div>
                ) : (
                    <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[10mm] shadow-2xl border border-slate-200 print:shadow-none print:border-none print:w-full print:p-0 relative box-border">
                        
                        {/* HEADER REPUBLIQUE */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-20 h-16 bg-blue-50 border border-blue-200 flex items-center justify-center text-[8px] text-center p-1 font-bold">
                                Drapeau RDC
                            </div>
                            <div className="text-center flex-1">
                                <h2 className="text-base font-black tracking-wide">REPUBLIQUE DEMOCRATIQUE DU CONGO</h2>
                                <h3 className="text-xs font-bold mt-1">MINISTERE DE L'EDUCATION NATIONALE ET NOUVELLE CITOYENNETE</h3>
                            </div>
                            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-[8px] text-center p-1 font-bold">
                                Sceau officiel
                            </div>
                        </div>

                        {/* SECTION INFORMATIONS IDENTITÉ */}
                        <div className="border-2 border-black mb-4 flex flex-col text-xs font-bold">
                            {/* Ligne N° ID */}
                            <div className="flex border-b border-black">
                                <div className="w-1/5 p-1 border-r border-black font-black">N° ID.</div>
                                <div className="flex-1 flex">
                                    {[...Array(30)].map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-black last:border-r-0 h-full min-h-[24px]"></div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Infos Province */}
                            <div className="flex border-b border-black">
                                <div className="w-[30%] p-1 border-r border-black font-black">PROVINCE EDUCATIONNELLE</div>
                                <div className="flex-1 p-1 pl-2 uppercase">: {studentData?.province}</div>
                            </div>

                            {/* Grille Infos Ecole / Eleve */}
                            <div className="flex w-full">
                                {/* Colonne Gauche (Ecole) */}
                                <div className="w-1/2 border-r border-black flex flex-col">
                                    <div className="flex border-b border-black">
                                        <div className="w-[40%] p-1 border-r border-black">VILLE</div>
                                        <div className="flex-1 p-1 pl-2 uppercase">: {studentData?.ville}</div>
                                    </div>
                                    <div className="flex border-b border-black">
                                        <div className="w-[40%] p-1 border-r border-black">COMMUNE / TERRITOIRE (1)</div>
                                        <div className="flex-1 p-1 pl-2 uppercase">: {studentData?.commune}</div>
                                    </div>
                                    <div className="flex border-b border-black">
                                        <div className="w-[40%] p-1 border-r border-black">ECOLE</div>
                                        <div className="flex-1 p-1 pl-2 uppercase font-black">: {studentData?.ecole}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-[40%] p-1 border-r border-black">CODE ECOLE</div>
                                        <div className="flex-1 flex items-center pl-2">
                                            : <div className="ml-2 flex border border-black h-5">
                                                {codeEcoleChars.map((char, i) => (
                                                    <div key={i} className="w-4 flex items-center justify-center border-r border-black last:border-r-0 text-[10px]">{char}</div>
                                                ))}
                                                {[...Array(Math.max(0, 11 - codeEcoleChars.length))].map((_, i) => (
                                                    <div key={`empty-${i}`} className="w-4 flex items-center justify-center border-r border-black last:border-r-0"></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne Droite (Eleve) */}
                                <div className="w-1/2 flex flex-col">
                                    <div className="flex border-b border-black">
                                        <div className="w-[20%] p-1 border-r border-black">ELEVE</div>
                                        <div className="flex-1 p-1 pl-2 uppercase font-black">: {studentData?.fullName}</div>
                                        <div className="w-[15%] p-1 border-l border-r border-black">SEXE :</div>
                                        <div className="w-[10%] p-1 text-center font-black">{studentData?.sexe}</div>
                                    </div>
                                    <div className="flex border-b border-black">
                                        <div className="w-[20%] p-1 border-r border-black">NE(E) A</div>
                                        <div className="flex-1 p-1 pl-2 uppercase">: {studentData?.lieuNaiss}</div>
                                        <div className="w-[15%] p-1 border-l border-black text-right">LE :</div>
                                        <div className="w-[25%] p-1 pl-2 font-black">{studentData?.dateNaiss}</div>
                                    </div>
                                    <div className="flex border-b border-black h-full">
                                        <div className="w-[20%] p-1 border-r border-black flex items-center">CLASSE</div>
                                        <div className="flex-1 p-1 pl-2 flex items-center font-black">: {studentData?.classe}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-[20%] p-1 border-r border-black flex items-center">N° PERM.</div>
                                        <div className="flex-1 flex items-center pl-2">
                                            : <div className="ml-2 flex border border-black h-5">
                                                {numPermChars.map((char, i) => (
                                                    <div key={i} className="w-4 flex items-center justify-center border-r border-black last:border-r-0 text-[10px]">{char}</div>
                                                ))}
                                                {[...Array(Math.max(0, 14 - numPermChars.length))].map((_, i) => (
                                                    <div key={`empty-${i}`} className="w-4 flex items-center justify-center border-r border-black last:border-r-0"></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TITRE PRINCIPAL BULLETIN */}
                        <div className="text-center font-black text-xs mb-2 border-2 border-black py-2 uppercase">
                            BULLETIN DE LA {studentData?.classe} • CYCLE TERMINAL DE L'ÉDUCATION DE BASE (CTEB) • ANNÉE SCOLAIRE 2026-2027
                        </div>

                        {/* TABLEAU DES NOTES DYNAMIQUE */}
                        <table className="w-full border-collapse border-2 border-black text-[10px] text-center font-bold">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th rowSpan="3" className="border-r-2 border-black p-2 w-[30%]">BRANCHES</th>
                                    <th colSpan="4" className="border-r-2 border-black p-1">PREMIER SEMESTRE</th>
                                    <th colSpan="4" className="border-r-2 border-black p-1">SECOND SEMESTRE</th>
                                    <th rowSpan="3" className="border-r-2 border-black p-1 w-[8%]">TOTAL GENERAL</th>
                                    <th colSpan="2" className="p-1">EXAMEN DE REPECHAGE</th>
                                </tr>
                                <tr className="border-b border-black">
                                    <th rowSpan="2" className="border-r border-black border-t border-black p-1">MAX.</th>
                                    <th colSpan="2" className="border-r border-black border-t border-black p-1 leading-tight">TRAVAUX<br/>JOURNAL.</th>
                                    <th rowSpan="2" className="border-r-2 border-black border-t border-black p-1">TOTAL</th>
                                    <th rowSpan="2" className="border-r border-black border-t border-black p-1">MAX.</th>
                                    <th colSpan="2" className="border-r border-black border-t border-black p-1 leading-tight">TRAVAUX<br/>JOURNAL.</th>
                                    <th rowSpan="2" className="border-r-2 border-black border-t border-black p-1">TOTAL</th>
                                    <th rowSpan="2" className="border-r border-black border-t border-black p-1">%</th>
                                    <th rowSpan="2" className="border-t border-black p-1">Sign. Prof.</th>
                                </tr>
                                <tr className="border-b-2 border-black">
                                    <th className="border-r border-black p-0.5 w-[4%]">1ère P</th>
                                    <th className="border-r border-black p-0.5 w-[4%]">2ème P</th>
                                    <th className="border-r border-black p-0.5 w-[4%]">3ème P</th>
                                    <th className="border-r border-black p-0.5 w-[4%]">4ème P</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Rendu dynamique des matières issues de la DB */}
                                {activeBranches.map((branch, index) => (
                                    <tr key={index} className={branch.isHeader ? "bg-slate-100 print:bg-slate-100 h-6" : "h-6"}>
                                        {branch.isHeader ? (
                                            <>
                                                <td className="border-r-2 border-black border-b border-black text-left p-1 font-black uppercase" colSpan="12">
                                                    {branch.name}
                                                </td>
                                            </>
                                        ) : branch.isSubHeader ? (
                                            <>
                                                <td className="border-r-2 border-black border-b border-black text-left p-1 pl-4 italic" colSpan="12">
                                                    {branch.name}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border-r-2 border-black border-b border-black text-left p-1 pl-6 font-medium">{branch.name}</td>
                                                <td className="border-r border-black border-b border-black">{branch.max1Sem ?? '-'}</td>
                                                <td className="border-r border-black border-b border-black font-normal">{branch.p1}</td>
                                                <td className="border-r border-black border-b border-black font-normal">{branch.p2}</td>
                                                <td className="border-r-2 border-black border-b border-black bg-slate-50 font-black">{branch.tot1Sem}</td>
                                                <td className="border-r border-black border-b border-black">{branch.max2Sem ?? '-'}</td>
                                                <td className="border-r border-black border-b border-black font-normal">{branch.p3}</td>
                                                <td className="border-r border-black border-b border-black font-normal">{branch.p4}</td>
                                                <td className="border-r-2 border-black border-b border-black bg-slate-50 font-black">{branch.tot2Sem}</td>
                                                <td className="border-r-2 border-black border-b border-black bg-slate-100 font-extrabold">{branch.totalGeneral}</td>
                                                <td className="border-r border-black border-b border-black font-normal">{branch.repechage || ''}</td>
                                                <td className="border-b border-black font-normal text-[8px]">{branch.signature || ''}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}

                                {/* Remplissage pour forcer l'alignement strict du format A4 */}
                                {[...Array(paddingRowsCount)].map((_, i) => (
                                    <tr key={`pad-${i}`} className="h-6">
                                        <td className="border-r-2 border-black border-b border-black"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-r-2 border-black border-b border-black bg-slate-50"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-r-2 border-black border-b border-black bg-slate-50"></td>
                                        <td className="border-r-2 border-black border-b border-black bg-slate-100"></td>
                                        <td className="border-r border-black border-b border-black"></td>
                                        <td className="border-b border-black"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* PIED DE PAGE : Signatures et Mentions */}
                        <div className="mt-4 grid grid-cols-3 text-[9px] font-bold text-center gap-4 border-t border-black pt-4">
                            <div>
                                <p>Fait à BENI, le {new Date().toLocaleDateString('fr-FR')}</p>
                                <p className="mt-1 font-black uppercase text-xs">Le Chef d'Établissement</p>
                                <p className="mt-8 text-slate-400 italic">(Signature et Sceau)</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="border border-dashed border-black p-2 w-3/4">
                                    <p className="uppercase text-[8px]">Sceau de l'école</p>
                                </div>
                            </div>
                            <div>
                                <p className="invisible">Espace alignement</p>
                                <p className="mt-1 font-black uppercase text-xs">Le Titulaire de Classe</p>
                                <p className="mt-8 text-slate-400 italic">(Signature)</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentBulletinView;