import React from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';                 // Sert pour la 7e et 8e
import BulletinBodyHumanite from './BulletinBodyHumanite'; // Nouveau corps isolé
import BulletinFooter from './BulletinFooter';             // Sert pour la 7e et Humanités
import BulletinFooter8eme from './BulletinFooter8eme';     // Nouveau pied isolé

const BulletinApercuContainer = ({ bulletinData, studentInfo, header }) => {
    if (!bulletinData) return null;

    const { formatType } = bulletinData;

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-4 mx-auto my-4 shadow-lg select-none print:shadow-none print:p-0">
            {/* En-tête unique et partagé */}
            <BulletinHeader header={header} studentInfo={studentInfo} formatType={formatType} />

            {/* Sélection du Corps (Body) */}
            {formatType === 'HUMANITES' ? (
                <BulletinBodyHumanite bulletinData={bulletinData} header={header} />
            ) : (
                <BulletinBody bulletinData={bulletinData} header={header} />
            )}

            {/* Sélection du Pied de page (Footer) */}
            {formatType === '8EME_EB' ? (
                <BulletinFooter8eme bulletinData={bulletinData} />
            ) : (
                <BulletinFooter bulletinData={bulletinData} />
            )}
        </div>
    );
};

export default BulletinApercuContainer;