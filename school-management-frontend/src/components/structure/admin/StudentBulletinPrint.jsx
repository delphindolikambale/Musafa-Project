import React, { useEffect, useState } from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';
import BulletinBodyHumanite from './BulletinBodyHumanite';
import BulletinFooter from './BulletinFooter';
import BulletinFooter8eme from './BulletinFooter8eme';
import BulletinHeaderService from "../../../services/admin/bulletinHeaderService";
import { getImageUrl } from '../../../services/api';

const StudentBulletinPrint = ({ bulletinData, studentInfo }) => {
    const [headerConfig, setHeaderConfig] = useState(null);

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

    // Détermination automatique du format pour adapter le corps et le pied du bulletin
    const formatType = bulletinData?.formatType || 'HUMANITES';

    // Génération de l'URL sécurisée pour le filigrane
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

    return (
        /* Format A4 Strict (210mm x 297mm) avec support complet d'impression */
        <div className="relative w-[210mm] min-h-[297mm] mx-auto bg-white p-[8mm] shadow-lg print:shadow-none print:m-0 print:p-[5mm] print:w-[210mm] print:h-[297mm] box-border selection:bg-transparent overflow-hidden">
            
            {/* Filigrane (Watermark) officiel RDC */}
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

            {/* Conteneur principal d'impression */}
            <div className="relative z-10 w-full h-full flex flex-col">
                
                {/* En-tête officiel unifié */}
                <BulletinHeader 
                    header={headerConfig} 
                    studentInfo={studentInfo} 
                    formatType={formatType} 
                />
                
                {/* Séparateur structural */}
                <div className="w-full bg-black h-[2px] my-2"></div>
                
                {/* Corps du bulletin dynamique selon le type de formation */}
                <div className="flex-grow">
                    {formatType === 'HUMANITES' ? (
                        <BulletinBodyHumanite bulletinData={bulletinData} header={headerConfig} />
                    ) : (
                        <BulletinBody bulletinData={bulletinData} header={headerConfig} />
                    )}
                </div>

                {/* Pied de page dynamique (Humanités / 7ème EB vs 8ème EB) */}
                <div className="mt-auto">
                    {formatType === '8EME_EB' ? (
                        <BulletinFooter8eme bulletinData={bulletinData} />
                    ) : (
                        <BulletinFooter bulletinData={bulletinData} />
                    )}
                </div>

            </div>
        </div>
    );
};

export default StudentBulletinPrint;