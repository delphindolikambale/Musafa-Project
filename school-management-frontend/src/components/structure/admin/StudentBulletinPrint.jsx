// Fichier 1 : src/components/structure/admin/StudentBulletinPrint.jsx
import React, { useEffect, useState } from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';
import BulletinBodyHumanite from './BulletinBodyHumanite';
import BulletinFooter from './BulletinFooter';
import BulletinFooter8eme from './BulletinFooter8eme';
import BulletinHeaderService from "../../../services/admin/bulletinHeaderService";
import { getImageUrl } from '../../../services/api';
import { FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StudentBulletinPrint = ({ bulletinData, studentInfo }) => {
    const [headerConfig, setHeaderConfig] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchHeader = async () => {
            try {
                const data = await BulletinHeaderService.getHeader();
                setHeaderConfig(data);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'en-tête :", error);
            }
        };
        fetchHeader();
    }, []);

    const formatType = bulletinData?.formatType || 'HUMANITES';

    const getSafeWatermarkUrl = (path) => {
        if (!path) return null;
        try {
            return getImageUrl(path);
        } catch (error) {
            console.error("Erreur d'URL pour le filigrane :", error);
            return null;
        }
    };

    const watermarkUrl = getSafeWatermarkUrl(headerConfig?.watermarkLogoPath);

    const exportToPDF = async () => {
        setIsExporting(true);
        
        setTimeout(async () => {
            try {
                const input = document.getElementById('bulletin-pdf-content');
                
                // Amélioration de la capture pour éviter les coupures
                const canvas = await html2canvas(input, {
                    scale: 3, // Haute résolution
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: input.scrollWidth,
                    windowHeight: input.scrollHeight
                });

                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Format A4 strict
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = 210;
                const pdfHeight = 297;
                
                // Ajustement proportionnel de l'image
                const canvasRatio = canvas.height / canvas.width;
                const printHeight = pdfWidth * canvasRatio;

                // Ajouter l'image au PDF sans déborder de la hauteur A4
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, printHeight));
                
                // Téléchargement direct pour éviter le blocage des pop-ups
                const fileName = `Bulletin_${studentInfo?.firstName || 'Eleve'}_${studentInfo?.lastName || ''}.pdf`.trim();
                pdf.save(fileName);
                
                setIsExporting(false);
            } catch (error) {
                console.error("Erreur lors de la génération du PDF :", error);
                // FALLBACK INTELLIGENT 
                alert("La génération d'image a été bloquée par le thème. Le système va ouvrir l'interface d'impression native. Veuillez choisir 'Enregistrer au format PDF' comme destination.");
                setTimeout(() => {
                    window.print();
                    setIsExporting(false);
                }, 100);
            }
        }, 200); // Léger délai supplémentaire pour s'assurer du rendu complet
    };

    return (
        <div className="flex flex-col items-center w-full">
            {/* INJECTION DES STYLES D'IMPRESSION STRICTS ET CORRIGÉS */}
            <style>
                {`
                    @media print {
                        @page { size: A4 portrait; margin: 0; }
                        
                        html, body { 
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important; 
                            background-color: white !important; 
                        }
                        
                        body * { 
                            visibility: hidden; 
                        }
                        
                        #bulletin-pdf-content, #bulletin-pdf-content * { 
                            visibility: visible; 
                        }
                        
                        #bulletin-pdf-content {
                            position: fixed !important; /* Fixed évite les décalages liés au scroll du body */
                            left: 0 !important;
                            top: 0 !important;
                            width: 210mm !important;
                            height: 297mm !important; 
                            margin: 0 !important;
                            padding: 8mm !important;
                            box-sizing: border-box !important;
                            background-color: white !important;
                            color: black !important;
                            page-break-after: avoid !important;
                            page-break-before: avoid !important;
                        }
                        
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        .hidden, [hidden], .print\\:hidden { 
                            display: none !important; 
                        }
                    }
                `}
            </style>

            {/* BARRE D'OUTILS */}
            <div className="w-[210mm] flex justify-end gap-3 mb-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm"
                    title="Imprimer directement"
                >
                    <Printer size={18} />
                    <span>Imprimer</span>
                </button>
                
                <button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-[#0D1B3E] hover:bg-blue-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm"
                    title="Télécharger en PDF"
                >
                    <FileText size={18} />
                    <span>{isExporting ? 'Génération...' : 'PDF'}</span>
                </button>
            </div>

            {/* CONTENEUR DU BULLETIN */}
            <div 
                id="bulletin-pdf-content"
                className={`relative w-[210mm] h-[297mm] mx-auto bg-white p-[8mm] print:m-0 print:p-[8mm] box-border selection:bg-transparent overflow-hidden ${isExporting ? 'shadow-none' : 'shadow-lg print:shadow-none'}`}
            >
                {/* Filigrane */}
                {watermarkUrl && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                        <img 
                            src={watermarkUrl} 
                            alt="Filigrane RDC" 
                            className="w-[65%] h-auto opacity-[0.15] grayscale print:opacity-[0.12] object-contain"
                            style={{
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                            }}
                        />
                    </div>
                )}

                <div className="relative z-10 w-full h-full flex flex-col">
                    <BulletinHeader 
                        header={headerConfig} 
                        studentInfo={studentInfo} 
                        formatType={formatType} 
                    />
                    
                    <div className="w-full bg-black h-[2px] my-2"></div>
                    
                    <div className="flex-grow">
                        {formatType === 'HUMANITES' ? (
                            <BulletinBodyHumanite bulletinData={bulletinData} header={headerConfig} />
                        ) : (
                            <BulletinBody bulletinData={bulletinData} header={headerConfig} />
                        )}
                    </div>

                    <div className="mt-auto">
                        {formatType === '8EME_EB' ? (
                            <BulletinFooter8eme bulletinData={bulletinData} />
                        ) : (
                            <BulletinFooter bulletinData={bulletinData} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentBulletinPrint;