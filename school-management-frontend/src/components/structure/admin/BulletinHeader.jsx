import React from 'react';
import { getImageUrl } from '../../../services/api';

const BulletinHeader = ({ header, studentInfo, formatType }) => {
    // EXTRACTION STRICTE DES PROPRIÉTÉS DU BulletinHeaderResponseDTO
    const country = header?.country || "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO";
    const ministry = header?.ministry || "MINISTÈRE DE L'ÉDUCATION NATIONALE ET INITIATION À LA NOUVELLE CITOYENNETÉ";
    
    const flagPath = header?.flagImagePath;
    const sealPath = header?.ministryLogoPath;
    
    const educationalProvince = header?.educationalProvince || header?.province || "";
    const city = header?.city || header?.ville || "";
    const communeTerritory = header?.communeTerritory || header?.commune || "";
    const schoolName = header?.schoolName || "";
    const schoolCode = header?.schoolCode || "";

    // Affichage des cases pour les numéros officiels
    const renderCodeBoxes = (codeString, length = 15) => {
        const chars = (codeString || "").padEnd(length, " ").substring(0, length).split("");
        return (
            <div className="flex items-center">
                {chars.map((ch, idx) => (
                    <div 
                        key={idx} 
                        className={`w-[16px] h-[18px] border border-black flex items-center justify-center font-mono text-[11px] font-black bg-white ${idx > 0 ? 'ml-[-1px]' : ''}`}
                    >
                        {ch.trim() !== "" ? ch : ""}
                    </div>
                ))}
            </div>
        );
    };

    const formatBirthDate = (dateVal) => {
        if (!dateVal) return "";
        if (Array.isArray(dateVal)) {
            const [year, month, day] = dateVal;
            return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }
        try {
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('fr-FR');
            }
        } catch (e) {
            console.error("Erreur de formatage date:", e);
        }
        return dateVal;
    };

    const formatGender = (genderVal) => {
        if (!genderVal) return "";
        const g = genderVal.toString().toUpperCase();
        if (g === 'M' || g.includes('MALE') || g.includes('MASC')) return "MASCULIN";
        if (g === 'F' || g.includes('FEM') || g === 'FILLE') return "FÉMININ";
        return g;
    };

    const getSafeImageUrl = (path) => {
        if (!path) return null;
        try {
            return getImageUrl(path);
        } catch (error) {
            console.error("Erreur d'image :", error);
            return null; 
        }
    };

    const generateBulletinTitle = () => {
        const level = studentInfo?.classLevel || header?.className || "";
        const year = studentInfo?.schoolYear || header?.academicYear || "";
        
        if (formatType === 'HUMANITES') {
            return `BULLETIN DE LA ${level} HUMANITÉS ANNÉE SCOLAIRE ${year}`.toUpperCase();
        } else {
            return `BULLETIN DE LA ${level} CYCLE TERMINAL DE L'ÉDUCATION DE BASE (CTEB) ANNÉE SCOLAIRE ${year}`.toUpperCase();
        }
    };

    return (
        <div className="w-full text-black font-sans text-[10px] leading-tight print:text-black">
            
            {/* 1. Drapeau, Titres, Sceau */}
            <div className="flex justify-between items-center mb-2 px-1">
                <div className="w-[90px] flex items-center justify-start">
                    {flagPath ? (
                        <img 
                            src={getSafeImageUrl(flagPath)} 
                            alt="Drapeau RDC" 
                            className="w-[80px] h-[50px] object-contain" 
                        />
                    ) : (
                        <div className="w-[80px] h-[50px] border border-black bg-gray-50 flex items-center justify-center text-[8px] font-bold text-gray-400">DRAP.</div>
                    )}
                </div>
                
                <div className="flex-1 text-center flex flex-col items-center justify-center">
                    <h1 className="font-serif font-black text-[15px] uppercase tracking-wider text-black">
                        {country}
                    </h1>
                    <p className="font-serif text-[12px] uppercase font-bold tracking-normal mt-1 text-black">
                        {ministry}
                    </p>
                </div>

                <div className="w-[90px] flex items-center justify-end">
                    {sealPath ? (
                        <img 
                            src={getSafeImageUrl(sealPath)} 
                            alt="Sceau National" 
                            className="w-[60px] h-[60px] object-contain" 
                        />
                    ) : (
                        <div className="w-[60px] h-[60px] border border-black rounded-full flex items-center justify-center text-[8px] font-bold text-gray-400">SCEAU</div>
                    )}
                </div>
            </div>

            {/* BORDURE DU BULLETIN */}
            <div className="border-[1.5px] border-black border-b-0 bg-white">
                
                {/* 2. N° ID. */}
                <div className="flex items-center border-b-[1.5px] border-black">
                    <div className="font-black text-[12px] px-2 py-1.5 border-r-[1.5px] border-black min-w-[60px] bg-white">
                        N° ID.
                    </div>
                    <div className="flex-1 flex items-center px-2 bg-white">
                        {renderCodeBoxes(studentInfo?.nationalId || "", 27)}
                    </div>
                </div>

                {/* 3. PROVINCE EDUCATIONNELLE */}
                <div className="flex items-end px-2 py-1.5 border-b-[1.5px] border-black bg-white">
                    <span className="w-[170px] font-bold uppercase shrink-0">PROVINCE EDUCATIONNELLE</span>
                    <span className="mx-1 font-bold">:</span>
                    <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                        {educationalProvince}
                    </span>
                </div>

                {/* 4. Coordonnées École & Élève */}
                <div className="flex border-b-[1.5px] border-black bg-white">
                    
                    {/* Bloc Gauche : École */}
                    <div className="w-1/2 border-r-[1.5px] border-black p-2 space-y-1.5 flex flex-col justify-between">
                        <div className="flex items-end">
                            <span className="w-[170px] font-bold uppercase shrink-0">VILLE</span>
                            <span className="mx-1 font-bold">:</span>
                            <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                                {city}
                            </span>
                        </div>
                        <div className="flex items-end">
                            <span className="w-[170px] font-bold uppercase shrink-0">COMMUNE / TERRITOIRE <sup className="text-[7px] leading-none">(1)</sup></span>
                            <span className="mx-1 font-bold">:</span>
                            <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                                {communeTerritory}
                            </span>
                        </div>
                        <div className="flex items-end">
                            <span className="w-[170px] font-bold uppercase shrink-0">ECOLE</span>
                            <span className="mx-1 font-bold">:</span>
                            <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                                {schoolName}
                            </span>
                        </div>
                        <div className="flex items-center mt-auto pt-1">
                            <span className="w-[170px] font-bold uppercase shrink-0">CODE</span>
                            <span className="mx-1 font-bold">:</span>
                            <div className="flex-1">
                                {renderCodeBoxes(schoolCode, 11)}
                            </div>
                        </div>
                    </div>

                    {/* Bloc Droite : Élève */}
                    <div className="w-1/2 p-2 space-y-1.5 flex flex-col justify-between">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-1 items-end mr-3">
                                <span className="w-[60px] font-bold uppercase shrink-0">ELEVE</span>
                                <span className="mx-1 font-bold">:</span>
                                <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                                    {studentInfo?.fullName || `${studentInfo?.lastName || ""} ${studentInfo?.firstName || ""}`.trim()}
                                </span>
                            </div>
                            <div className="flex items-end shrink-0 w-[70px]">
                                <span className="font-bold uppercase mr-1">SEXE :</span>
                                <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 text-center pb-0.5">
                                    {formatGender(studentInfo?.gender)}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-1 items-end mr-3">
                                <span className="w-[60px] font-bold uppercase shrink-0">NE(E) A</span>
                                <span className="mx-1 font-bold">:</span>
                                <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                                    {studentInfo?.birthPlace || ""}
                                </span>
                            </div>
                            <div className="flex items-end shrink-0 w-[100px]">
                                <span className="font-bold uppercase mr-1">LE :</span>
                                <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 text-center pb-0.5">
                                    {formatBirthDate(studentInfo?.birthDate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <span className="w-[60px] font-bold uppercase shrink-0">CLASSE</span>
                            <span className="mx-1 font-bold">:</span>
                            <span className="uppercase font-bold flex-1 border-b border-dotted border-black/60 pb-0.5 whitespace-nowrap overflow-hidden">
                                {studentInfo?.classLevel || header?.className || ""}
                            </span>
                        </div>
                        <div className="flex items-center mt-auto pt-1">
                            <span className="w-[60px] font-bold uppercase shrink-0">N° PERM.</span>
                            <span className="mx-1 font-bold">:</span>
                            <div className="flex-1">
                                {renderCodeBoxes(studentInfo?.permanentNumber, 15)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Titre officiel */}
                <div className="text-center py-2 bg-white border-b-[1.5px] border-black">
                    <span className="font-sans font-black text-[13px] uppercase tracking-wide">
                        {generateBulletinTitle()}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default BulletinHeader;