import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import PaymentDashboard from '../../components/dashboard/PaymentDashboard';
import StudentSummaryCard from '../../components/structure/StudentSummaryCard';
import PaymentForm from '../../components/structure/PaymentForm';
import { Search, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react';

const PaymentWindow = () => {
    const location = useLocation();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [studentSummary, setStudentSummary] = useState(null);
    const [dailyReport, setDailyReport] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Chargement initial des statistiques globales
    useEffect(() => {
        loadGlobalStats();
    }, []);

    const loadGlobalStats = async () => {
        try {
            const reportData = await paymentService.getDailyReport();
            setDailyReport(reportData);
        } catch (err) {
            console.error("Erreur de chargement des stats :", err);
            setDailyReport(null);
        }
    };

    // Sélection d'un étudiant et récupération de son profil financier
    const handleSelectStudent = useCallback(async (student) => {
        const identifier = student.matricule || student.accountNumber;
        
        if (!identifier) {
            setError("Impossible d'identifier cet étudiant (Matricule ou Numéro de compte manquant)");
            return;
        }

        const fullName = `${student.lastName || ''} ${student.firstName || ''}`.trim();
        setSearchTerm(fullName !== '' ? fullName : identifier); 
        
        setSearchResults([]);
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const data = await paymentService.getStudentSummary(identifier);
            setStudentSummary(data);
        } catch (err) {
            setError("Impossible de récupérer le profil financier.");
            setStudentSummary(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gestion du pré-remplissage via la navigation (ex: depuis une autre page)
    useEffect(() => {
        if (location.state?.prefillAccount) {
            handleSelectStudent({
                accountNumber: location.state.prefillAccount,
                lastName: location.state.prefillName || '',
                firstName: ''
            });
        }
    }, [location.state, handleSelectStudent]);

    // Logique de recherche avec Debounce (300ms)
    useEffect(() => {
        if (studentSummary && (searchTerm === studentSummary.studentFullName || searchTerm.includes(studentSummary.accountNumber))) {
             return;
        }

        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 0) {
                setIsSearching(true);
                try {
                    const results = await paymentService.searchStudents(searchTerm);
                    if (searchTerm.length > 0) setSearchResults(results);
                } catch (err) {
                    console.error("Erreur de recherche", err);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, studentSummary]);

    /**
     * Gère le succès du paiement :
     * 1. Capture la réponse (contenant l'ID du paiement pour le reçu)
     * 2. Met à jour les stats et le profil de l'élève
     * 3. Retourne la réponse au PaymentForm pour déclencher la prévisualisation
     */
    const handlePaymentSuccess = async (payload) => {
        try {
            // Exécution du paiement via le service
            const response = await paymentService.processPayment(payload);
            
            setSuccessMessage("Paiement enregistré avec succès !");
            
            // Rafraîchissement des données en arrière-plan
            await loadGlobalStats();
            
            if (studentSummary) {
                const idToReload = studentSummary.accountNumber || studentSummary.matricule;
                const updatedSummary = await paymentService.getStudentSummary(idToReload);
                setStudentSummary(updatedSummary);
            }

            // On efface le message de succès après un court délai pour laisser place au reçu
            setTimeout(() => setSuccessMessage(null), 3000);
            
            // IMPORTANT : On retourne la réponse complète pour que PaymentForm 
            // puisse extraire l'ID et afficher la modale de reçu
            return response;
        } catch (err) {
            setError("Erreur lors du traitement du paiement");
            throw err; 
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-6 animate-in fade-in duration-700">
            {/* Statistiques Journalières */}
            <PaymentDashboard reportData={dailyReport} />

            {/* Barre de Recherche */}
            <div className="bg-[#0F172A] p-4 lg:p-5 rounded-3xl shadow-xl border border-blue-500/10 relative z-50">
                <div className="relative w-full">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-slate-500'}`} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un élève par nom ou matricule..." 
                        className="w-full bg-white/5 border border-white/5 focus:border-blue-500/30 rounded-2xl pl-14 pr-14 py-3.5 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-600 uppercase tracking-wider"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                    )}

                    {/* Liste des résultats de recherche */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-[#1E293B] border border-blue-500/20 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 max-h-[350px] overflow-y-auto">
                            {searchResults.map((student, idx) => (
                                <div 
                                    key={student.id || idx}
                                    onClick={() => handleSelectStudent(student)}
                                    className="p-4 border-b border-white/5 hover:bg-blue-500/10 cursor-pointer flex items-center justify-between transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-500/20 p-2.5 rounded-xl">
                                            <User className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm uppercase">{student.lastName} {student.firstName}</h4>
                                            <p className="text-slate-400 text-xs mt-0.5">
                                                Matricule: <span className="text-blue-400 font-mono">{student.matricule || student.accountNumber}</span>
                                                {student.classroom && ` • ${student.classroom}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                        Sélectionner
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Affichage des erreurs de recherche ou d'identification */}
                {error && (
                    <div className="mt-4 flex items-center gap-3 text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}
            </div>

            {/* Zone de travail (Formulaire et Résumé) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                
                {/* Overlay de succès temporaire */}
                {successMessage && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-md rounded-[3rem] border-2 border-emerald-500/30 pointer-events-none">
                        <div className="text-center animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-white text-xl font-black uppercase tracking-tighter">{successMessage}</h3>
                        </div>
                    </div>
                )}

                {/* Loader de chargement du profil */}
                {loading && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm rounded-[3rem]">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Partie Gauche : Formulaire de paiement */}
                <div className={`lg:col-span-8 space-y-6 transition-all duration-500 ${!studentSummary ? 'opacity-20 pointer-events-none blur-md scale-[0.98]' : 'opacity-100'}`}>
                    <PaymentForm 
                        studentSummary={studentSummary} 
                        onPaymentSuccess={handlePaymentSuccess} 
                    />
                    
                    {/* Note informative UI */}
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-[2.5rem] border border-blue-500/10">
                        <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">Note de service</h4>
                        <p className="text-slate-400 text-xs leading-relaxed opacity-70">
                            Chaque versement est automatiquement ventilé selon la configuration de l'année académique. Les dettes antérieures sont prioritaires conformément au règlement financier.
                        </p>
                    </div>
                </div>
                
                {/* Partie Droite : Carte récapitulative de l'étudiant */}
                <div className={`lg:col-span-4 transition-all duration-500 ${!studentSummary ? 'opacity-20 pointer-events-none blur-md scale-[0.98]' : 'opacity-100'}`}>
                    <StudentSummaryCard summary={studentSummary} />
                </div>
            </div>
        </div>
    );
};

export default PaymentWindow;