import React, { useEffect, useState } from 'react';
import BulletinHeader from './BulletinHeader';
import BulletinBody from './BulletinBody';
import BulletinFooter from './BulletinFooter';
import BulletinHeaderService from "../../../services/admin/bulletinHeaderService";

const StudentBulletinPrint = ({ bulletinData, studentInfo }) => {
    const [headerConfig, setHeaderConfig] = useState(null);

    useEffect(() => {
        const fetchHeader = async () => {
            try {
                const data = await BulletinHeaderService.getHeader();
                setHeaderConfig(data);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'entête :", error);
            }
        };
        fetchHeader();
    }, []);

    // Détermination automatique du format pour adapter la mise en page générale
    const formatType = bulletinData?.formatType || 'HUMANITES';

    return (
        /* Format A4 Strict (210mm x 297mm) - Respect des marges officielles */
        <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-[8mm] shadow-lg print:shadow-none print:m-0 print:p-[5mm] print:w-[210mm] print:h-[297mm] box-border selection:bg-transparent">
            
            {/* En-tête officiel unifié */}
            <BulletinHeader 
                header={headerConfig} 
                studentInfo={studentInfo} 
                formatType={formatType} 
            />
            
            {/* Séparateur structural */}
            <div className="w-full bg-black h-[2px] my-2"></div>
            
            {/* Grille principale des notes et bilans */}
            <BulletinBody bulletinData={bulletinData} />

            {/* Pied de page et signatures */}
            <BulletinFooter bulletinData={bulletinData} />

        </div>
    );
};

export default StudentBulletinPrint;