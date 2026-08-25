import React, { useState, useEffect } from 'react';
import { RecouvrementFraisService } from '../../services/RecouvrementFraisService';
import RecouvrementFraisDashboard from '../dashboard/RecouvrementFraisDashboard';
import { Download, FileText } from 'lucide-react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Correction : Importation de la fonction
import { useSchool } from "../../context/SchoolContext";
import AuthService from '../../services/auth.service';

const RecouvrementFraisManager = () => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [studentsData, setStudentsData] = useState([]);
    
    const [installments, setInstallments] = useState([]);
    const [currency, setCurrency] = useState('USD'); 

    const [selectedClasse, setSelectedClasse] = useState(''); 
    const [selectedTranche, setSelectedTranche] = useState('solde');

    const [stats, setStats] = useState({
        totalExpected: 0,
        totalPaid: 0,
        totalRemaining: 0,
        percentage: 0
    });

    // 1. Récupération des contextes dynamiques
    const { schoolConfig } = useSchool();
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        const loadInitialData = async () => {
            const classList = await RecouvrementFraisService.getClassrooms();
            setClasses(classList);
            if (classList.length > 0) {
                setSelectedClasse(classList[0].id);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedClasse) {
            fetchSituation();
        }
    }, [selectedClasse, selectedTranche]);

    const fetchSituation = async () => {
        setLoading(true);
        try {
            const data = await RecouvrementFraisService.getSituationRecouvrement(selectedClasse, selectedTranche);
            
            setStudentsData(data.profiles);
            setInstallments(data.installments);
            
            if (data.profiles && data.profiles.length > 0) {
                setCurrency(data.profiles[0].currency); 
            }
            
            const totals = data.profiles.reduce((acc, curr) => ({
                expected: acc.expected + curr.expected,
                paid: acc.paid + curr.paid,
            }), { expected: 0, paid: 0 });

            setStats({
                totalExpected: totals.expected,
                totalPaid: totals.paid,
                totalRemaining: totals.expected - totals.paid,
                percentage: totals.expected > 0 ? (totals.paid / totals.expected) * 100 : 0
            });
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    // Export Excel (CSV)
    const exportToCSV = () => {
        if (studentsData.length === 0) return;
        const headers = ['Nom', 'Postnom & Prénom', `Attendu (${currency})`, `Payé (${currency})`, `Reste (${currency})`, 'Status'];
        const csvRows = studentsData.map(student => [
            student.nom, student.postnom, student.expected, student.paid, student.remaining, student.status
        ]);
        const csvContent = '\uFEFF' + [
            headers.join(';'), ...csvRows.map(row => row.map(cell => `"${cell}"`).join(';'))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Correction de la comparaison pour la récupération du nom de la classe
        const className = classes.find(c => String(c.id) === String(selectedClasse))?.displayName || 'Classe';
        link.setAttribute('download', `Recouvrement_${className}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Génération du PDF stylisé
    const exportToPDF = () => {
        if (studentsData.length === 0) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const bleuDeNuit = [13, 27, 62]; // #0D1B3E

        // --- EN-TÊTE ---
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        
        doc.text(schoolConfig?.schoolName?.toUpperCase() || "INSTITUTION SCOLAIRE", 14, 30);
        doc.text(schoolConfig?.province?.toUpperCase() || "PROVINCE", 14, 20);
        doc.text(schoolConfig?.subdivision?.toUpperCase() || "SOUS-DIVISION", 14, 25);
   
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        if (schoolConfig?.address) doc.text(schoolConfig.address, 14, 35);
        if (schoolConfig?.phone) doc.text(`Tél : ${schoolConfig.phone}`, 14, 40);

        // --- LOGO ---
        if (schoolConfig?.logoBase64) {
            try {
                doc.addImage(schoolConfig.logoBase64, 'PNG', pageWidth - 40, 15, 25, 25);
            } catch (e) {
                console.warn("Erreur de rendu du logo dans le PDF", e);
            }
        }

        // --- TITRE DU DOCUMENT ---
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(bleuDeNuit[0], bleuDeNuit[1], bleuDeNuit[2]);
        doc.text("SITUATION DE RECOUVREMENT DES FRAIS", pageWidth / 2, 55, { align: "center" });

        // --- INFOS DE FILTRAGE ---
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        
        // Correction de la comparaison pour bien récupérer le nom de la classe
        const className = classes.find(c => String(c.id) === String(selectedClasse))?.displayName || 'N/A';
        const trancheName = selectedTranche === 'solde' ? 'Solde Global (Annuel)' : `Tranche ${selectedTranche}`;
        
        doc.text(`Classe : ${className}`, 14, 70);
        doc.text(`Filtre  : ${trancheName}`, 14, 76);
        doc.text(`Devise : ${currency}`, 14, 82);

        // --- TABLEAU ---
        const tableColumn = ["Nom", "Postnom & Prénom", `Attendu`, `Payé`, `Reste`, "Statut"];
        const tableRows = studentsData.map(student => [
            student.nom,
            student.postnom,
            student.expected.toLocaleString(undefined, {minimumFractionDigits: 2}),
            student.paid.toLocaleString(undefined, {minimumFractionDigits: 2}),
            student.remaining > 0 ? student.remaining.toLocaleString(undefined, {minimumFractionDigits: 2}) : "Soldé",
            student.status
        ]);

        // Correction : Utilisation de la fonction importée autoTable
        autoTable(doc, {
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: bleuDeNuit,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'center' }
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            }
        });

        // --- PIED DE PAGE & SIGNATURES ---
        const finalY = doc.lastAutoTable?.finalY || 90;
        const dateString = new Date().toLocaleDateString('fr-FR');
        const city = schoolConfig?.city || 'Beni';
        const cashierName = currentUser?.username || 'Caissier(ère)';

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fait à ${city}, le ${dateString}`, pageWidth - 14, finalY + 20, { align: "right" });
        
        doc.setFont("helvetica", "bold");
        doc.text("La Caisse", pageWidth - 35, finalY + 35, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.text(cashierName.toUpperCase(), pageWidth - 35, finalY + 65, { align: "center" });

        // Modification ici : Prévisualisation dans un nouvel onglet au lieu de forcer le téléchargement
        const pdfBlobUrl = doc.output('bloburl');
        window.open(pdfBlobUrl, '_blank');
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-10 gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Recouvrement des Frais</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
                    <div className="flex flex-col w-full sm:w-auto lg:w-56">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Classe</label>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
                            value={selectedClasse}
                            onChange={(e) => setSelectedClasse(e.target.value)}
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.displayName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col w-full sm:w-auto lg:w-64">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Filtrer par tranche</label>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
                            value={selectedTranche}
                            onChange={(e) => setSelectedTranche(e.target.value)}
                        >
                            <option value="solde">Solde Global (Annuel)</option>
                            {installments.map((inst) => (
                                <option key={inst.value} value={inst.value}>{inst.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button
                            onClick={exportToCSV}
                            disabled={loading || studentsData.length === 0}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-all"
                            title="Exporter vers Excel (CSV)"
                        >
                            <Download size={18} />
                            <span className="text-sm hidden sm:inline">Excel</span>
                        </button>

                        <button
                            onClick={exportToPDF}
                            disabled={loading || studentsData.length === 0}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-blue-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-all"
                            title="Imprimer le PDF"
                        >
                            <FileText size={18} />
                            <span className="text-sm hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <RecouvrementFraisDashboard stats={stats} currency={currency} />
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#2563eb]">
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10">Nom</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10">Postnom & Prénom</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right border-b border-white/10">Attendu ({currency})</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right border-b border-white/10">Payé ({currency})</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right border-b border-white/10">Reste</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-center border-b border-white/10">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-bold animate-pulse uppercase text-[10px] tracking-widest">Mise à jour...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : studentsData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center text-slate-300">
                                            <span className="text-5xl mb-2">📂</span>
                                            <p className="font-bold italic">Aucune donnée disponible pour cette classe.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                studentsData.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{student.nom}</td>
                                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">{student.postnom}</td>
                                        <td className="py-4 px-6 text-sm font-black text-slate-800 text-right whitespace-nowrap">{student.expected.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="py-4 px-6 text-sm font-black text-emerald-600 text-right whitespace-nowrap">{student.paid.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="py-4 px-6 text-sm font-black text-orange-500 text-right whitespace-nowrap">
                                            {student.remaining > 0 ? student.remaining.toLocaleString(undefined, {minimumFractionDigits: 2}) : <span className="text-emerald-500">Soldé</span>}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border
                                                ${student.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                                                ${student.status === 'Partiel' ? 'bg-orange-100 text-orange-700 border-orange-200' : ''}
                                                ${student.status === 'Non Payé' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                            `}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Système de Recouvrement Temps Réel</span>
                    </div>
                    <div className="flex gap-4">
                        <span>Total: {studentsData.length} Élèves</span>
                        <span className="text-[#0D1B3E]">MyAcademia ERP</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecouvrementFraisManager;