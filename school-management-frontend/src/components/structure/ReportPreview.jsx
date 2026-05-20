import React from 'react';
import { Printer, X } from 'lucide-react';

const ReportPreview = ({ data, onClose }) => {
    if (!data) return null;

    /**
     * Formate une date YYYY-MM-DD en DD/MM/YYYY
     */
    const formatDateFrench = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Retourne tel quel si format invalide
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    };

    const handlePrint = () => {
        // 1. Création de la fenêtre temporaire
        const printWindow = window.open('', '_blank');
        
        // 2. Extraction du contenu du rapport
        const reportContent = document.getElementById('report-to-print').innerHTML;

        // 3. Préparation de la date et l'heure personnalisées
        const now = new Date();
        const formattedDate = now.toLocaleDateString('fr-FR');
        const formattedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const fullTimestamp = `${formattedDate} à ${formattedTime}`;

        // 4. Injection du HTML avec styles correctifs pour supprimer les en-têtes système
        printWindow.document.write(`
            <html>
                <head>
                    <title>Rapport Scolaire</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        /* Suppression des en-têtes/pieds de page par défaut du navigateur */
                        @media print {
                            @page { 
                                size: A4 portrait; 
                                margin: 0; 
                            }
                            body { 
                                margin: 0; 
                                -webkit-print-color-adjust: exact; 
                            }
                        }

                        /* Création d'une zone de contenu avec marges simulées */
                        .print-container {
                            padding: 15mm 20mm;
                            position: relative;
                            font-family: ui-sans-serif, system-ui, sans-serif;
                        }

                        /* Horodatage discret en haut à droite */
                        .print-timestamp {
                            position: absolute;
                            top: 10mm;
                            right: 20mm;
                            font-size: 10px;
                            color: #475569;
                        }

                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 11px; }
                        .text-center { text-align: center; }
                        .uppercase { text-transform: uppercase; }
                        .font-bold { font-weight: bold; }
                    </style>
                </head>
                <body onload="window.print();window.close()">
                    <div class="print-container">
                        <div class="print-timestamp">Document généré le ${fullTimestamp}</div>
                        ${reportContent}
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex justify-center overflow-y-auto p-4 md:p-10">
            
            {/* Barre d'outils flottante */}
            <div className="fixed top-5 right-10 flex gap-3">
                <button 
                    onClick={handlePrint} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-blue-700 transition-all font-bold scale-110"
                >
                    <Printer size={20} /> Imprimer maintenant
                </button>
                <button 
                    onClick={onClose} 
                    className="p-3 bg-white text-slate-600 rounded-full shadow-2xl hover:bg-slate-100 transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Zone de prévisualisation (ID: report-to-print) */}
            <div id="report-to-print" className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl rounded-sm my-auto text-slate-900">
                
                {/* En-tête de l'école */}
                <div className="flex flex-col items-center border-b-2 border-slate-900 pb-6 mb-8 text-center">
                    <h1 className="text-2xl font-black tracking-tighter uppercase">{data.schoolName}</h1>
                    <p className="text-sm font-bold italic">"Discipline - Travail - Succès"</p>
                    <div className="mt-4 flex justify-between w-full text-[12px] font-bold uppercase">
                        <span>Province : Nord-Kivu</span>
                        <span>Commune : Bungulu</span>
                    </div>
                </div>

                {/* Titre du Rapport */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-black underline decoration-2 underline-offset-4 uppercase mb-2">
                        Liste de Présence des Élèves
                    </h2>
                    <div className="flex justify-center gap-10 text-sm">
                        <p>Année Scolaire : <span className="font-bold">{data.academicYearLabel}</span></p>
                        <p>Classe : <span className="font-bold">{data.classroomName}</span></p>
                    </div>
                </div>

                {/* Tableau des données */}
                <table className="w-full border-collapse border border-black text-[11px]">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="border border-black p-2 text-center w-10">N°</th>
                            <th className="border border-black p-2 text-center">MATRICULE</th>
                            <th className="border border-black p-2">NOM, POSTNOM & PRÉNOM</th>
                            <th className="border border-black p-2 text-center w-10">SEXE</th>
                            <th className="border border-black p-2">LIEU ET DATE DE NAISSANCE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.students?.map((student, index) => (
                            <tr key={student.id || index}>
                                <td className="border border-black p-1.5 text-center">{index + 1}</td>
                                <td className="border border-black p-1.5 font-mono text-center">{student.matricule}</td>
                                <td className="border border-black p-1.5 font-bold uppercase">
                                    {`${student.lastName} ${student.postName} ${student.firstName}`}
                                </td>
                                <td className="border border-black p-1.5 text-center">
                                    {student.gender === 'MASCULIN' ? 'M' : 'F'}
                                </td>
                                <td className="border border-black p-1.5 italic">
                                    {/* Formatage Français appliqué ici */}
                                    {` ${student.birthPlace}, le ${formatDateFrench(student.birthDate)}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Statistiques et Signatures */}
                <div className="mt-8 flex justify-between items-start">
                    <div className="text-[12px] border border-black p-4 rounded-md min-w-[150px]">
                        <p className="font-bold underline mb-2 uppercase">Statistiques :</p>
                        <p>Total Élèves : <strong>{data.totalStudents}</strong></p>
                        <p>Garçons : <strong>{data.boysCount}</strong></p>
                        <p>Filles : <strong>{data.girlsCount}</strong></p>
                    </div>

                    <div className="text-center text-[12px] space-y-16 mt-4">
                        <p className="font-bold underline italic">Fait à Beni, le {new Date().toLocaleDateString('fr-FR')}</p>
                        <div className="flex gap-20">
                            <div className="flex flex-col">
                                <span className="underline font-bold uppercase">Le Préfet des Études</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="underline font-bold uppercase">Le Secrétaire</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;