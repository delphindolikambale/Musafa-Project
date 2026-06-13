import React from 'react';

const BulletinHeader = ({ header, studentInfo, formatType }) => {
    // Générateur de cases à cocher / caractères pour les codes officiels avec dimensions exactes
    const renderCodeBoxes = (codeString, length = 15) => {
        const chars = (codeString || "").padEnd(length, " ").substring(0, length).split("");
        return (
            <div className="flex border-t border-l border-black bg-transparent">
                {chars.map((ch, idx) => (
                    <span key={idx} className="w-[14px] h-[16px] border-b border-r border-black text-center font-mono text-[11px] leading-none flex items-center justify-center font-bold">
                        {ch !== " " ? ch : ""}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full text-black font-serif text-[10px] leading-tight print:text-black">
            
            {/* 1. Bloc Supérieur : Drapeau, Ministère, Armoiries */}
            <div className="flex justify-between items-center mb-1">
                <div className="w-24">
                    {header?.flagImagePath ? (
                        <img src={`http://localhost:8080/${header.flagImagePath}`} alt="Drapeau RDC" className="w-[70px] h-[45px] border border-black object-cover" />
                    ) : (
                        <div className="w-[70px] h-[45px] border border-black bg-gray-100 flex items-center justify-center text-[8px]">DRAP.</div>
                    )}
                </div>
                
                <div className="flex-1 text-center">
                    <h1 className="font-bold text-[14px] uppercase tracking-wide">
                        {header?.country || "REPUBLIQUE DEMOCRATIQUE DU CONGO"}
                    </h1>
                    <p className="text-[12px] uppercase font-bold tracking-tight mt-0.5">
                        {header?.ministry || "MINISTERE DE L'EDUCATION NATIONALE ET NOUVELLE CITOYENNETE"}
                    </p>
                </div>

                <div className="w-24 flex justify-end">
                    {header?.ministryLogoPath ? (
                        <img src={`http://localhost:8080/${header.ministryLogoPath}`} alt="Sceau National" className="w-[50px] h-[50px] object-contain" />
                    ) : (
                        <div className="w-[50px] h-[50px] border border-dashed border-black rounded-full flex items-center justify-center text-[8px]">LOGO</div>
                    )}
                </div>
            </div>

            {/* BORDURE PRINCIPALE GLOBALE ENGLOBANT LES RENSEIGNEMENTS ET LE TITRE DU BULLETIN */}
            <div className="border-[1.5px] border-black border-b-0 bg-white">
                
                {/* 2. Ligne du Numéro d'Identifiant National (N° ID.) */}
                <div className="flex items-center gap-2 border-b-[1.5px] border-black p-0.5">
                    <span className="font-bold text-[11px] shrink-0 ml-1">N° ID.</span>
                    {renderCodeBoxes(studentInfo?.matricule, 27)}
                </div>

                {/* 3. Grille Bilatérale de Renseignements */}
                <div className="flex border-b-[1.5px] border-black">
                    
                    {/* Bloc Gauche : Coordonnées de l'Établissement */}
                    <div className="w-1/2 border-r-[1.5px] border-black p-1 space-y-1">
                        <div className="flex items-end">
                            <span className="w-40 font-bold uppercase">PROVINCE EDUCATIONNELLE</span>
                            <span>: <span className="uppercase font-bold">{header?.educationalProvince || "..................................................."}</span></span>
                        </div>
                        <div className="flex items-end">
                            <span className="w-40 font-bold uppercase">VILLE</span>
                            <span>: <span className="uppercase font-bold">{header?.city || "..................................................."}</span></span>
                        </div>
                        <div className="flex items-end">
                            <span className="w-40 font-bold uppercase">COMMUNE / TERRITOIRE <sup className="text-[7px]">(1)</sup></span>
                            <span>: <span className="uppercase font-bold">{header?.communeTerritory || "..................................................."}</span></span>
                        </div>
                        <div className="flex items-end">
                            <span className="w-40 font-bold uppercase">ECOLE</span>
                            <span>: <span className="uppercase font-bold">{header?.schoolName || "..................................................."}</span></span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-40 font-bold uppercase">CODE</span>
                            <div className="flex items-center">
                                <span className="mr-1">:</span>
                                {renderCodeBoxes(header?.schoolCode, 11)}
                            </div>
                        </div>
                    </div>

                    {/* Bloc Droite : Identification de l'Élève */}
                    <div className="w-1/2 p-1 space-y-1">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-1">
                                <span className="w-16 font-bold uppercase">ELEVE</span>
                                <span>: <span className="uppercase font-bold">{studentInfo?.lastName} {studentInfo?.postName} {studentInfo?.firstName}</span></span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-bold uppercase mr-1">SEXE :</span>
                                <span className="uppercase font-bold">{studentInfo?.gender || "......"}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-1">
                                <span className="w-16 font-bold uppercase">NE(E) A</span>
                                <span>: <span className="uppercase font-bold">{studentInfo?.birthPlace || "............................................"}</span></span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-bold uppercase mr-1">LE :</span>
                                <span className="uppercase font-bold">{studentInfo?.birthDate || "..../..../........"}</span>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <span className="w-16 font-bold uppercase">CLASSE</span>
                            <span>: <span className="uppercase font-bold">{studentInfo?.classLevel || "..........................................................."}</span></span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-16 font-bold uppercase">N° PERM.</span>
                            <div className="flex items-center">
                                <span className="mr-1">:</span>
                                {renderCodeBoxes(studentInfo?.permanentNumber, 15)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Libellé Central du Bulletin (Titre continu) */}
                <div className="text-center p-1 bg-white border-b-[1.5px] border-black">
                    <span className="font-sans font-black text-[11px] uppercase tracking-wide">
                        BULLETIN DE LA {studentInfo?.classLevel || ".........."} {studentInfo?.section ? `${studentInfo.section}` : "CYCLE TERMINAL DE L'EDUCATION DE BASE (CTEB)"} ANNEE SCOLAIRE {studentInfo?.schoolYear || "2024 - 2025"}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default BulletinHeader;