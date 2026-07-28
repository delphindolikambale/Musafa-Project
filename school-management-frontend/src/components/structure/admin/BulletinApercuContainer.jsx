import React, { useMemo } from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';              // Utilisé pour la 7e et 8e EB
import BulletinBodyHumanite from './BulletinBodyHumanite'; // Utilisé pour les Humanités
import BulletinFooter from './BulletinFooter';            // Utilisé pour la 7e et Humanités
import BulletinFooter8eme from './BulletinFooter8eme';    // Utilisé pour la 8e EB
import { getImageUrl } from '../../../services/api';

const BulletinApercuContainer = ({ bulletinData, studentInfo, header }) => {
    // Résolution sécurisée de l'URL de filigrane (Placée AVANT toute condition de retour)
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

    return (
        <div className="relative w-[210mm] min-h-[297mm] bg-white p-4 mx-auto my-4 shadow-lg select-none print:shadow-none print:p-0 overflow-hidden">
            
            {/* INJECTION DU FILIGRANE (WATERMARK) EN ARRIÈRE-PLAN */}
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

            {/* CONTENEUR PRINCIPAL SUPERPOSÉ */}
            <div className="relative z-10 w-full h-full flex flex-col">
                
                {/* En-tête du Bulletin */}
                <div className="relative z-30 bg-transparent">
                    <BulletinHeader header={header} studentInfo={studentInfo} formatType={formatType} />
                </div>

                {/* Corps de la maquette (Body) */}
                <div className="flex-grow relative z-20 bg-transparent">
                    {formatType === 'HUMANITES' ? (
                        <BulletinBodyHumanite bulletinData={bulletinData} header={header} />
                    ) : (
                        <BulletinBody bulletinData={bulletinData} header={header} />
                    )}
                </div>

                {/* Pied de page du Bulletin (Footer) */}
                <div className="mt-auto relative z-30 bg-transparent">
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

export default BulletinApercuContainer;