// Fichier 2 : src/components/structure/admin/BulletinApercuContainer.jsx
import React, { useMemo, useState } from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';
import BulletinBodyHumanite from './BulletinBodyHumanite'; 
import BulletinFooter from './BulletinFooter';            
import BulletinFooter8eme from './BulletinFooter8eme';    
import { getImageUrl } from '../../../services/api';
import { FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BulletinApercuContainer = ({ bulletinData, studentInfo, header }) => {
    const [isExporting, setIsExporting] = useState(false);

    const watermarkLogoPath = header?.watermarkLogoPath;
    const watermarkUrl = useMemo(() => {
        if (!watermarkLogoPath) return null;
        try {
            return getImageUrl(watermarkLogoPath);
        } catch (error) {
            console.error("Erreur lors de la résolution de l'URL du filigrane :", error);
            return null;
        }
    }, [watermarkLogoPath]);

    if (!bulletinData) return null;

    const { formatType } = bulletinData;

    const exportToPDF = async () => {
        setIsExporting(true);
        
        setTimeout(async () => {
            try {
                const input = document.getElementById('apercu-pdf-content');
                
                const canvas = await html2canvas(input, {
                    scale: 3, 
                    useCORS: true, 
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: input.scrollWidth,
                    windowHeight: input.scrollHeight
                });

                const imgData = canvas.toDataURL('image/png', 1.0);
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = 210;
                const pdfHeight = 297;
                
                const canvasRatio = canvas.height / canvas.width;
                const printHeight = pdfWidth * canvasRatio;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, printHeight));
                
                // Utilisation de .save() pour forcer le téléchargement et contourner les bloqueurs
                const fileName = `Apercu_Bulletin_${studentInfo?.firstName || 'Classe'}.pdf`.trim();
                pdf.save(fileName); 
                
                setIsExporting(false);
            } catch (error) {
                console.error("Erreur lors de la génération du PDF :", error);
                // FALLBACK INTELLIGENT
                alert("La conversion image a échoué. Ouverture de l'impression native : choisissez 'Enregistrer au format PDF'.");
                setTimeout(() => {
                    window.print();
                    setIsExporting(false);
                }, 100);
            }
        }, 200);
    };

    return (
        <div className="flex flex-col items-center w-full my-4">
            
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
                        
                        #apercu-pdf-content, #apercu-pdf-content * { 
                            visibility: visible; 
                        }
                        
                        #apercu-pdf-content {
                            position: fixed !important; 
                            left: 0 !important;
                            top: 0 !important;
                            width: 210mm !important;
                            height: 297mm !important; 
                            margin: 0 !important;
                            padding: 16px !important; /* Correspond au p-4 original */
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
                >
                    <Printer size={18} />
                    <span>Imprimer</span>
                </button>
                
                <button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-[#0D1B3E] hover:bg-blue-950 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm"
                >
                    <FileText size={18} />
                    <span>{isExporting ? 'Génération...' : 'PDF'}</span>
                </button>
            </div>

            {/* CONTENEUR DU BULLETIN APERÇU */}
            <div 
                id="apercu-pdf-content"
                className={`relative w-[210mm] h-[297mm] bg-white p-4 mx-auto select-none overflow-hidden print:m-0 box-border ${isExporting ? 'shadow-none' : 'shadow-lg print:shadow-none'}`}
            >
                {watermarkUrl && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                        <img 
                            src={watermarkUrl} 
                            alt="Filigrane Officiel" 
                            className="w-[65%] h-auto opacity-[0.15] grayscale print:opacity-[0.12] object-contain"
                            style={{
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                            }}
                        />
                    </div>
                )}

                <div className="relative z-10 w-full h-full flex flex-col">
                    <div className="relative z-30 bg-transparent">
                        <BulletinHeader header={header} studentInfo={studentInfo} formatType={formatType} />
                    </div>

                    <div className="w-full bg-black h-[2px] my-2"></div>

                    <div className="flex-grow relative z-20 bg-transparent">
                        {formatType === 'HUMANITES' ? (
                            <BulletinBodyHumanite bulletinData={bulletinData} header={header} />
                        ) : (
                            <BulletinBody bulletinData={bulletinData} header={header} />
                        )}
                    </div>

                    <div className="mt-auto relative z-30 bg-transparent">
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

export default BulletinApercuContainer;