import React from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';                // Sert pour la 7e et 8e
import BulletinBodyHumanite from './BulletinBodyHumanite'; // Nouveau corps isolé
import BulletinFooter from './BulletinFooter';            // Sert pour la 7e et Humanités
import BulletinFooter8eme from './BulletinFooter8eme';    // Nouveau pied isolé
import { getImageUrl } from '../../../services/api';      // ✅ ADAPTATION : Utilisation de l'outil global

const BulletinApercuContainer = ({ bulletinData, studentInfo, header }) => {
    if (!bulletinData) return null;

    const { formatType } = bulletinData;

    // ✅ ADAPTATION : Détermination de l'URL absolue sécurisée pour le filigrane
    const getSafeWatermarkUrl = (path) => {
        if (!path) return null;
        try {
            return getImageUrl(path);
        } catch (error) {
            console.error("Erreur d'URL pour le filigrane :", error);
            return null;
        }
    };

    const watermarkUrl = getSafeWatermarkUrl(header?.watermarkLogoPath);

    return (
        <div className="relative w-[210mm] min-h-[297mm] bg-white p-4 mx-auto my-4 shadow-lg select-none print:shadow-none print:p-0 overflow-hidden">
            
            {/* INCORPORATION DU FILIGRANE (WATERMARK) EN ARRIÈRE-PLAN */}
            {watermarkUrl && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    <img 
                        src={watermarkUrl} 
                        alt="Filigrane RDC" 
                        // Taille à 65% pour correspondre au design du modèle, centré parfaitement
                        className="w-[65%] h-auto opacity-[0.15] grayscale print:opacity-[0.12] object-contain"
                        style={{
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        }}
                    />
                </div>
            )}

            {/* Conteneur principal superposé au filigrane pour garantir l'interactivité et la lisibilité */}
            <div className="relative z-10 w-full h-full flex flex-col">
                
                {/* En-tête unique et partagé - Sécurisé avec z-index supérieur */}
                <div className="relative z-30 bg-transparent">
                    <BulletinHeader header={header} studentInfo={studentInfo} formatType={formatType} />
                </div>

                {/* Sélection du Corps (Body) - Isolé en position relative pour bloquer les débordements absolus */}
                <div className="flex-grow relative z-20 bg-transparent">
                    {formatType === 'HUMANITES' ? (
                        <BulletinBodyHumanite bulletinData={bulletinData} header={header} />
                    ) : (
                        <BulletinBody bulletinData={bulletinData} header={header} />
                    )}
                </div>

                {/* Sélection du Pied de page (Footer) - Sécurisé également */}
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